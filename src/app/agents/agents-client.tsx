"use client"

import { useState, useRef, useEffect, useId } from "react"
import { Send, Menu, X, Loader2 } from "lucide-react"

const agents = [
  { id: "n8n", name: "N8N Expert", emoji: "\u{1F527}", color: "bg-orange-500", description: "Workflow automation & API integrations" },
  { id: "claude", name: "Claude Assistant", emoji: "\u{1F916}", color: "bg-purple-500", description: "Code analysis & problem solving" },
  { id: "supabase", name: "Supabase Specialist", emoji: "\u{26A1}", color: "bg-green-500", description: "Database & backend services" },
  { id: "general", name: "General Agent", emoji: "\u{1F310}", color: "bg-blue-500", description: "Versatile assistance" },
]

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

let messageCounter = 0

export function AgentsClient() {
  const uniqueId = useId()
  const [selectedAgent, setSelectedAgent] = useState(agents[0])
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Ola! Sou o ${agents[0].name}. Como posso ajudar voce hoje com automacoes N8N?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      id: `${uniqueId}-${++messageCounter}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          agentId: selectedAgent.id,
          sessionId,
        }),
      })

      const data = await res.json()

      if (data.sessionId) setSessionId(data.sessionId)

      const agentMessage: ChatMessage = {
        id: `${uniqueId}-${++messageCounter}`,
        role: "assistant",
        content: res.ok
          ? (data.reply || "Sem resposta.")
          : (data.error || "Erro no agente IA. Tente novamente."),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, agentMessage])
    } catch {
      const errorMessage: ChatMessage = {
        id: `${uniqueId}-${++messageCounter}`,
        role: "assistant",
        content: "Erro de conexao com o agente. Tente novamente.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  function selectAgent(agent: typeof agents[0]) {
    setSelectedAgent(agent)
    setSessionId(null)
    setMessages([
      {
        id: `${uniqueId}-welcome-${agent.id}`,
        role: "assistant",
        content: `Ola! Sou o ${agent.name}. ${agent.description}. Como posso ajudar?`,
        timestamp: new Date(),
      },
    ])
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen pt-16">
      {/* Agent Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-card pt-16 transition-transform lg:static lg:translate-x-0`}>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-foreground">Agentes IA</h2>
          <p className="mt-1 text-xs text-muted-foreground">Selecione um especialista</p>
        </div>
        <div className="flex flex-col gap-1 px-3">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => selectAgent(agent)}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                selectedAgent.id === agent.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="text-2xl">{agent.emoji}</span>
              <div>
                <div className="text-sm font-medium">{agent.name}</div>
                <div className="text-xs opacity-70">{agent.description}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Chat Header */}
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
          <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-2xl">{selectedAgent.emoji}</span>
          <div>
            <div className="font-medium text-foreground">{selectedAgent.name}</div>
            <div className="text-xs text-muted-foreground">{selectedAgent.description}</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className="mt-1 block text-[10px] opacity-60">
                    {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Pensando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card p-4">
          <form onSubmit={handleSend} className="mx-auto flex max-w-3xl items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Pergunte ao ${selectedAgent.name}...`}
              disabled={loading}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-automatrix-dark disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
