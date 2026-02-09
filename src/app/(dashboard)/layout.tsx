"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Zap,
  FolderKanban,
  MessageSquare,
  Bot,
  Settings,
  User,
  CreditCard,
} from "lucide-react"

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Meus Projetos", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Workflows", href: "/workflows", icon: Zap },
  { name: "Mensagens", href: "/chat", icon: MessageSquare },
  { name: "Agentes IA", href: "/agents", icon: Bot },
  { name: "Assinatura", href: "/dashboard/billing", icon: CreditCard },
  { name: "Perfil", href: "/dashboard/profile", icon: User },
  { name: "Configuracoes", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen pt-16">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-border bg-card lg:block">
        <nav className="flex flex-col gap-1 p-4">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  )
}
