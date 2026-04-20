// queryPipeline.js
// Every @Neo mention or autonomous trigger runs through this pipeline.
// Steps: INTENT CLASSIFY → LAYER SELECT → RETRIEVE → ASSEMBLE → LLM CALL → RESPOND

import { callLLM } from "./llm.js"

// ── Intent classifier ─────────────────────────────────────────────────────

export function classifyIntent(query) {
  const q = query.toLowerCase()

  // Extract known org entities from the query
  const knownEntities = [
    "shreyash", "jay", "moksh",
    "orion", "agastya", "threadverse", "neo",
    "linucb", "pipeline", "iisg", "c01", "c15",
    "scientech", "nivo", "pocketbase", "litellm",
    "decision", "task", "thread", "space",
  ]
  const entities = knownEntities.filter(e => q.includes(e))

  // Classify by pattern matching
  if (q.match(/who owns|who is responsible|who leads|whose|owner of/))
    return { type: "ownership", entities }

  if (q.match(/decided|decision|what did we decide|resolved|conclusion|agreed/))
    return { type: "decision", entities }

  if (q.match(/status|progress|what.*happen|in flight|blocked|shipped|update/))
    return { type: "status", entities }

  if (q.match(/architect|stack|how.*built|tech|infra|design|system|database|deploy/))
    return { type: "architecture", entities }

  if (q.match(/who is|team|people|roles|members|founders|cto|ceo|coo/))
    return { type: "team", entities }

  if (q.match(/recent|last week|this week|yesterday|latest|today/))
    return { type: "recent_activity", entities }

  if (q.match(/risk|stale|stuck|blocked|overdue|no.*update/))
    return { type: "risk", entities }

  return { type: "general", entities }
}

// ── Layer selector ────────────────────────────────────────────────────────
// Returns which knowledge layer to query based on intent.
// Maps exactly to the retrieval priority stack in your architecture doc.

export function selectLayer(intent) {
  switch (intent.type) {
    case "ownership":      return "orggraph"        // who owns what — live state
    case "team":           return "pageindex"        // static team knowledge
    case "decision":       return "pageindex"        // decisions indexed in tree
    case "architecture":   return "pageindex"        // static docs
    case "status":         return "orggraph"         // live project state
    case "recent_activity":return "chatindex"        // recent threads (7-30 days)
    case "risk":           return "orggraph"         // stale/blocked detection
    default:               return "pageindex"        // default to static knowledge
  }
}

// ── PageIndex traversal (tree-based retrieval) ────────────────────────────

export function traversePageIndex(pageIndexTree, intent) {
  if (!pageIndexTree || !pageIndexTree.children) return null

  const q = (intent.entities.join(" ") + " " + intent.type).toLowerCase()
  const allNodes = flattenTree(pageIndexTree)

  // Score nodes by relevance to the query
  const scored = allNodes
    .map(node => {
      let score = 0
      const tags = node.tags || []
      const title = (node.title || "").toLowerCase()
      const content = (node.content || "").toLowerCase()
      const summary = (node.summary || "").toLowerCase()

      for (const tag of tags) {
        if (q.includes(tag)) score += 10
      }
      for (const word of title.split(/\s+/)) {
        if (word.length > 3 && q.includes(word)) score += 6
      }
      for (const word of summary.split(/\s+/)) {
        if (word.length > 4 && q.includes(word)) score += 3
      }

      // Priority boost
      if (node.priority === "absolute") score += 5
      if (node.priority === "high") score += 2

      return { node, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  if (scored.length === 0) return null

  return {
    nodes: scored.map(s => s.node),
    context: scored
      .map(s => `[${s.node.title} — priority: ${s.node.priority}]\n${s.node.content}`)
      .join("\n\n---\n\n"),
    citations: scored.map(s => s.node.id),
  }
}

function flattenTree(node, acc = []) {
  acc.push(node)
  if (node.children) node.children.forEach(child => flattenTree(child, acc))
  return acc
}

// ── Context assembler ─────────────────────────────────────────────────────
// Combines knowledge from the selected layer + Org Graph summary + thread history

export function assembleContext({
  intent,
  pageIndexResult,
  orgGraph,
  chatIndexResult,
  recentMessages = [],
}) {
  const parts = []

  // 1. PageIndex context (static org knowledge)
  if (pageIndexResult?.context) {
    parts.push(`RETRIEVED ORG KNOWLEDGE (intent: ${intent.type}):\n${pageIndexResult.context}`)
    parts.push(`SOURCE NODES: ${pageIndexResult.citations.join(" → ")}`)
  }

  // 2. ChatIndex context (recent conversation history)
  if (chatIndexResult) {
    parts.push(`RECENT THREAD CONTEXT (last 30 days):\n${chatIndexResult}`)
  }

  // 3. Org Graph snapshot (always injected — live state)
  if (orgGraph) {
    parts.push(orgGraph.getSummary())
  }

  // 4. Raw recent messages from the active thread (last 5)
  if (recentMessages.length > 0) {
    const recent = recentMessages
      .slice(-5)
      .map(m => `${m.author}: ${m.content}`)
      .join("\n")
    parts.push(`ACTIVE THREAD (last ${Math.min(5, recentMessages.length)} messages):\n${recent}`)
  }

  return parts.join("\n\n" + "─".repeat(50) + "\n\n")
}

// ── Full query pipeline ───────────────────────────────────────────────────

export async function runQueryPipeline({
  query,
  pageIndexTree,
  chatIndex,
  orgGraph,
  threadMessages = [],
  triggerType = "mention",
}) {
  // Step 1: Classify intent
  const intent = classifyIntent(query)
  console.log(`[Pipeline] intent: ${intent.type} | entities: [${intent.entities.join(", ")}]`)

  // Step 2: Select layer
  const layer = selectLayer(intent)
  console.log(`[Pipeline] layer: ${layer}`)

  // Step 3: Retrieve from the right layer
  let pageIndexResult = null
  let chatIndexResult = null

  if (layer === "pageindex" || layer === "chatindex") {
    // Always try PageIndex for static knowledge
    pageIndexResult = traversePageIndex(pageIndexTree, intent)
  }

  if (layer === "chatindex" && chatIndex) {
    chatIndexResult = chatIndex.query(intent.entities)
  }

  // Step 4: Assemble full context
  const context = assembleContext({
    intent,
    pageIndexResult,
    orgGraph,
    chatIndexResult,
    recentMessages: threadMessages,
  })

  // Step 5: LLM call
  const response = await callLLM({ query, context, intent })

  // Step 6: Return result with metadata for neo_log
  return {
    content: response,
    intent: intent.type,
    layer_used: layer,
    entities: intent.entities,
    citations: pageIndexResult?.citations || [],
    trigger_type: triggerType,
  }
}