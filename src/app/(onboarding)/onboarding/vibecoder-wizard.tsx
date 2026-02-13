"use client"

import { useState, useRef } from "react"
import { User, Code2, Briefcase, Video, CheckCircle, ArrowRight, ArrowLeft, Loader2, Upload, Star } from "lucide-react"
import { completeVibecoderOnboarding, uploadResumeAction } from "./actions"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const STEPS = [
  { id: 1, label: "Dados Pessoais", icon: User },
  { id: 2, label: "Skills", icon: Code2 },
  { id: 3, label: "Portfolio", icon: Briefcase },
  { id: 4, label: "Video", icon: Video },
  { id: 5, label: "Disponibilidade", icon: CheckCircle },
]

const SKILL_CATEGORIES: Record<string, string[]> = {
  "APIs & Plataformas": ["N8N", "OpenAI", "Anthropic", "Meta API", "Google API", "Supabase", "Stripe", "Twilio", "SendGrid"],
  "DevOps & Ferramentas": ["Docker", "Git", "Linux", "CI/CD", "Terraform", "Claude Code", "Cursor", "Gemini CLI"],
  "Frameworks & Linguagens": ["Next.js", "React", "TailwindCSS", "Python", "Node.js", "TypeScript", "LangChain", "CrewAI"],
}

const TIMEZONES = [
  "America/Sao_Paulo",
  "America/Manaus",
  "America/Bahia",
  "America/Recife",
  "America/Fortaleza",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Lisbon",
]

interface Props {
  displayName: string
  userId: string
  existingProfile: {
    full_name: string | null
    email: string
  }
  existingVibecoder: {
    github_url: string | null
    portfolio_urls: string[] | null
    tools: string[] | null
    frameworks: string[] | null
    hourly_rate: number | null
    hours_per_week: number | null
    timezone: string | null
    skills: Record<string, number> | null
    resume_url: string | null
    video_url: string | null
  } | null
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? 0 : star)}
          className="text-lg transition-colors"
        >
          <span className={star <= value ? "text-yellow-400" : "text-muted-foreground/30"}>★</span>
        </button>
      ))}
    </div>
  )
}

export function VibecoderWizard({ displayName, userId, existingProfile, existingVibecoder }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Step 1 — Personal info
  const [fullName, setFullName] = useState(existingProfile.full_name ?? "")
  const [bio, setBio] = useState("")
  const [company, setCompany] = useState("")
  const [website, setWebsite] = useState("")

  // Step 2 — Skills
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>(
    (existingVibecoder?.skills as Record<string, number>) ?? {}
  )

  // Step 3 — Portfolio
  const [githubUrl, setGithubUrl] = useState(existingVibecoder?.github_url ?? "")
  const [portfolioUrls, setPortfolioUrls] = useState(existingVibecoder?.portfolio_urls?.join(", ") ?? "")
  const [resumeUrl, setResumeUrl] = useState(existingVibecoder?.resume_url ?? "")
  const [resumeUploading, setResumeUploading] = useState(false)
  const resumeInputRef = useRef<HTMLInputElement>(null)

  // Step 4 — Video
  const [videoUrl, setVideoUrl] = useState(existingVibecoder?.video_url ?? "")
  const [videoUploading, setVideoUploading] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Step 5 — Availability
  const [tools, setTools] = useState(existingVibecoder?.tools?.join(", ") ?? "")
  const [frameworks, setFrameworks] = useState(existingVibecoder?.frameworks?.join(", ") ?? "")
  const [hourlyRate, setHourlyRate] = useState(existingVibecoder?.hourly_rate?.toString() ?? "")
  const [hoursPerWeek, setHoursPerWeek] = useState(existingVibecoder?.hours_per_week?.toString() ?? "")
  const [timezone, setTimezone] = useState(existingVibecoder?.timezone ?? "America/Sao_Paulo")

  function canAdvance(): boolean {
    if (step === 1) return fullName.trim().length >= 2
    if (step === 2) return Object.values(skillRatings).filter((v) => v > 0).length >= 3
    return true
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setResumeUploading(true)
    setError("")

    const formData = new FormData()
    formData.append("file", file)
    const result = await uploadResumeAction(formData)
    setResumeUploading(false)

    if (result.error) {
      setError(result.error)
    } else if (result.url) {
      setResumeUrl(result.url)
    }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 100 * 1024 * 1024) {
      setError("Video muito grande (max 100MB)")
      return
    }
    setVideoUploading(true)
    setError("")

    const supabase = createClient()
    const ext = file.name.split(".").pop() || "mp4"
    const filePath = `${userId}/presentation.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setVideoUploading(false)
      return
    }

    const { data: publicUrl } = supabase.storage.from("videos").getPublicUrl(filePath)
    setVideoUrl(publicUrl.publicUrl)
    setVideoUploading(false)
  }

  async function handleSubmit() {
    setLoading(true)
    setError("")

    const filteredSkills = Object.fromEntries(
      Object.entries(skillRatings).filter(([, v]) => v > 0)
    )

    const formData = new FormData()
    formData.set("full_name", fullName)
    formData.set("bio", bio)
    formData.set("company", company)
    formData.set("website", website)
    formData.set("github_url", githubUrl)
    formData.set("portfolio_urls", portfolioUrls)
    formData.set("video_url", videoUrl)
    formData.set("resume_url", resumeUrl)
    formData.set("skills_json", JSON.stringify(filteredSkills))
    formData.set("tools", tools)
    formData.set("frameworks", frameworks)
    formData.set("hourly_rate", hourlyRate)
    formData.set("hours_per_week", hoursPerWeek)
    formData.set("timezone", timezone)

    const result = await completeVibecoderOnboarding(formData)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">Seja bem-vindo, {displayName}!</h1>
        <p className="mt-1 text-muted-foreground">Complete seu perfil de Desenvolvedor para comecar a receber missoes.</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <button
              onClick={() => s.id < step && setStep(s.id)}
              disabled={s.id > step}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all ${
                s.id === step
                  ? "bg-primary text-primary-foreground"
                  : s.id < step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {s.id < step ? <CheckCircle className="h-4 w-4" /> : s.id}
            </button>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 ${s.id < step ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Step Content */}
      <div className="rounded-xl border border-border bg-card p-6">
        {/* Step 1 — Personal Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Dados Pessoais</h2>
            <p className="text-sm text-muted-foreground">Informacoes basicas do seu perfil.</p>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Nome Completo *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Conte um pouco sobre sua experiencia com automacao e IA..."
                className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary resize-none"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Empresa</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Skills Matrix */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Skills Matrix</h2>
            <p className="text-sm text-muted-foreground">
              Avalie suas habilidades de 1 a 5 estrelas. Selecione pelo menos 3 skills.
            </p>

            <div className="space-y-5">
              {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
                <div key={category}>
                  <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">{category}</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {skills.map((skill) => (
                      <div key={skill} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                        <span className="text-sm text-foreground">{skill}</span>
                        <StarRating
                          value={skillRatings[skill] ?? 0}
                          onChange={(v) => setSkillRatings((prev) => ({ ...prev, [skill]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              {Object.values(skillRatings).filter((v) => v > 0).length} skills selecionadas (minimo 3)
            </p>
          </div>
        )}

        {/* Step 3 — Portfolio */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Portfolio & GitHub</h2>
            <p className="text-sm text-muted-foreground">Links para seus projetos e trabalhos anteriores.</p>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">GitHub URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Portfolio URLs</label>
              <input
                type="text"
                value={portfolioUrls}
                onChange={(e) => setPortfolioUrls(e.target.value)}
                placeholder="https://portfolio1.com, https://portfolio2.com"
                className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">Separe URLs com virgula</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Curriculo (PDF)</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={resumeUploading}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {resumeUploading ? "Enviando..." : "Upload PDF"}
                </button>
                {resumeUrl && <span className="text-xs text-green-600">Curriculo enviado</span>}
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Max 10MB</p>
            </div>
          </div>
        )}

        {/* Step 4 — Video */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Video de Apresentacao</h2>
            <p className="text-sm text-muted-foreground">
              Grave um video curto (1-3 min) se apresentando, falando sobre sua experiencia e o que voce pode oferecer.
            </p>

            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              {videoUrl ? (
                <div className="space-y-2">
                  <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
                  <p className="text-sm text-green-600">Video enviado com sucesso!</p>
                  <button
                    type="button"
                    onClick={() => setVideoUrl("")}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Remover e enviar outro
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Video className="mx-auto h-10 w-10 text-muted-foreground/40" />
                  <div>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={videoUploading}
                      className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
                    >
                      {videoUploading ? "Enviando..." : "Upload Video"}
                    </button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">MP4, WebM ou MOV. Max 100MB.</p>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Ou insira um link (YouTube/Loom)</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... ou https://loom.com/..."
                className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <p className="text-xs text-muted-foreground italic">
              Este passo e opcional, mas recomendado para aumentar suas chances de aprovacao.
            </p>
          </div>
        )}

        {/* Step 5 — Availability & Review */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Disponibilidade & Revisao</h2>
            <p className="text-sm text-muted-foreground">Defina sua disponibilidade e revise seus dados.</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Ferramentas que domina</label>
                <input
                  type="text"
                  value={tools}
                  onChange={(e) => setTools(e.target.value)}
                  placeholder="N8N, Supabase, Docker"
                  className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Frameworks</label>
                <input
                  type="text"
                  value={frameworks}
                  onChange={(e) => setFrameworks(e.target.value)}
                  placeholder="React, Next.js, FastAPI"
                  className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Valor/Hora ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Horas/Semana</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz.replace("America/", "").replace("Europe/", "").replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Resumo</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nome:</span>
                  <span className="font-medium text-foreground">{fullName || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Skills:</span>
                  <span className="font-medium text-foreground">{Object.values(skillRatings).filter((v) => v > 0).length} avaliadas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GitHub:</span>
                  <span className="font-medium text-foreground truncate max-w-[200px]">{githubUrl || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Video:</span>
                  <span className="font-medium text-foreground">{videoUrl ? "Enviado" : "Nenhum"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Curriculo:</span>
                  <span className="font-medium text-foreground">{resumeUrl ? "Enviado" : "Nenhum"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-sm text-yellow-600">
              Apos enviar, seu perfil sera revisado pela equipe Automatrix antes de poder receber missoes.
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-30"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>

        {step < 5 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(5, s + 1))}
            disabled={!canAdvance()}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-automatrix-dark disabled:opacity-50"
          >
            Proximo <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-automatrix-dark disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Enviando..." : "Enviar Perfil"}
          </button>
        )}
      </div>
    </div>
  )
}
