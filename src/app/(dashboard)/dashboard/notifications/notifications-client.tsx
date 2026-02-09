"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Bell, CheckCheck, Info, Zap, DollarSign, FolderKanban, UserCheck, Check, Trash2 } from "lucide-react"
import { markNotificationsRead, markSingleNotificationRead, clearOldNotifications } from "../../actions"

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  read: boolean
  link: string | null
  created_at: string
}

const typeIcons: Record<string, React.ElementType> = {
  system: Info,
  workflow: Zap,
  payment: DollarSign,
  project: FolderKanban,
  approval: UserCheck,
}

const FILTER_TABS = [
  { id: "all", label: "Todas" },
  { id: "system", label: "Sistema" },
  { id: "project", label: "Projetos" },
  { id: "payment", label: "Pagamentos" },
]

export function NotificationsClient({ notifications }: { notifications: Notification[] }) {
  const [items, setItems] = useState(notifications)
  const [isPending, startTransition] = useTransition()
  const [activeFilter, setActiveFilter] = useState("all")
  const [clearPending, setClearPending] = useState(false)

  const unreadCount = items.filter((n) => !n.read).length
  const readCount = items.filter((n) => n.read).length

  const filtered = activeFilter === "all" ? items : items.filter((n) => n.type === activeFilter)

  function handleMarkAllRead() {
    startTransition(async () => {
      const result = await markNotificationsRead()
      if (!result.error) {
        setItems((prev) => prev.map((n) => ({ ...n, read: true })))
      }
    })
  }

  function handleMarkSingleRead(id: string) {
    startTransition(async () => {
      const result = await markSingleNotificationRead(id)
      if (!result.error) {
        setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
      }
    })
  }

  async function handleClearRead() {
    setClearPending(true)
    const result = await clearOldNotifications()
    setClearPending(false)
    if (!result.error) {
      setItems((prev) => prev.filter((n) => !n.read))
    }
  }

  return (
    <div className="pt-20 pb-16">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Notificacoes</h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} nao lida${unreadCount > 1 ? "s" : ""}` : "Tudo em dia"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {readCount > 0 && (
              <button
                onClick={handleClearRead}
                disabled={clearPending}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {clearPending ? "Limpando..." : "Limpar lidas"}
              </button>
            )}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
              >
                <CheckCheck className="h-4 w-4" />
                {isPending ? "Marcando..." : "Marcar todas"}
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-4 flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((notif) => {
            const Icon = typeIcons[notif.type] ?? Bell
            const content = (
              <div
                className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                  notif.read
                    ? "border-border bg-card"
                    : "border-primary/20 bg-primary/5"
                }`}
              >
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${notif.read ? "bg-muted" : "bg-primary/10"}`}>
                  <Icon className={`h-4 w-4 ${notif.read ? "text-muted-foreground" : "text-primary"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${notif.read ? "text-foreground/70" : "text-foreground"}`}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  {notif.body && (
                    <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{notif.body}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(notif.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {!notif.read && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkSingleRead(notif.id) }}
                    disabled={isPending}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Marcar como lida"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            )

            return notif.link ? (
              <Link key={notif.id} href={notif.link} className="block">
                {content}
              </Link>
            ) : (
              <div key={notif.id}>{content}</div>
            )
          })}

          {filtered.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">
                {activeFilter === "all" ? "Nenhuma notificacao ainda." : "Nenhuma notificacao nesta categoria."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
