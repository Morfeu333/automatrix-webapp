"use client"

import { useState } from "react"
import { updateProfile, updateVibecoderProfile } from "@/app/(dashboard)/actions"
import { Loader2, Check } from "lucide-react"
import { ConnectOnboardingButton } from "./connect-button"

interface Props {
  profile: {
    full_name: string | null
    bio: string | null
    company: string | null
    website: string | null
    industry: string | null
    skills: string[] | null
    role: string
    subscription_tier: string
  } | null
  vibecoderProfile: {
    github_url: string | null
    portfolio_urls: string[] | null
    tools: string[] | null
    frameworks: string[] | null
    hourly_rate: number | null
    hours_per_week: number | null
    timezone: string | null
    approval_status: string
    connect_status: string
  } | null
  email: string
}

const tierLabels: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  business: "Max",
}

export function SettingsClient({ profile, vibecoderProfile, email }: Props) {
  const [activeTab, setActiveTab] = useState("perfil")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [vcLoading, setVcLoading] = useState(false)
  const [vcSuccess, setVcSuccess] = useState(false)
  const [vcError, setVcError] = useState("")

  const tabs = [
    { id: "perfil", label: "Perfil" },
    ...(profile?.role === "vibecoder" ? [{ id: "vibecoder", label: "Vibecoder" }] : []),
    { id: "conta", label: "Conta" },
  ]

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError("")
    setProfileSuccess(false)
    const result = await updateProfile(new FormData(e.currentTarget))
    setProfileLoading(false)
    if (result?.error) {
      setProfileError(result.error)
    } else {
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    }
  }

  async function handleVcSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setVcLoading(true)
    setVcError("")
    setVcSuccess(false)
    const result = await updateVibecoderProfile(new FormData(e.currentTarget))
    setVcLoading(false)
    if (result?.error) {
      setVcError(result.error)
    } else {
      setVcSuccess(true)
      setTimeout(() => setVcSuccess(false), 3000)
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Configuracoes</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "perfil" && (
        <form onSubmit={handleProfileSubmit} className="max-w-2xl">
          {profileError && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-600">{profileError}</div>
          )}
          {profileSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-sm text-green-600">
              <Check className="h-4 w-4" /> Perfil atualizado com sucesso!
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div>
              <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium text-foreground">Nome Completo</label>
              <input id="full_name" name="full_name" type="text" defaultValue={profile?.full_name ?? ""} className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-foreground">Bio</label>
              <textarea id="bio" name="bio" rows={3} defaultValue={profile?.bio ?? ""} placeholder="Conte um pouco sobre voce..." className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-foreground">Empresa</label>
                <input id="company" name="company" type="text" defaultValue={profile?.company ?? ""} className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label htmlFor="industry" className="mb-1.5 block text-sm font-medium text-foreground">Industria</label>
                <input id="industry" name="industry" type="text" defaultValue={profile?.industry ?? ""} className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label htmlFor="website" className="mb-1.5 block text-sm font-medium text-foreground">Website</label>
              <input id="website" name="website" type="url" defaultValue={profile?.website ?? ""} placeholder="https://..." className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label htmlFor="skills" className="mb-1.5 block text-sm font-medium text-foreground">Skills</label>
              <input id="skills" name="skills" type="text" defaultValue={profile?.skills?.join(", ") ?? ""} placeholder="React, N8N, Python (separado por virgula)" className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              <p className="mt-1 text-xs text-muted-foreground">Separe as skills com virgula</p>
            </div>
            <button
              type="submit"
              disabled={profileLoading}
              className="flex w-fit items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-automatrix-dark disabled:opacity-50"
            >
              {profileLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {profileLoading ? "Salvando..." : "Salvar Perfil"}
            </button>
          </div>
        </form>
      )}

      {/* Vibecoder Tab */}
      {activeTab === "vibecoder" && vibecoderProfile && (
        <div className="max-w-2xl space-y-6">
        <form onSubmit={handleVcSubmit}>
          {vcError && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-600">{vcError}</div>
          )}
          {vcSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-sm text-green-600">
              <Check className="h-4 w-4" /> Perfil Vibecoder atualizado!
            </div>
          )}

          <div className="mb-4 flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              vibecoderProfile.approval_status === "approved" ? "bg-green-100 text-green-700" :
              vibecoderProfile.approval_status === "pending" ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            }`}>
              {vibecoderProfile.approval_status === "approved" ? "Aprovado" :
               vibecoderProfile.approval_status === "pending" ? "Pendente" : "Rejeitado"}
            </span>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <label htmlFor="github_url" className="mb-1.5 block text-sm font-medium text-foreground">GitHub URL</label>
              <input id="github_url" name="github_url" type="url" defaultValue={vibecoderProfile.github_url ?? ""} placeholder="https://github.com/username" className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label htmlFor="portfolio_urls" className="mb-1.5 block text-sm font-medium text-foreground">Portfolio URLs</label>
              <input id="portfolio_urls" name="portfolio_urls" type="text" defaultValue={vibecoderProfile.portfolio_urls?.join(", ") ?? ""} placeholder="https://portfolio1.com, https://portfolio2.com" className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              <p className="mt-1 text-xs text-muted-foreground">Separe as URLs com virgula</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="tools" className="mb-1.5 block text-sm font-medium text-foreground">Ferramentas</label>
                <input id="tools" name="tools" type="text" defaultValue={vibecoderProfile.tools?.join(", ") ?? ""} placeholder="N8N, Supabase, Docker" className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label htmlFor="frameworks" className="mb-1.5 block text-sm font-medium text-foreground">Frameworks</label>
                <input id="frameworks" name="frameworks" type="text" defaultValue={vibecoderProfile.frameworks?.join(", ") ?? ""} placeholder="React, Next.js, FastAPI" className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="hourly_rate" className="mb-1.5 block text-sm font-medium text-foreground">Valor/Hora (R$)</label>
                <input id="hourly_rate" name="hourly_rate" type="number" min="0" step="0.01" defaultValue={vibecoderProfile.hourly_rate ?? ""} className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label htmlFor="hours_per_week" className="mb-1.5 block text-sm font-medium text-foreground">Horas/Semana</label>
                <input id="hours_per_week" name="hours_per_week" type="number" min="1" max="168" defaultValue={vibecoderProfile.hours_per_week ?? ""} className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label htmlFor="timezone" className="mb-1.5 block text-sm font-medium text-foreground">Timezone</label>
                <input id="timezone" name="timezone" type="text" defaultValue={vibecoderProfile.timezone ?? ""} placeholder="America/Sao_Paulo" className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <button
              type="submit"
              disabled={vcLoading}
              className="flex w-fit items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-automatrix-dark disabled:opacity-50"
            >
              {vcLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {vcLoading ? "Salvando..." : "Salvar Vibecoder"}
            </button>
          </div>
        </form>

        {/* Stripe Connect Section */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Pagamentos</h3>
          {vibecoderProfile.connect_status === "active" ? (
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm text-foreground">
                Conta Stripe Connect ativa. Voce pode receber pagamentos.
              </span>
            </div>
          ) : vibecoderProfile.approval_status === "approved" ? (
            <>
              <p className="mb-3 text-sm text-muted-foreground">
                Configure sua conta Stripe Connect para receber pagamentos de projetos.
              </p>
              <ConnectOnboardingButton status={vibecoderProfile.connect_status} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Seu perfil de Vibecoder precisa ser aprovado antes de configurar pagamentos.
            </p>
          )}
        </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === "conta" && (
        <div className="max-w-2xl">
          <div className="flex flex-col gap-5">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Email</h3>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Plano</h3>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {tierLabels[profile?.subscription_tier ?? "free"] ?? "Free"}
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Senha</h3>
              <p className="text-sm text-muted-foreground">Em breve: alterar senha via email.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
