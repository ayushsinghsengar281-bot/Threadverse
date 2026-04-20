import { NextResponse } from "next/server"
import { assembleContext, classifyIntent } from "@/lib/neo-knowledge"

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
- Orion CLI: AI-powered CLI, 15-stage pipeline (C01-C15), LinUCB RL reward signal, IISG Contract System. Owner: Shreyash.
- Agastya: Second Cogneoverse product, targeting Scientech & Nivo Controls. Owner: Jay (strategy) + Moksh (execution).
- ThreadVerse: Async-first team OS. Neo is its nervous system. Owner: Shreyash.

TONE AND FORMAT:
- Direct, precise, confident. No filler phrases.
- Use Markdown when structure helps.
- Always cite source when answering from org knowledge. Format: "Source: [node path]"
- Never hallucinate org facts. If unknown, say so.`

export async function POST(req: Request) {
  try {
    const apiKey = process.env.NVIDIA_API_KEY
    const baseUrl = process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1"
    const model = process.env.LLM_MODEL || "meta/llama-3.1-8b-instruct"

    if (!apiKey) {
      return NextResponse.json({ error: "NVIDIA_API_KEY not set in .env.local" }, { status: 500 })
    }

    const { messages } = await req.json()

    const lastUserMessage = [...messages]
      .reverse()
      .find((m: { role: string; content: string }) => m.role === "user")
    const userQuery: string = lastUserMessage?.content || ""

    const intent = classifyIntent(userQuery)
    const orgContext = assembleContext(userQuery)

    const systemContent = orgContext
      ? `${NEO_BASE_SYSTEM_PROMPT}\n\n${"─".repeat(60)}\n${orgContext}`
      : NEO_BASE_SYSTEM_PROMPT

    console.log(
      `[Neo] query: "${userQuery.slice(0, 80)}" | intent: ${intent.type} | entities: [${intent.entities.join(", ")}] | context: ${orgContext.length > 0 ? "injected" : "none"}`
    )

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        max_tokens: 1024,
        temperature: 0.3,
        top_p: 0.9,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("[Neo] NVIDIA API error:", errText)
      return NextResponse.json({ error: "LLM call failed" }, { status: 502 })
    }

    const data = await response.json()
    const reply: string = data?.choices?.[0]?.message?.content || "No response"

    return NextResponse.json({
      role: "neo",
      content: reply,
    })

  } catch (error) {
    console.error("[Neo] API ERROR:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}