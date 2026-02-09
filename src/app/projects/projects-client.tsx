"use client"

import Link from "next/link"
import { useState } from "react"
import { Search, Clock, DollarSign, Users, Tag, ArrowRight, Plus, FolderKanban } from "lucide-react"

interface ProjectRow {
  id: string
  title: string
  description: string | null
  client_id: string
  status: string
  budget_min: number | null
  budget_max: number | null
  deadline: string | null
  category: string | null
  required_skills: string[] | null
  bid_count: number | null
  created_at: string
  updated_at: string
}

const statusColors: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-yellow-100 text-yellow-700",
  completed: "bg-gray-100 text-gray-700",
}

const statusLabels: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em Progresso",
  review: "Em Revisao",
  completed: "Concluido",
}

export function ProjectsClient({ projects }: { projects: ProjectRow[] }) {
  const [search, setSearch] = useState("")

  const filtered = projects.filter(
    (p) => !search || p.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mission Board</h1>
            <p className="mt-2 text-muted-foreground">
              Projetos abertos buscando Vibecoders especializados.
            </p>
          </div>
          <Link
            href="/projects/new"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-automatrix-dark"
          >
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Link>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar projetos..."
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-4">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground group-hover:text-primary">
                      {project.title}
                    </h2>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[project.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {statusLabels[project.status] ?? project.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </div>

              {project.required_skills && project.required_skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.required_skills.map((skill: string) => (
                    <span key={skill} className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
                {(project.budget_min || project.budget_max) && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    R${(project.budget_min ?? 0).toLocaleString()} - R${(project.budget_max ?? 0).toLocaleString()}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {project.bid_count} propostas
                </span>
                {project.deadline && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Ate {new Date(project.deadline).toLocaleDateString("pt-BR")}
                  </span>
                )}
                {project.category && (
                  <span className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    {project.category}
                  </span>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Ver Detalhes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-lg font-medium text-foreground">Nenhum projeto encontrado</p>
            <p className="mt-2 text-muted-foreground">
              {projects.length === 0
                ? "Ainda nao ha projetos publicados. Seja o primeiro a criar um!"
                : "Tente buscar com outros termos."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
