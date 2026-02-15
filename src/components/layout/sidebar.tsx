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
  CheckSquare,
  Users,
  Phone,
  Calendar,
  Target,
  UserCog,
  GraduationCap,
  BarChart3,
  FileText,
  Briefcase,
  type LucideIcon,
} from "lucide-react"

interface SidebarLink {
  name: string
  href: string
  icon: LucideIcon
}

interface SidebarSection {
  label?: string
  links: SidebarLink[]
}

const staffSections: SidebarSection[] = [
  {
    links: [
      { name: "Agency Home", href: "/dashboard/agency", icon: LayoutDashboard },
      { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
      { name: "Clientes", href: "/dashboard/clients", icon: Users },
      { name: "Contatos", href: "/dashboard/contacts", icon: Phone },
      { name: "Reunioes", href: "/dashboard/meetings", icon: Calendar },
      { name: "Audiences", href: "/dashboard/audiences", icon: Target },
      { name: "Equipe", href: "/dashboard/employees", icon: UserCog },
      { name: "Treinamento", href: "/dashboard/training", icon: GraduationCap },
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { name: "Daily Report", href: "/dashboard/daily-report", icon: FileText },
    ],
  },
  {
    label: "Marketplace",
    links: [
      { name: "Workflows", href: "/workflows", icon: Zap },
      { name: "Mensagens", href: "/chat", icon: MessageSquare },
      { name: "Agentes IA", href: "/agents", icon: Bot },
    ],
  },
  {
    label: "Conta",
    links: [
      { name: "Assinatura", href: "/dashboard/billing", icon: CreditCard },
      { name: "Perfil", href: "/dashboard/profile", icon: User },
      { name: "Configuracoes", href: "/dashboard/settings", icon: Settings },
    ],
  },
]

const clientSections: SidebarSection[] = [
  {
    links: [
      { name: "Meu Projeto", href: "/dashboard/clients/me", icon: Briefcase },
      { name: "Meu Portal", href: "/dashboard/clients/me/portal", icon: LayoutDashboard },
    ],
  },
  {
    label: "Marketplace",
    links: [
      { name: "Meus Projetos", href: "/dashboard/projects", icon: FolderKanban },
      { name: "Workflows", href: "/workflows", icon: Zap },
      { name: "Mensagens", href: "/chat", icon: MessageSquare },
    ],
  },
  {
    label: "Conta",
    links: [
      { name: "Assinatura", href: "/dashboard/billing", icon: CreditCard },
      { name: "Perfil", href: "/dashboard/profile", icon: User },
      { name: "Configuracoes", href: "/dashboard/settings", icon: Settings },
    ],
  },
]

const defaultSections: SidebarSection[] = [
  {
    links: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Meus Projetos", href: "/dashboard/projects", icon: FolderKanban },
      { name: "Workflows", href: "/workflows", icon: Zap },
      { name: "Mensagens", href: "/chat", icon: MessageSquare },
      { name: "Agentes IA", href: "/agents", icon: Bot },
    ],
  },
  {
    label: "Conta",
    links: [
      { name: "Assinatura", href: "/dashboard/billing", icon: CreditCard },
      { name: "Perfil", href: "/dashboard/profile", icon: User },
      { name: "Configuracoes", href: "/dashboard/settings", icon: Settings },
    ],
  },
]

function getSections(role: string): SidebarSection[] {
  if (role === "admin" || role === "vibecoder") return staffSections
  if (role === "client") return clientSections
  return defaultSections
}

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const sections = getSections(role)

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
      <nav className="flex flex-col gap-1 p-4">
        {sections.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            {section.label && (
              <p className="mb-1 mt-4 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {section.label}
              </p>
            )}
            {section.links.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/dashboard" && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
          </div>
        ))}
      </nav>
    </aside>
  )
}
