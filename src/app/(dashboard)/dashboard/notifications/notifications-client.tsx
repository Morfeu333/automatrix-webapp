"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Bell, CheckCheck, Info, Zap, DollarSign, FolderKanban, UserCheck } from "lucide-react"
import { markNotificationsRead } from "../../actions"

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

export function NotificationsClient({ notifications }: { notifications: Notification[] }) {
  const [items, setItems] = useState(notifications)
  const [isPending, startTransition] = useTransition()

  const unreadCount = items.filter((n) => !n.read).length

  function handleMarkAllRead() {
    startTransition(async () => {
      const result = await markNotificationsRead()
      if (!result.error) {
        setItems((prev) => prev.map((n) => ({ ...n, read: true })))
      }
    })
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
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" />
              {isPending ? "Marcando..." : "Marcar todas como lidas"}
            </button>
          )}
        </div>

        <div className="space-y-2">
          {items.map((notif) => {
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

          {items.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">Nenhuma notificacao ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
