// chatIndex.js
// Conversation-aware context for recent threads (7–30 days).
// Not a vector DB — preserves thread structure and who-said-what ordering.
// Rebuilt on startup from PocketBase. Updated live via event consumer.

export class ChatIndex {
  constructor() {
    // Map of thread_id → { thread metadata + ordered messages }
    this.threads = new Map()
    this.windowDays = 30
  }

  // ── Build from PocketBase on startup ─────────────────────────────────────

  async build(pb, { days = 30 } = {}) {
    this.windowDays = days
    const cutoff = new Date(Date.now() - days * 86400000).toISOString()

    try {
      // Get all threads with activity in the window
      const threads = await pb.collection("threads").getFullList({
        filter: `last_activity_at >= "${cutoff}"`,
        sort: "-last_activity_at",
      })

      for (const thread of threads) {
        // Get messages for each thread
        const messages = await pb.collection("messages").getFullList({
          filter: `thread_id = "${thread.id}" && created >= "${cutoff}"`,
          sort: "created",
        })

        this.threads.set(thread.id, {
          id: thread.id,
          title: thread.title,
          space_id: thread.space_id,
          status: thread.status,
          is_decision: thread.is_decision,
          last_activity_at: thread.last_activity_at,
          messages: messages.map(m => ({
            id: m.id,
            author: m.is_neo ? "Neo" : m.author_id,
            content: m.content,
            created: m.created,
            is_neo: m.is_neo,
          })),
        })
      }

      console.log(`[ChatIndex] Built — ${this.threads.size} threads in ${days}-day window`)
    } catch (err) {
      console.error("[ChatIndex] Build failed:", err.message)
    }
  }

  // ── Add a new message to an existing thread ───────────────────────────────

  addMessage(threadId, message) {
    const thread = this.threads.get(threadId)
    if (thread) {
      thread.messages.push(message)
      thread.last_activity_at = message.created || new Date().toISOString()
    }
  }

  // ── Query for relevant threads given a set of entities ───────────────────

  query(entities = [], { maxThreads = 3 } = {}) {
    if (this.threads.size === 0) return null

    const queryTerms = entities.map(e => e.toLowerCase())

    // Score threads by how many query terms appear in their content
    const scored = []
    for (const [id, thread] of this.threads) {
      let score = 0
      const allText = [
        thread.title,
        ...thread.messages.map(m => m.content),
      ].join(" ").toLowerCase()

      for (const term of queryTerms) {
        if (allText.includes(term)) score += 5
      }

      // Recency boost
      const daysSince = (Date.now() - new Date(thread.last_activity_at).getTime()) / 86400000
      score += Math.max(0, 10 - daysSince)

      // Decision threads get priority boost
      if (thread.is_decision) score += 8

      if (score > 0) scored.push({ thread, score })
    }

    if (scored.length === 0) return null

    // Return formatted context from top N threads
    const topThreads = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, maxThreads)
      .map(({ thread }) => this._formatThread(thread))

    return topThreads.join("\n\n---\n\n")
  }

  // ── Format a thread for LLM context injection ─────────────────────────────

  _formatThread(thread) {
    const lines = [
      `Thread: "${thread.title}" [${thread.status}]${thread.is_decision ? " ★ DECISION" : ""}`,
      `Last activity: ${thread.last_activity_at}`,
    ]

    // Include last N messages (enough for context, not overwhelming)
    const messages = thread.messages.slice(-8)
    for (const msg of messages) {
      lines.push(`  ${msg.author}: ${msg.content}`)
    }

    return lines.join("\n")
  }
}