// src/eventConsumer.js
import { runQueryPipeline } from './queryPipeline.js'

export class EventConsumer {
  constructor({ pageIndexTree, chatIndex, orgGraph, pb }) {
    this.pageIndexTree = pageIndexTree
    this.chatIndex = chatIndex
    this.orgGraph = orgGraph
    this.pb = pb
  }

  async handle(event) {
    // Update Org Graph on every event — always, no exceptions
    this.orgGraph.update(event)

    const { action, record, collection } = event

    // React to new messages that mention Neo
    if (collection === 'messages' && action === 'create') {
      const mentions = record.mentions || []
      if (mentions.includes('neo')) {
        await this.handleNeoMention(record)
      }
    }
  }

  async handleNeoMention(message) {
    // Fetch recent thread messages for active context
    let threadMessages = []
    try {
      const msgs = await this.pb.collection('messages').getList(1, 5, {
        filter: `thread_id = "${message.thread_id}"`,
        sort: '-created',
      })
      threadMessages = msgs.items.reverse().map(m => ({
        author: m.is_neo ? 'Neo' : m.author_id,
        content: m.content,
      }))
    } catch (err) {
      console.warn('[EventConsumer] Could not fetch thread messages:', err.message)
    }

    const result = await runQueryPipeline({
      query: message.content,
      pageIndexTree: this.pageIndexTree,
      chatIndex: this.chatIndex,
      orgGraph: this.orgGraph,
      threadMessages,
      triggerType: 'mention',
    })

    // Post Neo's response back as a message in the same thread
    await this.pb.collection('messages').create({
      thread_id: message.thread_id,
      is_neo: true,
      content: result.content,
      neo_trigger: 'mention',
      source_nodes: result.citations || [],
    })
  }
}