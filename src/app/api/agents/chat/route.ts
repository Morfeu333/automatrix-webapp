import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
  }

  const body = await request.json()
  const { message, agentId, sessionId } = body as {
    message?: string
    agentId?: string
    sessionId?: string
  }

  if (!message?.trim()) {
    return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 })
  }

  if (!N8N_WEBHOOK_URL) {
    return NextResponse.json({
      reply: `Entendi sua pergunta sobre "${message.slice(0, 50)}". O backend N8N ainda nao esta conectado. Quando estiver configurado, vou processar suas perguntas usando IA especializada!`,
      sessionId: sessionId || crypto.randomUUID(),
      mock: true,
    })
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        agentId: agentId || "general",
        sessionId: sessionId || crypto.randomUUID(),
        userId: user.id,
        userEmail: user.email,
      }),
    })

    if (!response.ok) {
      console.error("N8N webhook error:", response.status, await response.text())
      return NextResponse.json({ error: "Erro no agente IA" }, { status: 502 })
    }

    const data = await response.json()
    return NextResponse.json({
      reply: data.reply || data.output || data.message || "Sem resposta do agente.",
      sessionId: data.sessionId || sessionId,
    })
  } catch (err) {
    console.error("N8N webhook fetch error:", err)
    return NextResponse.json({ error: "Agente IA indisponivel" }, { status: 503 })
  }
}
