/**
 * Sprint 3: Import 2,061 N8N workflow JSON files into Supabase workflows table.
 *
 * Usage: npx tsx scripts/import-workflows.ts
 *
 * Reads .env.local for NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * Uses service role key to bypass RLS for bulk insert.
 */

import { createClient } from "@supabase/supabase-js"
import * as fs from "node:fs"
import * as path from "node:path"

// Load .env.local
const envPath = path.join(process.cwd(), ".env.local")
const envContent = fs.readFileSync(envPath, "utf-8")
const env: Record<string, string> = {}
for (const line of envContent.split("\n")) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const eqIdx = trimmed.indexOf("=")
  if (eqIdx === -1) continue
  env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1)
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const WORKFLOWS_DIR = path.join(process.cwd(), "public/n8n-workflows/workflows")

interface WorkflowJSON {
  name?: string
  description?: string
  tags?: string[]
  notes?: string
  meta?: {
    category?: string
    [key: string]: unknown
  }
  nodes?: Array<{
    type?: string
    name?: string
    [key: string]: unknown
  }>
  [key: string]: unknown
}

interface WorkflowRow {
  filename: string
  slug: string
  name: string
  description: string | null
  category: string
  trigger_type: string | null
  complexity: "beginner" | "intermediate" | "advanced"
  node_count: number
  integrations: string[]
  tags: string[]
  active: boolean
}

function generateSlug(filename: string): string {
  // Remove .json extension, lowercase, underscores→hyphens (keep numeric prefix for uniqueness)
  const base = filename.replace(/\.json$/, "")
  return base
    .replace(/_/g, "-")
    .toLowerCase()
}

function cleanNodeType(type: string): string {
  return type
    .replace("n8n-nodes-base.", "")
    .replace("@n8n/n8n-nodes-langchain.", "")
    .replace(/Trigger$/i, "")
    .replace(/Tool$/i, "")
}

function extractTriggerType(nodes: WorkflowJSON["nodes"]): string | null {
  if (!nodes) return null
  for (const node of nodes) {
    const type = node.type || ""
    if (type.toLowerCase().includes("trigger")) {
      return cleanNodeType(type)
    }
  }
  // Check for webhook nodes
  for (const node of nodes) {
    const type = node.type || ""
    if (type.toLowerCase().includes("webhook")) {
      return "webhook"
    }
  }
  return "manual"
}

function extractIntegrations(nodes: WorkflowJSON["nodes"]): string[] {
  if (!nodes) return []
  const seen = new Set<string>()
  for (const node of nodes) {
    const type = node.type || ""
    if (!type) continue
    // Skip utility nodes
    if (/\.(stickyNote|noOp|if|switch|merge|splitOut|aggregate|filter|code|set|wait|executeWorkflow|function|respondToWebhook|manualTrigger|scheduleTrigger|formTrigger|webhook)$/i.test(type)) {
      continue
    }
    const clean = cleanNodeType(type)
    if (clean && clean.length > 1) {
      seen.add(clean)
    }
  }
  return Array.from(seen).slice(0, 20) // cap at 20 integrations
}

function determineComplexity(nodeCount: number): "beginner" | "intermediate" | "advanced" {
  if (nodeCount <= 5) return "beginner"
  if (nodeCount <= 15) return "intermediate"
  return "advanced"
}

function parseWorkflowFile(filePath: string, category: string): WorkflowRow | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8")
    const data: WorkflowJSON = JSON.parse(raw)

    const filename = path.basename(filePath, ".json")
    const nodes = data.nodes || []
    const nodeCount = nodes.filter(n => n.type && !/stickyNote/i.test(n.type || "")).length

    // Extract a meaningful name
    let name = data.name || filename.replace(/^\d+_/, "").replace(/_/g, " ")
    if (name.length > 200) name = name.slice(0, 200)

    // Extract description
    let description = data.description || null
    if (description && description.length > 1000) {
      description = description.slice(0, 1000)
    }

    // Extract tags
    const tags = (data.tags || [])
      .filter((t): t is string => typeof t === "string")
      .slice(0, 10)

    return {
      filename,
      slug: generateSlug(path.basename(filePath)),
      name,
      description,
      category,
      trigger_type: extractTriggerType(nodes),
      complexity: determineComplexity(nodeCount),
      node_count: nodeCount,
      integrations: extractIntegrations(nodes),
      tags,
      active: true,
    }
  } catch (err) {
    console.error(`Failed to parse ${filePath}:`, err)
    return null
  }
}

async function main() {
  console.log("Starting workflow import...")
  console.log(`Source: ${WORKFLOWS_DIR}`)
  console.log(`Target: ${SUPABASE_URL}`)

  // Collect all workflow data
  const workflows: WorkflowRow[] = []
  const slugsSeen = new Set<string>()

  const categories = fs.readdirSync(WORKFLOWS_DIR).filter(d =>
    fs.statSync(path.join(WORKFLOWS_DIR, d)).isDirectory()
  )

  console.log(`Found ${categories.length} categories`)

  for (const category of categories) {
    const catDir = path.join(WORKFLOWS_DIR, category)
    const files = fs.readdirSync(catDir).filter(f => f.endsWith(".json"))

    for (const file of files) {
      const row = parseWorkflowFile(path.join(catDir, file), category)
      if (!row) continue

      // Deduplicate slugs
      let slug = row.slug
      if (slugsSeen.has(slug)) {
        slug = `${slug}-${category.toLowerCase()}`
      }
      if (slugsSeen.has(slug)) {
        slug = `${slug}-${Date.now()}`
      }
      slugsSeen.add(slug)
      row.slug = slug

      workflows.push(row)
    }
  }

  console.log(`Parsed ${workflows.length} workflows`)

  // Delete existing seed data (24 rows) before bulk insert
  const { error: deleteError } = await supabase
    .from("workflows")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000") // delete all

  if (deleteError) {
    console.error("Delete existing failed:", deleteError.message)
    // Continue anyway - upsert will handle
  }

  // Batch insert (Supabase limit: ~1000 rows per request)
  const BATCH_SIZE = 500
  let inserted = 0

  for (let i = 0; i < workflows.length; i += BATCH_SIZE) {
    const batch = workflows.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from("workflows")
      .upsert(batch, { onConflict: "filename" })

    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message)
      // Try smaller batches
      for (const row of batch) {
        const { error: singleError } = await supabase
          .from("workflows")
          .upsert(row, { onConflict: "filename" })
        if (singleError) {
          console.error(`  Failed: ${row.filename} — ${singleError.message}`)
        } else {
          inserted++
        }
      }
    } else {
      inserted += batch.length
      console.log(`  Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} rows (total: ${inserted})`)
    }
  }

  // Verify
  const { count } = await supabase
    .from("workflows")
    .select("*", { count: "exact", head: true })

  console.log(`\nDone! Total workflows in DB: ${count}`)
  console.log(`Successfully imported: ${inserted}`)
}

main().catch(console.error)
