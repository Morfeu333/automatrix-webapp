"use client"

import { useState } from "react"
import { createProject } from "@/app/(dashboard)/actions"
import { Loader2 } from "lucide-react"

export function ProjectCreateForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [projectType, setProjectType] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const form = new FormData(e.currentTarget)
    const result = await createProject(form)
    // If we get here, redirect didn't happen — there was an error
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
            Titulo do Projeto *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="Ex: Automacao de Email Marketing com N8N"
            className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-foreground">
            Descricao *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            placeholder="Descreva o projeto em detalhes: objetivos, requisitos, integrações necessárias..."
            className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        {/* Project Type + App Level */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="project_type" className="mb-1.5 block text-sm font-medium text-foreground">
              Tipo de Projeto
            </label>
            <select
              id="project_type"
              name="project_type"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Selecione...</option>
              <option value="workflow_install">Instalacao de Workflow</option>
              <option value="custom_app">App Customizado</option>
            </select>
          </div>
          {projectType === "custom_app" && (
            <div>
              <label htmlFor="app_level" className="mb-1.5 block text-sm font-medium text-foreground">
                Nivel de Complexidade
              </label>
              <select
                id="app_level"
                name="app_level"
                className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">Selecione...</option>
                <option value="lv1">Nivel 1 - Simples</option>
                <option value="lv2">Nivel 2 - Intermediario</option>
                <option value="lv3">Nivel 3 - Avancado</option>
              </select>
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-foreground">
            Categoria
          </label>
          <input
            id="category"
            name="category"
            type="text"
            placeholder="Ex: Automacao, E-commerce, CRM"
            className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Skills */}
        <div>
          <label htmlFor="required_skills" className="mb-1.5 block text-sm font-medium text-foreground">
            Skills Necessarias
          </label>
          <input
            id="required_skills"
            name="required_skills"
            type="text"
            placeholder="N8N, Supabase, React, Python (separado por virgula)"
            className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1 text-xs text-muted-foreground">Separe as skills com virgula</p>
        </div>

        {/* Budget */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="budget_min" className="mb-1.5 block text-sm font-medium text-foreground">
              Orcamento Minimo (R$)
            </label>
            <input
              id="budget_min"
              name="budget_min"
              type="number"
              min="0"
              step="0.01"
              placeholder="1000"
              className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="budget_max" className="mb-1.5 block text-sm font-medium text-foreground">
              Orcamento Maximo (R$)
            </label>
            <input
              id="budget_max"
              name="budget_max"
              type="number"
              min="0"
              step="0.01"
              placeholder="5000"
              className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Deadline + Duration */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="deadline" className="mb-1.5 block text-sm font-medium text-foreground">
              Prazo
            </label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="estimated_duration" className="mb-1.5 block text-sm font-medium text-foreground">
              Duracao Estimada
            </label>
            <input
              id="estimated_duration"
              name="estimated_duration"
              type="text"
              placeholder="Ex: 2 semanas"
              className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-automatrix-dark disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Publicando..." : "Publicar Projeto"}
          </button>
        </div>
      </div>
    </form>
  )
}
