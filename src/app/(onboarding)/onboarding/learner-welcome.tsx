"use client"

import { Zap, FolderKanban, BookOpen, ArrowRight } from "lucide-react"
import { completeLearnerOnboarding } from "./actions"
import { useState } from "react"

export function LearnerWelcome({ displayName }: { displayName: string }) {
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    setLoading(true)
    await completeLearnerOnboarding()
  }

  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Bem-vindo a Automatrix, {displayName}!
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Explore nossa plataforma de automacoes e workflows com IA.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Zap,
            title: "Explorar Workflows",
            desc: "Descubra templates de automacao prontos para usar",
            href: "/workflows",
          },
          {
            icon: FolderKanban,
            title: "Mission Board",
            desc: "Veja projetos abertos e oportunidades",
            href: "/projects",
          },
          {
            icon: BookOpen,
            title: "Blog & Tutoriais",
            desc: "Aprenda sobre automacao e IA",
            href: "/blog",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/30"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleStart}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-automatrix-dark disabled:opacity-50"
      >
        {loading ? "Carregando..." : "Comecar"}
        {!loading && <ArrowRight className="h-5 w-5" />}
      </button>
    </div>
  )
}
