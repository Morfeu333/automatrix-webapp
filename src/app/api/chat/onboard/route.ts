const N8N_WEBHOOK_URL = "https://n8n.automatrix.site/webhook/onboardf"

export async function POST(req: Request) {
  try {
    const { message, sessionId, role, userName, userEmail } = await req.json()

    if (!message || !sessionId || !role) {
      return Response.json(
        { error: "Campos obrigatorios: message, sessionId, role" },
        { status: 400 }
      )
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId, role, userName, userEmail }),
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      return Response.json(
        { error: "Agente indisponivel no momento. Tente novamente." },
        { status: 502 }
      )
    }

    const raw = await response.json()

    // Normalize N8N response: it may return { response, output, message } depending on config
    // When workflow uses "Respond Immediately", N8N returns {"message":"Workflow was started"}
    const hasAgentResponse = raw.response || raw.output
    if (!hasAgentResponse && raw.message === "Workflow was started") {
      return Response.json({
        response:
          "Recebi sua mensagem! Nosso agente esta sendo configurado. Em breve voce tera respostas em tempo real aqui. Enquanto isso, explore nossos templates em /workflows.",
      })
    }

    // N8N may return { output: "{\"response\":\"...\",\"options\":[...]}" }
    // where the agent's JSON is stringified inside the output field.
    // Parse it so the frontend receives a proper object.
    if (typeof raw.output === "string" && !raw.response) {
      try {
        const parsed = JSON.parse(raw.output)
        return Response.json(parsed)
      } catch {
        // If output is plain text (not JSON), use it as the response text
        return Response.json({ response: raw.output })
      }
    }

    return Response.json(raw)
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return Response.json(
        { error: "Agente indisponivel no momento. Tente novamente." },
        { status: 504 }
      )
    }
    console.error("Chat onboard proxy error:", error)
    return Response.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    )
  }
}
