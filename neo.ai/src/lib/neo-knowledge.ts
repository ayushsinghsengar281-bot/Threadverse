// neo-knowledge.ts
// This is Neo's static org knowledge — your PageIndex equivalent.
// Update this file whenever org structure, projects, or decisions change.
// Priority: this data overrides anything the LLM "thinks" it knows.

export interface KnowledgeNode {
  id: string
  title: string
  summary: string
  content: string
  tags: string[]
  priority: "absolute" | "high" | "medium" | "low"
  children?: KnowledgeNode[]
}

export const ORG_KNOWLEDGE: KnowledgeNode = {
  id: "root",
  title: "Cogneoverse Org",
  summary: "Root knowledge node for Cogneoverse organisation",
  content: "",
  tags: ["org", "root"],
  priority: "absolute",
  children: [
    {
      id: "team",
      title: "Team",
      summary: "Cogneoverse founding team — roles, ownership, responsibilities",
      content: "Cogneoverse is a 3-person founding team building ThreadVerse and Neo.",
      tags: ["team", "people", "roles", "ownership"],
      priority: "absolute",
      children: [
        {
          id: "shreyash-dange",
          title: "Shreyash Dange",
          summary: "CTO and Co-founder. Owns all technical architecture.",
          content: `Name: Shreyash Dange
Role: CTO, Co-founder
Owns: Orion IDE, Orion CLI architecture, ThreadVerse architecture, Neo architecture
Responsibilities: All technical decisions, system design, infrastructure, AI/ML systems
Key projects: Orion CLI pipeline (C01–C15), LinUCB RL layer, ThreadVerse + Neo`,
          tags: ["shreyash", "cto", "cofounder", "technical", "orion", "threadverse"],
          priority: "absolute",
        },
        {
          id: "jay-suryawanshi",
          title: "Jay Suryawanshi",
          summary: "CEO and Co-founder. Owns strategy and Agastya GTM.",
          content: `Name: Jay Suryawanshi
Role: CEO, Co-founder
Owns: Company strategy, Agastya GTM (go-to-market), business direction
Responsibilities: Strategic decisions, partnerships, revenue, Agastya product direction`,
          tags: ["jay", "ceo", "cofounder", "strategy", "agastya", "gtm"],
          priority: "absolute",
        },
        {
          id: "moksh-bhayre",
          title: "Moksh Bhayre",
          summary: "COO and Co-founder. Owns operations and Agastya execution.",
          content: `Name: Moksh Bhayre
Role: COO, Co-founder
Owns: Operations, Agastya execution, day-to-day coordination
Responsibilities: Operational efficiency, Agastya delivery pipeline, cross-team coordination`,
          tags: ["moksh", "coo", "cofounder", "operations", "agastya"],
          priority: "absolute",
        },
      ],
    },
    {
      id: "projects",
      title: "Projects",
      summary: "All active Cogneoverse projects",
      content: "Cogneoverse has three active projects: Orion CLI, Agastya, and ThreadVerse.",
      tags: ["projects"],
      priority: "high",
      children: [
        {
          id: "orion-cli",
          title: "Orion CLI",
          summary: "AI-powered CLI with a 15-stage pipeline and LinUCB RL reward system",
          content: `Project: Orion CLI
Owner: Shreyash Dange (CTO)
Status: Active development
Description: AI-powered command-line interface with a 15-stage processing pipeline (C01–C15), a LinUCB reinforcement learning reward signal layer, and the IISG Contract System.`,
          tags: ["orion", "cli", "pipeline", "rl", "linucb"],
          priority: "high",
          children: [
            {
              id: "orion-pipeline",
              title: "Orion CLI Pipeline",
              summary: "15-stage processing pipeline C01 through C15",
              content: `The Orion CLI uses a 15-stage pipeline labelled C01 through C15.
Each stage processes the input progressively — from raw command parsing (C01) through context enrichment, RL scoring, contract validation, and final output synthesis (C15).
Owner: Shreyash Dange`,
              tags: ["pipeline", "c01", "c15", "stages", "orion"],
              priority: "high",
            },
            {
              id: "linucb-rl",
              title: "LinUCB RL Layer",
              summary: "Reinforcement learning reward signal using LinUCB algorithm",
              content: `The LinUCB RL Layer is the reward signal design for Orion CLI.
LinUCB (Linear Upper Confidence Bound) is a contextual bandit algorithm used to optimise CLI response quality over time.
It scores outputs at each pipeline stage and feeds back reward signals to improve future runs.
Owner: Shreyash Dange`,
              tags: ["linucb", "rl", "reinforcement learning", "reward", "bandit", "orion"],
              priority: "high",
            },
            {
              id: "iisg-contract",
              title: "IISG Contract System",
              summary: "Contract validation system within Orion CLI",
              content: `The IISG Contract System handles contract-based validation within the Orion CLI pipeline.
It enforces structured output contracts at key pipeline stages.
Owner: Shreyash Dange`,
              tags: ["iisg", "contract", "validation", "orion"],
              priority: "medium",
            },
          ],
        },
        {
          id: "agastya",
          title: "Agastya",
          summary: "Cogneoverse's second product — GTM and ML roadmap owned by Jay and Moksh",
          content: `Project: Agastya
Owner: Jay Suryawanshi (GTM/strategy), Moksh Bhayre (execution)
Status: Active — GTM in progress
Description: Agastya is Cogneoverse's second product. Jay owns the go-to-market strategy and ML roadmap direction. Moksh owns execution and delivery.
Key decision: Targeting Scientech and Nivo Controls (decided 2026-04-03)`,
          tags: ["agastya", "gtm", "ml", "roadmap", "scientech", "nivo"],
          priority: "high",
          children: [
            {
              id: "agastya-gtm",
              title: "Agastya GTM Strategy",
              summary: "Go-to-market strategy for Agastya — targets Scientech and Nivo Controls",
              content: `Agastya GTM Strategy:
- Primary targets: Scientech and Nivo Controls (decision made 2026-04-03)
- Owner: Jay Suryawanshi
- Strategy direction: ML-powered offering, enterprise sales motion`,
              tags: ["agastya", "gtm", "scientech", "nivo", "strategy"],
              priority: "high",
            },
            {
              id: "agastya-ml",
              title: "Agastya ML Roadmap",
              summary: "Machine learning development roadmap for Agastya",
              content: `Agastya ML Roadmap:
- Direction owned by Jay Suryawanshi
- Execution owned by Moksh Bhayre`,
              tags: ["agastya", "ml", "roadmap", "machine learning"],
              priority: "medium",
            },
          ],
        },
        {
          id: "threadverse",
          title: "ThreadVerse",
          summary: "Async-first team OS with Neo as its intelligence layer",
          content: `Project: ThreadVerse
Owner: Shreyash Dange (CTO)
Status: Active — Phase 1 build
Description: ThreadVerse is an async-first team operating system. It is NOT a Slack clone.
Core concepts: Spaces (map to projects), Threads (lifecycle: open → in-progress → resolved → archived), Decision Nodes, Updates Feed (async standups).
Neo is ThreadVerse's nervous system — not a sidebar chatbot.`,
          tags: ["threadverse", "async", "team", "os", "spaces", "threads"],
          priority: "high",
          children: [
            {
              id: "threadverse-architecture",
              title: "ThreadVerse Architecture",
              summary: "Full technical stack for ThreadVerse",
              content: `ThreadVerse Technical Stack:
- Runtime: Node.js (API + Neo Worker — two separate processes)
- Database + Realtime: PocketBase (SQLite → upgradeable to Postgres)
- Auth: PocketBase built-in (OAuth + email/pass)
- LLM Routing: LiteLLM → Claude (Anthropic) — provider-agnostic
- Hosting: Oracle Free Tier VPS — 4 ARM cores, 24 GB RAM, free forever
- PageIndex: Vectify AI PageIndex (Python) — tree built offline, loaded into Neo Worker
- ChatIndex: Vectify AI ChatIndex — conversation-aware, 7–30 day window
- Frontend: React + PocketBase Realtime subscriptions
- No vector DBs. No embeddings. Structured reasoning only.`,
              tags: ["architecture", "stack", "pocketbase", "nodejs", "litellm", "oracle"],
              priority: "high",
            },
            {
              id: "neo-architecture",
              title: "Neo Architecture",
              summary: "Neo Worker internals — 4 intelligence layers",
              content: `Neo operates across 4 layers:
LAYER 1 — PASSIVE: Answers @Neo questions using PageIndex + ChatIndex + thread context
LAYER 2 — ACTIVE: Proactively detects stale threads, surfaces related decisions, links cross-space threads
LAYER 3 — AUTONOMOUS: Takes actions when instructed — creates tasks, posts summaries, drafts briefs
LAYER 4 — AMBIENT: Maintains live Org Graph, produces Daily Digest per member

Neo is NEVER a chatbot. It is the org's intelligence layer — always present in threads, feed, digest.
Neo Worker is a standalone Node.js process — always-on, not serverless.`,
              tags: ["neo", "worker", "layers", "passive", "active", "autonomous", "ambient"],
              priority: "high",
            },
          ],
        },
      ],
    },
    {
      id: "decisions",
      title: "Decisions",
      summary: "All org-level decisions — highest retrieval priority after org.yaml",
      content: "Global decision log for Cogneoverse.",
      tags: ["decisions", "resolved"],
      priority: "high",
      children: [
        {
          id: "decision-2026-04-03",
          title: "Agastya targeting Scientech & Nivo Controls",
          summary: "Decision to target Scientech and Nivo Controls for Agastya",
          content: `Decision date: 2026-04-03
Decision: Agastya will target Scientech and Nivo Controls as primary enterprise customers.
Made by: Jay Suryawanshi (CEO)
Project: Agastya
Status: Canonical — active`,
          tags: ["decision", "agastya", "scientech", "nivo", "gtm"],
          priority: "high",
        },
        {
          id: "decision-neo-not-chatbot",
          title: "Neo is not a chatbot — it is an org intelligence layer",
          summary: "Foundational architectural decision: Neo is not a chatbot",
          content: `Decision: Neo is NOT a chatbot. It does not do customer support. It does not wait to be asked.
Neo is Cogneoverse's embedded org intelligence layer — the platform's nervous system.
Every message, decision, and thread is Neo's input. The UI is just the surface.
This decision governs all architecture choices for ThreadVerse + Neo.`,
          tags: ["neo", "decision", "architecture", "intelligence", "not-chatbot"],
          priority: "absolute",
        },
      ],
    },
  ],
}

// ── Query pipeline helpers ──────────────────────────────────────────────

/**
 * Flatten the tree into a searchable list for intent matching
 */
export function flattenTree(node: KnowledgeNode, acc: KnowledgeNode[] = []): KnowledgeNode[] {
  acc.push(node)
  if (node.children) node.children.forEach(child => flattenTree(child, acc))
  return acc
}

/**
 * Classify the intent of a query and return matched knowledge nodes
 * This is the "intent classify + tree traversal" step from your architecture doc
 */
export function queryKnowledge(userQuery: string): KnowledgeNode[] {
  const query = userQuery.toLowerCase()
  const allNodes = flattenTree(ORG_KNOWLEDGE)

  // Score each node by tag + title + content match
  const scored = allNodes
    .map(node => {
      let score = 0

      // Tag match (strongest signal)
      for (const tag of node.tags) {
        if (query.includes(tag)) score += 10
      }

      // Title match
      const titleWords = node.title.toLowerCase().split(/\s+/)
      for (const word of titleWords) {
        if (word.length > 3 && query.includes(word)) score += 6
      }

      // Content keyword match (weaker)
      const contentWords = node.content.toLowerCase().split(/\s+/)
      const uniqueContent = [...new Set(contentWords)].filter(w => w.length > 4)
      for (const word of uniqueContent) {
        if (query.includes(word)) score += 2
      }

      // Priority bonus
      if (node.priority === "absolute") score += 5
      if (node.priority === "high") score += 2

      return { node, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4) // top 4 relevant nodes

  return scored.map(({ node }) => node)
}

/**
 * Detect query intent type for layer selection
 */
export function classifyIntent(query: string): {
  type: "ownership" | "decision" | "status" | "architecture" | "team" | "general"
  entities: string[]
} {
  const q = query.toLowerCase()

  const entities: string[] = []
  const knownEntities = [
    "shreyash", "jay", "moksh", "orion", "agastya", "threadverse", "neo",
    "linucb", "pipeline", "iisg", "scientech", "nivo", "pocketbase", "litellm"
  ]
  for (const e of knownEntities) {
    if (q.includes(e)) entities.push(e)
  }

  if (q.match(/who owns|who is responsible|who leads|whose/)) return { type: "ownership", entities }
  if (q.match(/decided|decision|what did we decide|resolved|conclusion/)) return { type: "decision", entities }
  if (q.match(/status|progress|what.*happening|in flight|blocked|shipped/)) return { type: "status", entities }
  if (q.match(/architecture|stack|how.*built|tech|infrastructure|design/)) return { type: "architecture", entities }
  if (q.match(/who is|team|people|roles|members|founders/)) return { type: "team", entities }

  return { type: "general", entities }
}

/**
 * Assemble the final context string to inject into the LLM prompt
 */
export function assembleContext(query: string): string {
  const intent = classifyIntent(query)
  const nodes = queryKnowledge(query)

  if (nodes.length === 0) return ""

  const nodeContext = nodes
    .map(n => `[${n.title} — priority: ${n.priority}]\n${n.content}`)
    .join("\n\n---\n\n")

  return `
RETRIEVED ORG KNOWLEDGE (intent: ${intent.type}, entities: ${intent.entities.join(", ") || "none"}):

${nodeContext}

SOURCE NODES: ${nodes.map(n => n.id).join(" → ")}
`.trim()
}