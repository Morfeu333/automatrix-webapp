import { streamText, tool } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const SYSTEM_PROMPT = `Voce e o assistente de onboarding da Automatrix, uma plataforma de automacao e IA.

Seu papel e ajudar o cliente a descrever o projeto ou automacao que ele deseja criar.
Faca perguntas NAO TECNICAS para entender o que o cliente precisa.

FLUXO DA CONVERSA:
1. Cumprimente o usuario e pergunte o que ele gostaria de automatizar ou construir
2. Pergunte sobre o objetivo principal (ex: "Quero automatizar postagens no Instagram")
3. Pergunte quais plataformas/servicos ele usa ou precisa integrar
4. Pergunte se e algo simples (automacao de backend) ou precisa de interface para usuarios
5. Pergunte sobre volume esperado (quantas vezes por dia/semana o processo roda)
6. Pergunte sobre orcamento aproximado e prazo desejado

REGRAS:
- Fale sempre em portugues brasileiro
- Use linguagem simples e acessivel, sem jargoes tecnicos
- Faca UMA pergunta por vez
- Seja conciso e direto
- Maximo de 8 perguntas antes de gerar o resumo
- Apos coletar informacoes suficientes, chame a ferramenta extractProject para salvar os dados

NIVEIS DE APP:
- LV1: Automacao de backend apenas (bots, scrapers, integracao entre APIs)
- LV2: Automacao com alguma interface limitada (dashboard, notificacoes)
- LV3: Aplicacao completa com IA interativa (chatbots, assistentes, apps completos)

Baseado nas respostas, determine o nivel e extraia os requisitos tecnicos automaticamente.`

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { messages } = await req.json()

  // Rate limit: max 30 messages per conversation
  if (messages.length > 60) {
    return new Response("Conversa muito longa. Por favor, inicie uma nova sessao.", { status: 400 })
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: SYSTEM_PROMPT,
    messages,
    tools: {
      extractProject: tool({
        description: "Extrair requisitos do projeto a partir da conversa com o cliente. Chame esta ferramenta quando tiver informacoes suficientes sobre o projeto.",
        parameters: z.object({
          title: z.string().describe("Nome curto do projeto"),
          description: z.string().describe("Descricao detalhada do que o cliente quer"),
          appLevel: z.enum(["lv1", "lv2", "lv3"]).describe("Nivel de complexidade do app"),
          requiredApis: z.array(z.string()).describe("Lista de APIs/servicos necessarios (ex: Instagram API, OpenAI, WhatsApp)"),
          estimatedBudget: z.string().describe("Orcamento estimado mencionado pelo cliente ou sugerido"),
          platform: z.string().describe("Plataforma alvo (web, mobile, backend, automacao)"),
          timeline: z.string().describe("Prazo desejado pelo cliente"),
        }),
        execute: async (data) => {
          // Save to onboarding_sessions
          await supabase.from("onboarding_sessions").insert({
            user_id: user.id,
            conversation: messages,
            extracted_requirements: data,
            app_level: data.appLevel as "lv1" | "lv2" | "lv3",
            status: "completed",
          })

          return {
            success: true,
            message: `Projeto "${data.title}" registrado! Nivel: ${data.appLevel.toUpperCase()}. APIs: ${data.requiredApis.join(", ")}.`,
          }
        },
      }),
    },
    maxSteps: 3,
  })

  return result.toDataStreamResponse()
}
