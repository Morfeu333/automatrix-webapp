import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import * as fs from "node:fs"
import * as path from "node:path"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch workflow to get filename and category
  const { data: workflow, error } = await supabase
    .from("workflows")
    .select("id, filename, category, name")
    .eq("id", id)
    .single()

  if (error || !workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
  }

  // Construct file path
  const filePath = path.join(
    process.cwd(),
    "public",
    "n8n-workflows",
    "workflows",
    workflow.category,
    `${workflow.filename}.json`
  )

  // Check file exists
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Workflow file not found" }, { status: 404 })
  }

  // Track download if user is authenticated (trigger auto-increments download_count)
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from("workflow_downloads").insert({
      workflow_id: workflow.id,
      user_id: user.id,
    })
  }

  // Read and serve the file
  const fileContent = fs.readFileSync(filePath, "utf-8")
  const safeFilename = workflow.name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100)

  return new NextResponse(fileContent, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${safeFilename}.json"`,
    },
  })
}
