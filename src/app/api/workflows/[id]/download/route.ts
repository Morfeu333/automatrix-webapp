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

  const { data: workflow, error } = await supabase
    .from("workflows")
    .select("id, filename, category, name")
    .eq("id", id)
    .single()

  if (error || !workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
  }

  // Construct and validate file path to prevent path traversal
  const baseDir = path.resolve(process.cwd(), "public", "n8n-workflows", "workflows")
  const filePath = path.resolve(baseDir, workflow.category, `${workflow.filename}.json`)

  if (!filePath.startsWith(baseDir + path.sep)) {
    return NextResponse.json({ error: "Invalid workflow path" }, { status: 400 })
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Workflow file not found" }, { status: 404 })
  }

  // Track download if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { error: dlError } = await supabase.from("workflow_downloads").insert({
      workflow_id: workflow.id,
      user_id: user.id,
    })
    if (dlError) {
      console.error("Download tracking error:", dlError.message)
    }
  }

  let fileContent: string
  try {
    fileContent = fs.readFileSync(filePath, "utf-8")
  } catch (err) {
    console.error("Workflow file read error:", err)
    return NextResponse.json({ error: "Failed to read workflow file" }, { status: 500 })
  }

  const safeFilename = workflow.name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100)

  return new NextResponse(fileContent, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${safeFilename}.json"`,
    },
  })
}
