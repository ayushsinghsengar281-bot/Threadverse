# neo-worker/pageindex/build.py
# Builds tree.json from org.yaml — Neo's static knowledge base.
# Run this whenever org.yaml changes.
# Output: neo-worker/pageindex/tree.json

import yaml
import json
import os
from datetime import datetime

# ── Paths ─────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORG_YAML_PATH = os.path.join(BASE_DIR, "data", "org.yaml")
TREE_JSON_PATH = os.path.join(BASE_DIR, "pageindex", "tree.json")

def build_tree():
    # Load org.yaml
    with open(ORG_YAML_PATH, "r", encoding="utf-8") as f:
        org = yaml.safe_load(f)

    tree = {
        "id": "root",
        "title": "Cogneoverse Org",
        "summary": "Root of all org knowledge. Contains team, projects, and decisions.",
        "priority": "absolute",
        "tags": ["org", "cogneoverse", "root"],
        "content": "This is the root of the Cogneoverse knowledge tree.",
        "children": [
            build_team_node(org.get("team", [])),
            build_projects_node(org.get("projects", [])),
            build_decisions_node(org.get("decisions", [])),
        ]
    }

    with open(TREE_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(tree, f, indent=2, default=str)

    # Count total nodes
    total = count_nodes(tree)
    print(f"[PageIndex] tree.json built — {total} nodes")
    print(f"[PageIndex] saved to {TREE_JSON_PATH}")

# ── Team node ──────────────────────────────────────────────────────────────

def build_team_node(team):
    children = []
    for member in team:
        owns_text = ", ".join(member.get("owns", [])) or "nothing listed"
        children.append({
            "id": f"team-{member.get('id', member.get('name', '').lower())}",
            "title": member.get("name", "Unknown"),
            "summary": f"{member.get('role', '')} at Cogneoverse. Owns: {owns_text}",
            "priority": "high",
            "tags": [
                member.get("id", ""),
                member.get("name", "").lower().replace(" ", "-"),
                member.get("role", "").lower(),
                "team", "member"
            ],
            "content": f"""Name: {member.get('name')}
Role: {member.get('role')}
ID: {member.get('id')}
Owns: {owns_text}
""",
            "children": []
        })

    return {
        "id": "team",
        "title": "Team",
        "summary": f"All {len(team)} Cogneoverse team members, their roles and ownership.",
        "priority": "high",
        "tags": ["team", "members", "people", "roles", "founders"],
        "content": f"Cogneoverse has {len(team)} team members.",
        "children": children
    }

# ── Projects node ──────────────────────────────────────────────────────────

def build_projects_node(projects):
    children = []
    for project in projects:
        # Build sub-nodes from any nested keys in the project
        sub_children = []
        for key, value in project.items():
            if isinstance(value, dict):
                sub_children.append({
                    "id": f"project-{project.get('id', '')}-{key}",
                    "title": key.replace("_", " ").title(),
                    "summary": f"{key} details for {project.get('name', '')}",
                    "priority": "high",
                    "tags": [key, project.get("id", ""), "project"],
                    "content": json.dumps(value, indent=2, default=str),
                    "children": []
                })
            elif isinstance(value, list) and key not in ("id", "name"):
                sub_children.append({
                    "id": f"project-{project.get('id', '')}-{key}",
                    "title": key.replace("_", " ").title(),
                    "summary": f"{key} for {project.get('name', '')}",
                    "priority": "medium",
                    "tags": [key, project.get("id", ""), "project"],
                    "content": "\n".join(str(item) for item in value),
                    "children": []
                })

        owner = project.get("owner") or project.get("owner_strategy") or "unassigned"
        children.append({
            "id": f"project-{project.get('id', '')}",
            "title": project.get("name", "Unknown Project"),
            "summary": f"Project {project.get('name')}. Status: {project.get('status', 'unknown')}. Owner: {owner}",
            "priority": "high",
            "tags": [
                project.get("id", ""),
                project.get("name", "").lower().replace(" ", "-"),
                "project",
                project.get("status", "")
            ],
            "content": f"""Project: {project.get('name')}
ID: {project.get('id')}
Status: {project.get('status', 'unknown')}
Owner: {owner}
""",
            "children": sub_children
        })

    return {
        "id": "projects",
        "title": "Projects",
        "summary": f"All {len(projects)} active Cogneoverse projects.",
        "priority": "high",
        "tags": ["projects", "orion", "agastya", "threadverse"],
        "content": f"Cogneoverse has {len(projects)} projects.",
        "children": children
    }

# ── Decisions node ─────────────────────────────────────────────────────────

def build_decisions_node(decisions):
    children = []
    for decision in decisions:
        children.append({
            "id": decision.get("id", ""),
            "title": decision.get("title", "Untitled Decision"),
            "summary": decision.get("title", ""),
            "priority": "absolute" if decision.get("is_canonical") else "high",
            "tags": [
                "decision",
                decision.get("project", ""),
                decision.get("made_by", ""),
                decision.get("id", "")
            ],
            "content": f"""Decision: {decision.get('title')}
Date: {decision.get('date')}
Project: {decision.get('project')}
Made by: {decision.get('made_by')}
Canonical: {decision.get('is_canonical', False)}

{decision.get('body', '')}
""",
            "children": []
        })

    return {
        "id": "decisions",
        "title": "Decisions",
        "summary": f"All {len(decisions)} org decisions. Highest retrieval priority after org.yaml.",
        "priority": "absolute",
        "tags": ["decisions", "resolved", "concluded", "agreed"],
        "content": f"{len(decisions)} decisions indexed.",
        "children": children
    }

# ── Helpers ────────────────────────────────────────────────────────────────

def count_nodes(node):
    count = 1
    for child in node.get("children", []):
        count += count_nodes(child)
    return count

# ── Run ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"[PageIndex] Building tree from {ORG_YAML_PATH}")
    build_tree()
    print("[PageIndex] Done.")