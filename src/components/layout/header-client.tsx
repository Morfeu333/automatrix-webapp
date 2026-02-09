"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import {
  Menu,
  X,
  Zap,
  BookOpen,
  FolderKanban,
  Bot,
  LogIn,
  LogOut,
  LayoutDashboard,
  Settings,
  MessageSquare,
  ChevronDown,
  Shield,
  Bell,
} from "lucide-react"
import { signOut } from "@/app/auth/actions"
import type { UserRole, SubscriptionTier } from "@/types"

const navIcons: Record<string, React.ElementType> = {
  Workflows: Zap,
  Blog: BookOpen,
  Projetos: FolderKanban,
  "Agentes IA": Bot,
}

interface HeaderUser {
  id: string
  email: string
  full_name: string
  avatar_url: string
  role: UserRole
  subscription_tier: SubscriptionTier
}

interface HeaderClientProps {
  navigation: { name: string; href: string }[]
  user: HeaderUser | null
  notificationCount?: number
}

const tierBadge: Record<SubscriptionTier, { label: string; class: string }> = {
  free: { label: "Free", class: "bg-zinc-700 text-zinc-300" },
  pro: { label: "Pro", class: "bg-primary/20 text-primary" },
  business: { label: "Business", class: "bg-purple-500/20 text-purple-400" },
}

export function HeaderClient({ navigation, user, notificationCount = 0 }: HeaderClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg automatrix-gradient">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold automatrix-text-gradient">
            Automatrix
          </span>
        </Link>

        <div className="hidden lg:flex lg:items-center lg:gap-1">
          {navigation.map((item) => {
            const Icon = navIcons[item.name] ?? Zap
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Desktop: Auth section */}
        <div className="hidden lg:flex lg:items-center lg:gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Notification bell */}
              <Link
                href="/dashboard/notifications"
                className="relative rounded-lg p-2 text-foreground/60 transition-colors hover:bg-accent hover:text-foreground"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </Link>

            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent"
              >
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.full_name}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                    {initials}
                  </div>
                )}
                <span className="max-w-[120px] truncate text-sm font-medium text-foreground">
                  {user.full_name || user.email}
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-sm font-medium text-foreground truncate">{user.full_name || "Usuario"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tierBadge[user.subscription_tier].class}`}>
                      {tierBadge[user.subscription_tier].label}
                    </span>
                  </div>

                  <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-foreground">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link href="/chat" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-foreground">
                    <MessageSquare className="h-4 w-4" />
                    Mensagens
                  </Link>
                  <Link href="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-foreground">
                    <Settings className="h-4 w-4" />
                    Configuracoes
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-foreground">
                      <Shield className="h-4 w-4" />
                      Admin
                    </Link>
                  )}

                  <div className="mt-1 border-t border-border pt-1">
                    <form action={signOut}>
                      <button type="submit" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                <LogIn className="h-4 w-4" />
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-automatrix-dark"
              >
                Criar Conta
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="lg:hidden rounded-lg p-2 text-foreground/70"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-4">
          <div className="flex flex-col gap-1">
            {navigation.map((item) => {
              const Icon = navIcons[item.name] ?? Zap
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-accent hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
            <hr className="my-2 border-border" />
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2">
                  {user.avatar_url ? (
                    <Image src={user.avatar_url} alt={user.full_name} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                      {initials}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.full_name || user.email}</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tierBadge[user.subscription_tier].class}`}>
                      {tierBadge[user.subscription_tier].label}
                    </span>
                  </div>
                </div>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-accent">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link href="/chat" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-accent">
                  <MessageSquare className="h-4 w-4" />
                  Mensagens
                </Link>
                <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-accent">
                  <Settings className="h-4 w-4" />
                  Configuracoes
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-accent">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <form action={signOut}>
                  <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10">
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground">
                  Criar Conta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
