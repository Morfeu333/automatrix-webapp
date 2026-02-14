"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Send,
  Bot,
  User as UserIcon,
  Briefcase,
  Code,
  GraduationCap,
  Zap,
  Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AuthPanel } from "./auth-panel"
import type { UserRole, ProjectScope } from "@/types"
import { ProjectScopeCard } from "./project-scope-card"
import type { User } from "@supabase/supabase-js"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

interface QuickOption {
  label: string
  value: string
}

const roleTabs: { value: UserRole; label: string; icon: React.ElementType }[] = [
  { value: "client", label: "Cliente", icon: Briefcase },
  { value: "vibecoder", label: "Desenvolvedor", icon: Code },
  { value: "learner", label: "Estudante", icon: GraduationCap },
]

const welcomeMessages: Record<UserRole, string> = {
  client:
    "Ola! Sou o assistente da Automatrix. Vou te ajudar a definir o escopo do seu projeto de automacao. Me conta: o que voce gostaria de automatizar ou construir?",
  vibecoder:
    "Ola! Bem-vindo a Automatrix. Vou te ajudar a cadastrar seu perfil de desenvolvedor. Me conta: quais sao suas principais habilidades e experiencia?",
  learner:
    "Ola! Bem-vindo a Automatrix. Estou aqui para te ajudar a comecar sua jornada em automacao e IA. O que voce gostaria de aprender?",
  admin: "Ola! Como posso ajudar?",
}

type RightPanelState = "idle" | "chatting" | "complete"

interface Props {
  initialMessage?: string
  initialRole?: UserRole
}

export function LandingChat({ initialMessage, initialRole = "client" }: Props) {
  const [role, setRole] = useState<UserRole>(initialRole)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: welcomeMessages[initialRole] },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [rightPanel, setRightPanel] = useState<RightPanelState>("idle")
  const [showInlineAuth, setShowInlineAuth] = useState(false)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [sessionId] = useState(() => crypto.randomUUID())
  const [quickOptions, setQuickOptions] = useState<QuickOption[]>([])
  const [projectScope, setProjectScope] = useState<ProjectScope>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasInitialized = useRef(false)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading, showInlineAuth])

  // On mount: check auth and handle initial message
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: existingUser } }) => {
      if (existingUser) {
        setUser(existingUser)
      }

      if (initialMessage) {
        // Add user message to chat
        setMessages((prev) => [
          ...prev,
          { id: "initial-user", role: "user", content: initialMessage },
        ])

        if (existingUser) {
          setPendingMessage(initialMessage)
        } else {
          setPendingMessage(initialMessage)
          setShowInlineAuth(true)
        }
      }
    })
  }, [initialMessage])

  const sendToAgent = useCallback(
    async (messageText: string, addToChat = true) => {
      if (addToChat) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "user", content: messageText },
        ])
      }
      setIsLoading(true)
      setRightPanel("chatting")
      setQuickOptions([])

      try {
        const res = await fetch("/api/chat/onboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: messageText,
            sessionId,
            role,
            userName: user?.user_metadata?.full_name ?? undefined,
            userEmail: user?.email ?? undefined,
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          const errorMsg =
            (err as { error?: string }).error ??
            "Agente indisponivel no momento. Tente novamente."
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "assistant", content: errorMsg },
          ])
          return
        }

        const data = (await res.json()) as {
          response?: string
          output?: string
          options?: string[]
          complete?: boolean
          projectScope?: Partial<ProjectScope>
        }
        const reply = data.response ?? data.output ?? "Sem resposta do agente."

        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: reply },
        ])

        if (data.options?.length) {
          setQuickOptions(data.options.map((o) => ({ label: o, value: o })))
        }

        if (data.projectScope) {
          setProjectScope((prev) => ({
            ...prev,
            ...data.projectScope,
            llms: data.projectScope?.llms ?? prev.llms,
            integrations: data.projectScope?.integrations ?? prev.integrations,
          }))
        }

        if (data.complete) {
          setRightPanel("complete")
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Erro de conexao. Verifique sua internet e tente novamente.",
          },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [sessionId, role, user]
  )

  // Send pending message after auth completes
  useEffect(() => {
    if (user && pendingMessage) {
      const msg = pendingMessage
      setPendingMessage(null)
      sendToAgent(msg, false)
    }
  }, [user, pendingMessage, sendToAgent])

  function handleRoleChange(newRole: UserRole) {
    if (showInlineAuth || isLoading) return
    setRole(newRole)
    setMessages([
      { id: "welcome", role: "assistant", content: welcomeMessages[newRole] },
    ])
    setQuickOptions([])
    setProjectScope({})
    setInput("")
    setRightPanel("idle")
  }

  function handleSend() {
    const text = input.trim()
    if (!text || isLoading) return
    setInput("")

    if (!user) {
      setPendingMessage(text)
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: text },
      ])
      setShowInlineAuth(true)
      return
    }

    sendToAgent(text)
  }

  function handleQuickOption(option: QuickOption) {
    if (isLoading) return
    if (!user) {
      setPendingMessage(option.value)
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: option.value },
      ])
      setShowInlineAuth(true)
      return
    }
    sendToAgent(option.value)
  }

  function handleAuthComplete(authUser: User) {
    setUser(authUser)
    setShowInlineAuth(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-[calc(100vh-60px)] pt-[60px]">
      {/* LEFT PANEL — Chat */}
      <div className="flex w-full flex-col border-r border-border bg-card md:w-[420px] lg:w-[480px]">
        {/* Role Tabs */}
        <div className="flex border-b border-border">
          {roleTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = role === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => handleRoleChange(tab.value)}
                className={`flex flex-1 items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Messages + Inline Auth */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-3">
            {messages.map((msg) => {
              const isUser = msg.role === "user"
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      isUser ? "bg-primary" : "bg-primary/10"
                    }`}
                  >
                    {isUser ? (
                      <UserIcon className="h-3.5 w-3.5 text-primary-foreground" />
                    ) : (
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm max-w-[85%] ${
                      isUser
                        ? "rounded-tr-sm bg-primary text-primary-foreground"
                        : "rounded-tl-sm bg-muted text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              )
            })}

            {/* Inline Auth in Chat Flow */}
            {showInlineAuth && !user && (
              <div className="mx-auto mt-2 w-full">
                <AuthPanel
                  role={role}
                  onAuthComplete={handleAuthComplete}
                  inline
                />
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
                  <div className="flex gap-1">
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Options */}
        {quickOptions.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 border-t border-border px-4 py-2">
            {quickOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleQuickOption(opt)}
                className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                showInlineAuth
                  ? "Faca login para continuar..."
                  : "Digite sua mensagem..."
              }
              disabled={isLoading || showInlineAuth}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || showInlineAuth}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-automatrix-dark disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="hidden flex-1 md:block">
        {rightPanel === "idle" && (
          <div className="flex h-full flex-col items-center justify-center bg-background p-8">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl automatrix-gradient">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Automatrix</h2>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Nosso agente vai guiar voce pelo processo de onboarding.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { icon: Briefcase, label: "Defina seu projeto", color: "text-blue-400" },
                { icon: Code, label: "Cadastre seu perfil", color: "text-primary" },
                { icon: GraduationCap, label: "Comece a aprender", color: "text-purple-400" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {rightPanel === "chatting" && (
          <div className="flex h-full flex-col items-center justify-center bg-background p-8">
            {Object.keys(projectScope).length > 0 ? (
              <ProjectScopeCard scope={projectScope} />
            ) : (
              <>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Analisando seu projeto...
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Continue a conversa no chat ao lado.
                </p>
              </>
            )}
          </div>
        )}

        {rightPanel === "complete" && (
          <div className="flex h-full flex-col items-center justify-center bg-background p-8 gap-6">
            {Object.keys(projectScope).length > 0 && (
              <ProjectScopeCard scope={projectScope} isComplete />
            )}
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground">
                Onboarding completo!
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Seu perfil foi configurado com sucesso.
              </p>
              <a
                href="/dashboard"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-automatrix-dark"
              >
                Ir para o Dashboard
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
