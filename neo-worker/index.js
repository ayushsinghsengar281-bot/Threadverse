// index.js
// Neo Worker — entry point.
// This process runs permanently alongside the ThreadVerse API.
// It is NOT serverless. It requires persistent in-memory state.
//
// Startup sequence:
//   1. Load org.yaml into memory
//   2. Load PageIndex tree (built by pageindex/build.py)
//   3. Build ChatIndex from PocketBase (last 30 days)
//   4. Build initial Org Graph from org.yaml + PocketBase state
//   5. Subscribe to PocketBase Realtime
//   6. Start ambient monitoring loop

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import yaml from "js-yaml"
import PocketBase from "pocketbase"
import cron from "node-cron"

import { OrgGraph } from "./src/orgGraph.js"
import { ChatIndex } from "./src/chatIndex.js"
import { EventConsumer } from "./src/eventConsumer.js"
import { runQueryPipeline } from "./src/queryPipeline.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Config — set these in your .env or environment ────────────────────────
const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090"
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || "admin@cogneoverse.com"
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || ""

// ── Boot ──────────────────────────────────────────────────────────────────

async function start() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("  Neo Worker starting up...")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

  // ── Step 1: Load org.yaml ─────────────────────────────────────────────
  console.log("[Boot] Loading org.yaml...")
  const orgYamlPath = path.join(__dirname, "data", "org.yaml")
  let orgData = {}
  try {
    const raw = fs.readFileSync(orgYamlPath, "utf8")
    orgData = yaml.load(raw)
    console.log(`[Boot] org.yaml loaded — ${orgData.team?.length || 0} members, ${orgData.projects?.length || 0} projects, ${orgData.decisions?.length || 0} decisions`)
  } catch (err) {
    console.error("[Boot] Failed to load org.yaml:", err.message)
    console.error("       Create neo-worker/data/org.yaml before starting the worker.")
    process.exit(1)
  }

  // ── Step 2: Load PageIndex tree ───────────────────────────────────────
  console.log("[Boot] Loading PageIndex tree...")
  const treeJsonPath = path.join(__dirname, "pageindex", "tree.json")
  let pageIndexTree = null
  try {
    const raw = fs.readFileSync(treeJsonPath, "utf8")
    pageIndexTree = JSON.parse(raw)
    console.log(`[Boot] PageIndex tree loaded — root: "${pageIndexTree?.title}"`)
  } catch (err) {
    console.warn("[Boot] PageIndex tree not found or invalid — Neo will use org.yaml only")
    console.warn("       Run pageindex/build.py to generate tree.json")
    // Not fatal — Neo falls back to org.yaml knowledge
  }

  // ── Step 3: Connect PocketBase ────────────────────────────────────────
  console.log(`[Boot] Connecting to PocketBase at ${POCKETBASE_URL}...`)
  const pb = new PocketBase(POCKETBASE_URL)

  // Authenticate as admin so Neo can read/write all collections
  let pbConnected = false
  if (PB_ADMIN_PASSWORD) {
    try {
      await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD)
      pbConnected = true
      console.log("[Boot] PocketBase authenticated")
    } catch (err) {
      console.warn("[Boot] PocketBase auth failed:", err.message)
      console.warn("       Set PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD in your .env")
    }
  } else {
    console.warn("[Boot] PB_ADMIN_PASSWORD not set — running without PocketBase (limited mode)")
  }

  // ── Step 4: Build ChatIndex ───────────────────────────────────────────
  console.log("[Boot] Building ChatIndex...")
  const chatIndex = new ChatIndex()
  if (pbConnected) {
    await chatIndex.build(pb, { days: 30 })
  } else {
    console.warn("[Boot] Skipping ChatIndex build — no PocketBase connection")
  }

  // ── Step 5: Build Org Graph ───────────────────────────────────────────
  console.log("[Boot] Building Org Graph...")
  const orgGraph = new OrgGraph()
  await orgGraph.buildFromYaml(orgData)
  if (pbConnected) {
    await orgGraph.loadFromPocketBase(pb)
  }

  // ── Step 6: Subscribe to PocketBase Realtime ──────────────────────────
  const eventConsumer = new EventConsumer({
    pageIndexTree,
    chatIndex,
    orgGraph,
    pb,
  })

  if (pbConnected) {
    console.log("[Boot] Subscribing to PocketBase Realtime...")
    const collections = ["messages", "decisions", "threads", "tasks", "updates"]

    for (const col of collections) {
      pb.collection(col).subscribe("*", async (event) => {
        try {
          await eventConsumer.handle(event)
          // Also update ChatIndex on new messages
          if (col === "messages" && event.action === "create") {
            chatIndex.addMessage(event.record.thread_id, {
              author: event.record.is_neo ? "Neo" : event.record.author_id,
              content: event.record.content,
              created: event.record.created,
              is_neo: event.record.is_neo,
            })
          }
        } catch (err) {
          console.error("[Realtime] Error handling event:", err.message)
        }
      })
    }
    console.log(`[Boot] Subscribed to: ${collections.join(", ")}`)
  }

  // ── Step 7: Expose HTTP endpoint for the Next.js frontend ────────────
  // The Next.js route.ts calls this endpoint instead of OpenRouter directly
  await startHttpServer({ pageIndexTree, chatIndex, orgGraph })

  // ── Step 8: Start ambient monitoring loop ─────────────────────────────
  startAmbientLoop({ orgGraph, eventConsumer, pb, pbConnected })

  // ── Step 9: Schedule Org Graph snapshot + ChatIndex rebuild ──────────
  if (pbConnected) {
    // Save Org Graph snapshot every 10 minutes
    cron.schedule("*/10 * * * *", async () => {
      try {
        await pb.collection("neo_org_graph").create({
          snapshot: JSON.stringify(orgGraph.serialise()),
          version: orgGraph.version,
        })
        console.log(`[Cron] Org Graph snapshot saved (v${orgGraph.version})`)
      } catch (err) {
        console.error("[Cron] Snapshot failed:", err.message)
      }
    })

    // Rebuild ChatIndex nightly at 2am
    cron.schedule("0 2 * * *", async () => {
      console.log("[Cron] Rebuilding ChatIndex...")
      await chatIndex.build(pb, { days: 30 })
    })
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("  Neo Worker is live.")
  console.log(`  PocketBase: ${pbConnected ? "connected" : "OFFLINE (limited mode)"}`)
  console.log(`  PageIndex: ${pageIndexTree ? "loaded" : "not found — using org.yaml only"}`)
  console.log(`  Org Graph: ${orgGraph.nodes.size} nodes`)
  console.log(`  ChatIndex: ${chatIndex.threads.size} threads`)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

// ── HTTP server — Next.js frontend calls this ─────────────────────────────

async function startHttpServer({ pageIndexTree, chatIndex, orgGraph }) {
  const { createServer } = await import("http")
  const PORT = process.env.NEO_WORKER_PORT || 3001

  const server = createServer(async (req, res) => {
    if (req.method !== "POST" || req.url !== "/neo/query") {
      res.writeHead(404)
      res.end("Not found")
      return
    }

    let body = ""
    req.on("data", chunk => (body += chunk))
    req.on("end", async () => {
      try {
        const { messages } = JSON.parse(body)
        const lastUser = [...messages].reverse().find(m => m.role === "user")
        const query = lastUser?.content || ""

        const result = await runQueryPipeline({
          query,
          pageIndexTree,
          chatIndex,
          orgGraph,
          triggerType: "mention",
        })

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ content: result.content }))
      } catch (err) {
        console.error("[HTTP] Error:", err.message)
        res.writeHead(500)
        res.end(JSON.stringify({ error: err.message }))
      }
    })
  })

  server.listen(PORT, () => {
    console.log(`[Boot] Neo HTTP endpoint listening on port ${PORT}`)
  })
}

// ── Ambient monitoring loop ───────────────────────────────────────────────
// Runs every 15 minutes. Proactively checks for situations Neo should surface.
// This is Layer 2 (Active) from your architecture doc.

function startAmbientLoop({ orgGraph, eventConsumer, pb, pbConnected }) {
  const INTERVAL_MS = 15 * 60 * 1000 // 15 minutes

  const runChecks = async () => {
    console.log("[Ambient] Running checks...")

    // Check 1: Stale threads — open 5+ days with no resolution
    const staleThreads = orgGraph.getStaleThreads({ days: 5 })
    if (staleThreads.length > 0) {
      console.log(`[Ambient] ${staleThreads.length} stale thread(s) detected`)
      // TODO: Post nudge to thread owner when PocketBase is connected
    }

    // Check 2: Blocked tasks
    const blockedTasks = orgGraph.getBlockedTasks()
    if (blockedTasks.length > 0) {
      console.log(`[Ambient] ${blockedTasks.length} blocked task(s) detected`)
    }
  }

  // Run immediately on startup, then every 15 minutes
  runChecks()
  setInterval(runChecks, INTERVAL_MS)
  console.log("[Boot] Ambient monitoring loop started (15 min interval)")
}

// ── Start ─────────────────────────────────────────────────────────────────
start().catch(err => {
  console.error("[Boot] Fatal error:", err)
  process.exit(1)
})