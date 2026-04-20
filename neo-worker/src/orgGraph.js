// orgGraph.js
// Neo's live in-memory knowledge graph.
// Nodes: members, spaces, threads, decisions, tasks
// Edges: owns, blocked-by, related-to, decided-in, assigned-to
// Updated on every PocketBase Realtime event.
// Serialized to neo_org_graph table periodically for crash recovery.

export class OrgGraph {
  constructor() {
    this.nodes = new Map()   // id → { type, ...props }
    this.edges = new Map()   // id → [{ relation, targetId }]
    this.version = 0
  }

  // ── Build initial graph from org.yaml + PocketBase DB state ───────────────

  async buildFromYaml(orgData) {
    // Load team members
    for (const member of orgData.team || []) {
      this.setNode(member.id, {
        type: "member",
        name: member.name,
        role: member.role,
        owns: member.owns || [],
        status: "active",
      })
      // Add ownership edges
      for (const projectId of member.owns || []) {
        this.addEdge(member.id, "owns", projectId)
      }
    }

    // Load projects
    for (const project of orgData.projects || []) {
      this.setNode(project.id, {
        type: "project",
        name: project.name,
        status: project.status,
        owner: project.owner || project.owner_strategy,
      })
    }

    // Load decisions
    for (const decision of orgData.decisions || []) {
      this.setNode(decision.id, {
        type: "decision",
        title: decision.title,
        date: decision.date,
        project: decision.project,
        is_canonical: decision.is_canonical,
        made_by: decision.made_by,
      })
      this.addEdge(decision.id, "decided-in", decision.project)
    }

    this.version++
    console.log(`[OrgGraph] Built from org.yaml — ${this.nodes.size} nodes, ${this.version} version`)
  }

  async loadFromPocketBase(pb) {
    try {
      // Load spaces
      const spaces = await pb.collection("spaces").getFullList()
      for (const space of spaces) {
        this.setNode(space.id, {
          type: "space",
          name: space.name,
          project: space.project,
          owner_id: space.owner_id,
          is_archived: space.is_archived,
          last_updated: new Date().toISOString(),
        })
        if (space.owner_id) this.addEdge(space.owner_id, "owns", space.id)
      }

      // Load threads
      const threads = await pb.collection("threads").getFullList()
      for (const thread of threads) {
        this.setNode(thread.id, {
          type: "thread",
          title: thread.title,
          status: thread.status,
          space_id: thread.space_id,
          created_by: thread.created_by,
          last_activity_at: thread.last_activity_at,
          is_decision: thread.is_decision,
          risk_score: this._calculateRisk(thread),
          last_updated: new Date().toISOString(),
        })
        this.addEdge(thread.id, "lives-in", thread.space_id)
      }

      // Load tasks
      const tasks = await pb.collection("tasks").getFullList()
      for (const task of tasks) {
        this.setNode(task.id, {
          type: "task",
          title: task.title,
          status: task.status,
          assigned_to: task.assigned_to,
          project: task.project,
          due_at: task.due_at,
          last_updated: new Date().toISOString(),
        })
        if (task.assigned_to) this.addEdge(task.assigned_to, "assigned-to", task.id)
        if (task.source_thread_id) this.addEdge(task.id, "originated-in", task.source_thread_id)
      }

      this.version++
      console.log(`[OrgGraph] Loaded from PocketBase — ${this.nodes.size} total nodes`)
    } catch (err) {
      console.error("[OrgGraph] PocketBase load failed:", err.message)
    }
  }

  // ── Update graph on PocketBase Realtime events ────────────────────────────

  update(event) {
    const { action, record, collection } = event

    if (action === "delete") {
      this.nodes.delete(record.id)
      this.edges.delete(record.id)
      return
    }

    if (collection === "threads") {
      this.setNode(record.id, {
        type: "thread",
        title: record.title,
        status: record.status,
        space_id: record.space_id,
        created_by: record.created_by,
        last_activity_at: record.last_activity_at,
        is_decision: record.is_decision,
        risk_score: this._calculateRisk(record),
        last_updated: new Date().toISOString(),
      })
    }

    if (collection === "tasks") {
      this.setNode(record.id, {
        type: "task",
        title: record.title,
        status: record.status,
        assigned_to: record.assigned_to,
        project: record.project,
        due_at: record.due_at,
        last_updated: new Date().toISOString(),
      })
    }

    if (collection === "decisions") {
      this.setNode(record.id, {
        type: "decision",
        title: record.title,
        body: record.body,
        project: record.project,
        made_by: record.made_by,
        is_canonical: record.is_canonical,
        last_updated: new Date().toISOString(),
      })
    }

    if (collection === "messages") {
      // Update the parent thread's last_activity_at
      const threadNode = this.nodes.get(record.thread_id)
      if (threadNode) {
        threadNode.last_activity_at = record.created_at
        threadNode.risk_score = this._calculateRisk(threadNode)
      }
    }

    this.version++
  }

  // ── Query helpers ─────────────────────────────────────────────────────────

  // Get all threads that have been open more than N days with no resolution
  getStaleThreads({ days = 5 } = {}) {
    const cutoff = Date.now() - days * 86400000
    const stale = []
    for (const [id, node] of this.nodes) {
      if (
        node.type === "thread" &&
        node.status === "open" &&
        node.last_activity_at &&
        new Date(node.last_activity_at).getTime() < cutoff
      ) {
        stale.push({ id, ...node })
      }
    }
    return stale
  }

  // Get all nodes of a given type
  getByType(type) {
    const result = []
    for (const [id, node] of this.nodes) {
      if (node.type === type) result.push({ id, ...node })
    }
    return result
  }

  // Get what a member owns
  getOwnership(memberId) {
    const edges = this.edges.get(memberId) || []
    return edges
      .filter(e => e.relation === "owns")
      .map(e => this.nodes.get(e.targetId))
      .filter(Boolean)
  }

  // Get all blocked tasks
  getBlockedTasks() {
    return this.getByType("task").filter(t => t.status === "blocked")
  }

  // Summarise current org state — injected into LLM context
  getSummary() {
    const threads = this.getByType("thread")
    const tasks = this.getByType("task")
    const decisions = this.getByType("decision")

    const openThreads = threads.filter(t => t.status === "open").length
    const stale = this.getStaleThreads({ days: 5 }).length
    const openTasks = tasks.filter(t => t.status === "open").length
    const blockedTasks = tasks.filter(t => t.status === "blocked").length

    return `ORG GRAPH SNAPSHOT (v${this.version}):
Threads: ${threads.length} total, ${openThreads} open, ${stale} stale (5+ days)
Tasks: ${tasks.length} total, ${openTasks} open, ${blockedTasks} blocked
Decisions: ${decisions.length} indexed
Members: ${this.getByType("member").length}`
  }

  // ── Serialise for PocketBase snapshot ────────────────────────────────────

  serialise() {
    return {
      nodes: Object.fromEntries(this.nodes),
      edges: Object.fromEntries(this.edges),
      version: this.version,
    }
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  setNode(id, props) {
    this.nodes.set(id, props)
  }

  addEdge(fromId, relation, toId) {
    if (!this.edges.has(fromId)) this.edges.set(fromId, [])
    const existing = this.edges.get(fromId)
    // Avoid duplicate edges
    if (!existing.find(e => e.relation === relation && e.targetId === toId)) {
      existing.push({ relation, targetId: toId })
    }
  }

  _calculateRisk(thread) {
    if (!thread.last_activity_at) return 0.5
    const daysSince = (Date.now() - new Date(thread.last_activity_at).getTime()) / 86400000
    if (thread.status === "resolved" || thread.status === "archived") return 0.0
    if (daysSince > 10) return 0.9
    if (daysSince > 5) return 0.7
    if (daysSince > 2) return 0.3
    return 0.1
  }
}