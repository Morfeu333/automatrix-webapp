"use client"

import { useState } from "react"
import { useChat } from "ai/react"
import { ArrowRight, ArrowLeft, Loader2, User, Bot, Send, SkipForward } from "lucide-react"
import { completeClientOnboarding } from "./actions"
import { useRouter } from "next/navigation"

interface Props {
  displayName: string
  userId: string
  existingProfile: {
    full_name: string | null
    email: string
  }
}

export function ClientOnboarding({ displayName, userId, existingProfile }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Step 1 — Profile
  const [fullName, setFullName] = useState(existingProfile.full_name ?? "")
  const [company, setCompany] = useState("")
  const [industry, setIndustry] = useState("")
  const [website, setWebsite] = useState("")

  // Step 2 — AI Chat
  const { messages, input, handleInputChange, handleSubmit: chatSubmit, isLoading: chatLoading } = useChat({
    api: "/api/chat/onboarding",
  })

  async function handleProfileNext() {
    if (!fullName.trim()) {
      setError("Nome e obrigatorio")
      return
    }
    setError("")
    setStep(2)
  }

  async function handleFinish() {
    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.set("full_name", fullName)
    formData.set("company", company)
    formData.set("industry", industry)
    formData.set("website", website)

    const result = await completeClientOnboarding(formData)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">Bem-vindo, {displayName}!</h1>
        <p className="mt-1 text-muted-foreground">Vamos configurar seu perfil e entender seu projeto.</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-center gap-4">
        {[
          { id: 1, label: "Perfil" },
          { id: 2, label: "Assistente IA" },
        ].map((s, i) => (
          <div key={s.id} className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  s.id === step ? "bg-primary text-primary-foreground" : s.id < step ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {s.id}
              </div>
              <span className={`text-sm ${s.id === step ? "font-medium text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
            {i < 1 && <div className={`h-0.5 w-12 ${step > 1 ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Step 1 — Profile */}
      {step === 1 && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Seus Dados</h2>
          <p className="text-sm text-muted-foreground">Informacoes basicas para personalizar sua experiencia.</p>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Nome Completo *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Empresa</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Industria</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary"
              >
                <option value="">Selecione...</option>
                <option value="tecnologia">Tecnologia</option>
                <option value="saude">Saude</option>
                <option value="educacao">Educacao</option>
                <option value="financas">Financas</option>
                <option value="ecommerce">E-commerce</option>
                <option value="marketing">Marketing</option>
                <option value="imobiliario">Imobiliario</option>
                <option value="alimentacao">Alimentacao</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleProfileNext}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-automatrix-dark"
            >
              Proximo <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — AI Chat */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Chat header */}
            <div className="border-b border-border px-4 py-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Assistente de Projetos</h3>
                <p className="text-xs text-muted-foreground">Descreva seu projeto para gerar um escopo automaticamente</p>
              </div>
            </div>

            {/* Messages area */}
            <div className="h-[400px] overflow-y-auto p-4">
              <div className="flex flex-col gap-3">
                {messages.length === 0 && (
                  <div className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm text-foreground max-w-[80%]">
                      Ola, {displayName}! Sou seu assistente de projetos. Me conte: o que voce gostaria de automatizar ou construir?
                    </div>
                  </div>
                )}
                {messages.map((msg) => {
                  const isUser = msg.role === "user"
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isUser ? "bg-primary" : "bg-primary/10"}`}>
                        {isUser ? <User className="h-3.5 w-3.5 text-primary-foreground" /> : <Bot className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <div className={`rounded-2xl px-4 py-2.5 text-sm max-w-[80%] ${
                        isUser
                          ? "rounded-tr-sm bg-primary text-primary-foreground"
                          : "rounded-tl-sm bg-muted text-foreground"
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  )
                })}
                {chatLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat input */}
            <div className="border-t border-border p-3">
              <form onSubmit={chatSubmit} className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-automatrix-dark disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                <SkipForward className="h-4 w-4" />
                {messages.length > 0 ? "Concluir" : "Pular por agora"}
              </button>
              {messages.length >= 4 && (
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-automatrix-dark disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Ir para o Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
