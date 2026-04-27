// llm.js
// LLM interface for Neo Worker.
// Uses NVIDIA NIM API directly — OpenAI-compatible endpoint.
// Called ONLY when Neo needs to generate a response — not on every event.

const NEO_SYSTEM_PROMPT = `You are Neo — the intelligence layer of ThreadVerse, built by Cogneoverse.

IDENTITY:
- You are NOT a chatbot. You are the org's intelligence layer.
- You have real-time knowledge of the team, projects, threads, decisions, and tasks.
- You live inside ThreadVerse — in threads, the feed, and the daily digest.
- The line between "the platform" and "the AI" should be invisible.

BEHAVIOUR:
- Answer with precision. If retrieved context answers the question, use it.
- Always cite your source. Format: "Source: [node path or thread ID]"
- If something is outside your knowledge, say so plainly. Never hallucinate org facts.
- Be proactive: if you spot something relevant the user hasn't asked about, surface it.
- Be concise. No filler. No preamble. Get to the answer.

KNOWLEDGE HIERARCHY (hard order — never override this):
1. org.yaml — absolute canonical truth
2. Decision Nodes — human-verified, highest trust
3. Meeting notes and project docs — high trust
4. ChatIndex (recent threads) — medium trust, recency-weighted
5. Raw active thread messages — lower trust, high recency

FORMAT:
- Use Markdown when structure helps (tables, bullet points, code blocks).
- Cite source nodes at the end of answers that use retrieved knowledge.
- For thread responses: be direct and inline. No essay-length replies unless asked.`

export async function callLLM({ query, context, intent }) {
  const startTime = Date.now()

  // Build the user message — query + retrieved context
  const userContent = context
    ? `${context}\n\n${"─".repeat(50)}\n\nQuery: ${query}`
    : `Query: ${query}`

  const messages = [
    { role: "system", content: NEO_SYSTEM_PROMPT },
    { role: "user", content: userContent },
  ]

  try {
    // LiteLLM proxy runs locally on port 4000
    // Change this URL to your actual LiteLLM endpoint when deployed
    const response = await fetch(
      process.env.LITELLM_URL || "http://localhost:4000/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // LiteLLM handles the actual provider API key internally
          // Set LITELLM_API_KEY in your .env if your proxy requires auth
          ...(process.env.LITELLM_API_KEY && {
            Authorization: `Bearer ${process.env.LITELLM_API_KEY}`,
          }),
        },
        body: JSON.stringify({
          model: process.env.LLM_MODEL || "nvidia_nim/meta/llama-3.1-70b-instruct",
          messages,
          max_tokens: 1000,
          temperature: 0.3, // lower = more precise, less creative — right for org intelligence
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`LLM call failed: ${err}`)
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content || "No response generated."
    const tokens = data?.usage?.total_tokens || 0
    const latency = Date.now() - startTime

    console.log(`[LLM] intent: ${intent?.type} | tokens: ${tokens} | latency: ${latency}ms`)

    return content

  } catch (err) {
    console.error("[LLM] Error:", err.message)
    // Return a graceful fallback so Neo doesn't go silent
    return `I encountered an issue generating a response. Error: ${err.message}`
  }
}

// ── Fallback: call OpenRouter directly if LiteLLM isn't set up yet ────────
// Uncomment this and swap callLLM references while you get LiteLLM configured.

// export async function callLLMDirect({ query, context, intent }) {
//   const apiKey = process.env.OPENROUTER_API_KEY
//   if (!apiKey) throw new Error("OPENROUTER_API_KEY not set")
//
//   const userContent = context
//     ? `${context}\n\n─────\n\nQuery: ${query}`
//     : `Query: ${query}`
//
//   const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${apiKey}`,
//     },
//     body: JSON.stringify({
//       model: "openai/gpt-4o-mini",
//       messages: [
//         { role: "system", content: NEO_SYSTEM_PROMPT },
//         { role: "user", content: userContent },
//       ],
//     }),
//   })
//
//   const data = await response.json()
//   return data?.choices?.[0]?.message?.content || "No response"
// }