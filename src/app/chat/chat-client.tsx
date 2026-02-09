"use client"

import { useState } from "react"
import { Search, Send, Menu, X, Circle } from "lucide-react"

const mockConversations = [
  { id: "1", name: "Carlos M.", lastMessage: "Ola, gostaria de saber mais sobre o projeto", time: "2h", unread: 2, online: true },
  { id: "2", name: "Marina S.", lastMessage: "Otimo, vou enviar a proposta", time: "5h", unread: 0, online: false },
  { id: "3", name: "Pedro L.", lastMessage: "O workflow esta funcionando perfeitamente", time: "1d", unread: 0, online: true },
]

interface ChatMsg {
  id: string
  sender: string
  content: string
  time: string
  isMine: boolean
}

export default function ChatClient() {
  const [selected, setSelected] = useState(mockConversations[0])
  const [input, setInput] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: "1", sender: "Carlos M.", content: "Ola, gostaria de saber mais sobre o projeto de automacao", time: "14:30", isMine: false },
    { id: "2", sender: "Voce", content: "Ola Carlos! Claro, o projeto envolve integracao com N8N e Supabase.", time: "14:32", isMine: true },
    { id: "3", sender: "Carlos M.", content: "Perfeito, quanto tempo leva para implementar?", time: "14:35", isMine: false },
  ])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "Voce", content: input, time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), isMine: true }])
    setInput("")
  }

  return (
    <div className="flex h-screen pt-16">
      {/* Conversations Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-80 border-r border-border bg-card pt-16 transition-transform lg:static lg:translate-x-0`}>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-foreground">Mensagens</h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Buscar conversas..." className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary" />
          </div>
        </div>
        <div className="flex flex-col">
          {mockConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => { setSelected(conv); setSidebarOpen(false) }}
              className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${selected.id === conv.id ? "bg-primary/5" : "hover:bg-muted"}`}
            >
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">{conv.name.charAt(0)}</div>
                {conv.online && <Circle className="absolute -right-0.5 -bottom-0.5 h-3 w-3 fill-green-500 text-green-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{conv.name}</span>
                  <span className="text-xs text-muted-foreground">{conv.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{conv.unread}</span>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
          <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">{selected.name.charAt(0)}</div>
          <div>
            <div className="text-sm font-medium text-foreground">{selected.name}</div>
            <div className="text-xs text-muted-foreground">{selected.online ? "Online" : "Offline"}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.isMine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  <p className="text-sm">{msg.content}</p>
                  <span className="mt-0.5 block text-[10px] opacity-60">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border bg-card p-4">
          <form onSubmit={handleSend} className="mx-auto flex max-w-3xl items-center gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Digite sua mensagem..." className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            <button type="submit" className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-automatrix-dark">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
