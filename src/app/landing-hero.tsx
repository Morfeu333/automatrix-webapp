"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowUp,
  ArrowRight,
  Heart,
  Zap,
  Briefcase,
  Code,
  GraduationCap,
} from "lucide-react"
import type { UserRole } from "@/types"

interface Props {
  onSubmit: (message: string, role: UserRole) => void
}

const roles = [
  { value: "client" as const, label: "Cliente", icon: Briefcase },
  { value: "vibecoder" as const, label: "Dev", icon: Code },
  { value: "learner" as const, label: "Estudante", icon: GraduationCap },
]

const templates = [
  { title: "WhatsApp Bot", subtitle: "Atendimento automatico via WhatsApp", gradient: "from-green-400 to-emerald-600" },
  { title: "CRM Pipeline", subtitle: "Gestao inteligente de leads", gradient: "from-blue-400 to-blue-600" },
  { title: "Email Marketing", subtitle: "Sequencias de email com IA", gradient: "from-pink-400 to-rose-600" },
  { title: "Social Media", subtitle: "Agendamento e publicacao", gradient: "from-orange-400 to-orange-600" },
  { title: "E-commerce Sync", subtitle: "Estoque e pedidos integrados", gradient: "from-teal-400 to-teal-600" },
  { title: "Customer Support", subtitle: "Tickets com IA", gradient: "from-yellow-400 to-amber-600" },
  { title: "Data Pipeline", subtitle: "ETL e transformacao de dados", gradient: "from-purple-400 to-purple-600" },
  { title: "Analytics Dashboard", subtitle: "Relatorios automatizados", gradient: "from-red-400 to-red-600" },
]

const apps = [
  { title: "AutoFlow", subtitle: "Automacao de workflows", likes: 865, gradient: "from-indigo-500 to-purple-600" },
  { title: "DataSync AI", subtitle: "Pipelines inteligentes", likes: 711, gradient: "from-cyan-500 to-blue-600" },
  { title: "ChatBot Pro", subtitle: "IA conversacional", likes: 655, gradient: "from-emerald-500 to-green-600" },
  { title: "FormGenius", subtitle: "Analise com IA", likes: 426, gradient: "from-rose-500 to-pink-600" },
  { title: "TaskRunner", subtitle: "Automacao de tarefas", likes: 365, gradient: "from-amber-500 to-orange-600" },
  { title: "APIBridge", subtitle: "Conector de APIs", likes: 343, gradient: "from-violet-500 to-purple-600" },
  { title: "ReportAI", subtitle: "Relatorios automaticos", likes: 272, gradient: "from-sky-500 to-blue-600" },
  { title: "ScaleOps", subtitle: "Operacoes em escala", likes: 175, gradient: "from-fuchsia-500 to-pink-600" },
]

export function LandingHero({ onSubmit }: Props) {
  const [input, setInput] = useState("")
  const [role, setRole] = useState<UserRole>("client")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim()) {
      onSubmit(input.trim(), role)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (input.trim()) onSubmit(input.trim(), role)
    }
  }

  return (
    <div className="flex flex-col pt-[60px]">
      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-60px)] flex-col items-center justify-center px-4">
        {/* Aurora gradient blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-[30%] left-[5%] h-[70%] w-[45%] rounded-full bg-emerald-500/15 blur-[120px]" />
          <div className="absolute -top-[20%] left-[25%] h-[55%] w-[50%] rounded-full bg-pink-500/10 blur-[120px]" />
          <div className="absolute -top-[25%] right-[5%] h-[60%] w-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
          <div className="absolute top-[5%] left-[40%] h-[30%] w-[30%] rounded-full bg-purple-500/10 blur-[100px]" />
        </div>

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-muted-foreground">
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            Novo
          </span>
          Agente IA para onboarding
          <ArrowRight className="h-3.5 w-3.5" />
        </div>

        {/* Title */}
        <h1 className="max-w-4xl text-center text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Automatize com{" "}
          <span className="automatrix-text-gradient">Inteligencia Artificial</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 max-w-xl text-center text-lg text-muted-foreground">
          Crie automacoes, apps e workflows conversando com nosso agente IA
        </p>

        {/* Input Card */}
        <form onSubmit={handleSubmit} className="mt-10 w-full max-w-2xl">
          <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-2xl shadow-black/20 backdrop-blur-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Descreva o que voce quer automatizar..."
              className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              rows={3}
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-1.5">
                {roles.map((r) => {
                  const Icon = r.icon
                  const isActive = role === r.value
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {r.label}
                    </button>
                  )
                })}
              </div>
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-automatrix-dark disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Discover Templates */}
      <section className="px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Descubra Templates
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Comece seu proximo projeto com um template
              </p>
            </div>
            <Link
              href="/workflows"
              className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {templates.map((t) => (
              <Link key={t.title} href="/workflows" className="group">
                <div
                  className={`aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br ${t.gradient} flex items-end p-4 transition-transform group-hover:scale-[1.02]`}
                >
                  <span className="text-sm font-semibold text-white drop-shadow-md">
                    {t.title}
                  </span>
                </div>
                <h3 className="mt-2.5 text-sm font-medium text-foreground">
                  {t.title}
                </h3>
                <p className="text-xs text-muted-foreground">{t.subtitle}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Discover Apps/Automations */}
      <section className="px-4 pb-16 lg:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Descubra Automacoes
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore o que outros estao construindo
              </p>
            </div>
            <Link
              href="/workflows"
              className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {apps.map((a) => (
              <Link key={a.title} href="/workflows" className="group">
                <div
                  className={`aspect-[16/10] overflow-hidden rounded-xl bg-gradient-to-br ${a.gradient} transition-transform group-hover:scale-[1.02]`}
                />
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                    <Zap className="h-3 w-3 text-primary" />
                  </div>
                  <span className="flex-1 truncate text-sm font-medium text-foreground">
                    {a.title}
                  </span>
                  <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {a.likes}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {a.subtitle}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
