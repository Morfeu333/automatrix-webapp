"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Send, Menu, X, Plus, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  searchUsers,
  markConversationRead,
} from "@/app/(dashboard)/actions"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string
}

interface Conversation {
  id: string
  last_message: string | null
  last_message_at: string | null
  other_user: Profile | null
  unread_count: number
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  message_type: string
  status: string
  created_at: string
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ""
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "agora"
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function Avatar({ user, size = "md" }: { user: Profile | null; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10"
  const text = size === "sm" ? "text-xs" : "text-sm"
  const name = user?.full_name || user?.email || "?"
  if (user?.avatar_url) {
    return <img src={user.avatar_url} alt={name} className={`${dim} rounded-full object-cover`} />
  }
  return (
    <div className={`${dim} flex items-center justify-center rounded-full bg-muted ${text} font-medium`}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function ChatClient({ userId }: { userId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)

  // New conversation modal
  const [showNewChat, setShowNewChat] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = conversations.find((c) => c.id === selectedId) ?? null

  // Load conversations
  const loadConversations = useCallback(async () => {
    const { data } = await getConversations()
    if (data) setConversations(data as Conversation[])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedId) return
    setLoadingMessages(true)
    getMessages(selectedId).then(({ data }) => {
      if (data) setMessages(data as Message[])
      setLoadingMessages(false)
    })
    markConversationRead(selectedId)
  }, [selectedId])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Supabase Realtime subscription for new messages
  useEffect(() => {
    if (!selectedId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${selectedId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
          markConversationRead(selectedId)
          // Update conversation list
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedId
                ? { ...c, last_message: newMsg.content?.slice(0, 100) ?? null, last_message_at: newMsg.created_at, unread_count: 0 }
                : c
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedId])

  // Also subscribe to all conversations for unread indicators
  useEffect(() => {
    if (!conversations.length) return

    const supabase = createClient()
    const channel = supabase
      .channel("all-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as Message
          if (newMsg.sender_id === userId) return
          setConversations((prev) =>
            prev.map((c) =>
              c.id === newMsg.conversation_id
                ? {
                    ...c,
                    last_message: newMsg.content?.slice(0, 100) ?? null,
                    last_message_at: newMsg.created_at,
                    unread_count: c.id === selectedId ? 0 : c.unread_count + 1,
                  }
                : c
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversations.length, userId, selectedId])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !selectedId || sending) return
    const text = input.trim()
    setInput("")
    setSending(true)

    // Optimistic: add message immediately
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedId,
      sender_id: userId,
      content: text,
      message_type: "text",
      status: "sent",
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    const { error } = await sendMessage(selectedId, text)
    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      setInput(text)
    }
    setSending(false)
    inputRef.current?.focus()
  }

  async function handleSearch(q: string) {
    setSearchQuery(q)
    if (q.trim().length < 2) { setSearchResults([]); return }
    setSearching(true)
    const { data } = await searchUsers(q)
    setSearchResults((data as Profile[]) ?? [])
    setSearching(false)
  }

  async function handleStartChat(otherUserId: string) {
    const { data: convId, error } = await createConversation(otherUserId)
    if (error || !convId) return
    setShowNewChat(false)
    setSearchQuery("")
    setSearchResults([])
    await loadConversations()
    setSelectedId(convId)
    setSidebarOpen(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center pt-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen pt-16">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Conversations Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-80 border-r border-border bg-card pt-16 transition-transform lg:static lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-foreground">Mensagens</h2>
          <button
            onClick={() => setShowNewChat(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
            title="Nova conversa"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* New chat search */}
        {showNewChat && (
          <div className="border-b border-border px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar usuario por nome ou email..."
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-8 text-sm outline-none focus:border-primary"
                autoFocus
              />
              <button onClick={() => { setShowNewChat(false); setSearchQuery(""); setSearchResults([]) }} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            {searching && <p className="mt-2 text-xs text-muted-foreground">Buscando...</p>}
            {searchResults.map((u) => (
              <button
                key={u.id}
                onClick={() => handleStartChat(u.id)}
                className="mt-1 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted"
              >
                <Avatar user={u} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{u.full_name || u.email}</div>
                  {u.full_name && <div className="truncate text-xs text-muted-foreground">{u.email}</div>}
                </div>
              </button>
            ))}
            {searchQuery.length >= 2 && !searching && !searchResults.length && (
              <p className="mt-2 text-xs text-muted-foreground">Nenhum usuario encontrado.</p>
            )}
          </div>
        )}

        <div className="flex flex-col overflow-y-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
          {conversations.length === 0 && !showNewChat && (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhuma conversa ainda.</p>
              <button onClick={() => setShowNewChat(true)} className="text-sm text-primary hover:underline">
                Iniciar conversa
              </button>
            </div>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => { setSelectedId(conv.id); setSidebarOpen(false) }}
              className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${selectedId === conv.id ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-muted"}`}
            >
              <div className="relative">
                <Avatar user={conv.other_user} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium text-foreground">
                    {conv.other_user?.full_name || conv.other_user?.email || "Usuario"}
                  </span>
                  <span className="text-xs text-muted-foreground">{timeAgo(conv.last_message_at)}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{conv.last_message || "Sem mensagens"}</p>
              </div>
              {conv.unread_count > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {conv.unread_count}
                </span>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        {selectedId && selected ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
              <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <Avatar user={selected.other_user} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {selected.other_user?.full_name || selected.other_user?.email || "Usuario"}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mx-auto flex max-w-3xl flex-col gap-3">
                {loadingMessages && (
                  <div className="flex justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
                {!loadingMessages && messages.length === 0 && (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    Envie a primeira mensagem para iniciar a conversa.
                  </p>
                )}
                {messages.map((msg) => {
                  const isMine = msg.sender_id === userId
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <span className="mt-0.5 block text-[10px] opacity-60">
                          {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-border bg-card p-4">
              <form onSubmit={handleSend} className="mx-auto flex max-w-3xl items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-automatrix-dark disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <button className="mb-4 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <MessageSquare className="h-16 w-16 text-muted-foreground/30" />
            <p className="text-lg text-muted-foreground">Selecione uma conversa</p>
            <p className="text-sm text-muted-foreground">ou inicie uma nova</p>
            <button
              onClick={() => { setShowNewChat(true); setSidebarOpen(true) }}
              className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-automatrix-dark"
            >
              Nova Conversa
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
