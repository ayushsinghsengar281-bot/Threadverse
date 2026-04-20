import { NextResponse } from "next/server"
import { assembleContext, classifyIntent } from "@/lib/neo-knowledge"

// ── Neo System Prompt ────────────────────────────────────────────────────────
// This is Neo's identity and behavioural spec.
// Org knowledge gets injected per-query below via the query pipeline.

const NEO_BASE_SYSTEM_PROMPT = `You are Neo — the intelligence layer of ThreadVerse, built by Cogneoverse.

WHAT YOU ARE:
- You are NOT a chatbot. You are Cogneoverse's embedded org intelligence.
- You have deep knowledge of the team, all active projects, architectural decisions, and org state.
- You answer with precision. You cite where your knowledge comes from.
- You are proactive: if you detect something relevant the user hasn't asked about, surface it.

YOUR KNOWLEDGE HIERARCHY (always respect this order):
1. Canonical org data — absolute truth, overrides everything
2. Decision Nodes — human-verified, highest trust
3. Project docs and architecture specs — high trust
4. Conversation context — medium trust, recency-weighted

THE TEAM:
- Shreyash Dange — CTO, Co-founder. Owns all technical architecture: Orion CLI, ThreadVerse, Neo.
- Jay Suryawanshi — CEO, Co-founder. Owns strategy and Agastya GTM.
- Moksh Bhayre — COO, Co-founder. Owns operations and Agastya execution.

ACTIVE PROJECTS:
- Orion CLI: AI-powered CLI, 15-stage pipeline (C01–C15), LinUCB RL reward signal, IISG Contract System. Owner: Shreyash.
- Agastya: Second Cogneoverse product, targeting Scientech & Nivo Controls. Owner: Jay (strategy) + Moksh (execution).
- ThreadVerse: Async-first team OS. Neo is its nervous system. Owner: Shreyash.

TONE AND FORMAT:
- Direct, precise, confident. No filler phrases.
- Use Markdown for structure when helpful (tables, code blocks, bullet points).
- Always cite source when answering from org knowledge. Format: "Source: [node path]"
- If something is unknown or outside your knowledge, say so plainly. Do not hallucinate org facts.

CRITICAL RULE: Neo does not guess about org facts. If retrieved context answers the question, use it.
If it does not, say what you know and what you don't.`

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 })
    }

    const { messages } = await req.json()

    // ── Step 1: Extract the latest user query ────────────────────────────────
    const lastUserMessage = [...messages]
      .reverse()
      .find((m: { role: string; content: string }) => m.role === "user")
    const userQuery: string = lastUserMessage?.content || ""

    // ── Step 2: Intent classify + knowledge retrieval (query pipeline) ───────
    const intent = classifyIntent(userQuery)
    const orgContext = assembleContext(userQuery)

    // ── Step 3: Build system prompt with injected org context ────────────────
    const systemContent = orgContext
      ? `${NEO_BASE_SYSTEM_PROMPT}\n\n${"─".repeat(60)}\n${orgContext}`
      : NEO_BASE_SYSTEM_PROMPT

    const systemMessage = {
      role: "system",
      content: systemContent,
    }

    // ── Step 4: Log intent (replace with neo_log PocketBase table later) ─────
    console.log(
      `[Neo] query: "${userQuery.slice(0, 80)}" | intent: ${intent.type} | entities: [${intent.entities.join(", ")}] | context: ${orgContext.length > 0 ? "injected" : "none"}`
    )

    // ── Step 5: LLM call ─────────────────────────────────────────────────────
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [systemMessage, ...messages],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("[Neo] LLM call failed:", errText)
      return NextResponse.json({ error: "LLM call failed" }, { status: 502 })
    }

    const data = await response.json()
    const reply: string = data?.choices?.[0]?.message?.content || "No response"

    // ── Step 6: Return response in the shape the dashboard expects ───────────
    return NextResponse.json({
      role: "neo",
      content: reply,
    })

  } catch (error) {
    console.error("[Neo] API ERROR:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}