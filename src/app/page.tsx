import Link from "next/link"
import {
  Zap,
  Download,
  Users,
  Bot,
  ArrowRight,
  Shield,
  Cpu,
  Globe,
  Star,
} from "lucide-react"

const features = [
  {
    icon: Download,
    title: "4,000+ Workflow Templates",
    description:
      "Acesse nossa biblioteca gratuita de automacoes N8N. Download, importe e comece a automatizar em minutos.",
  },
  {
    icon: Users,
    title: "Marketplace de Vibecoders",
    description:
      "Contrate especialistas em automacao e IA para implementar suas solucoes. Pagamento seguro via Stripe.",
  },
  {
    icon: Bot,
    title: "Agentes IA Especializados",
    description:
      "Converse com nossos agentes IA especializados em N8N, Supabase, Claude e mais. Tire duvidas em tempo real.",
  },
  {
    icon: Shield,
    title: "Onboarding Inteligente",
    description:
      "Nosso AI gera escopo de projeto, PRD e arquitetura automaticamente a partir de suas necessidades.",
  },
  {
    icon: Cpu,
    title: "Automacao End-to-End",
    description:
      "Do escopo a entrega, automatizamos o processo. Matching de projetos, pagamentos e comunicacao integrados.",
  },
  {
    icon: Globe,
    title: "Comunidade Ativa",
    description:
      "Blog com tutoriais, templates gratuitos e uma comunidade de vibecoders prontos para ajudar.",
  },
]

const stats = [
  { value: "4,343+", label: "Workflow Templates" },
  { value: "10+", label: "Agentes IA" },
  { value: "50+", label: "Integracoes" },
  { value: "Free", label: "Para Comecar" },
]

const testimonials = [
  {
    name: "Carlos M.",
    role: "CEO, TechStartup",
    content:
      "Automatrix transformou como gerenciamos nossos processos. As automacoes economizam horas por semana.",
    rating: 5,
  },
  {
    name: "Marina S.",
    role: "Marketing Director",
    content:
      "Os templates de workflow sao incriveis. Implementamos 5 automacoes em uma tarde.",
    rating: 5,
  },
  {
    name: "Pedro L.",
    role: "Freelance Developer",
    content:
      "Como vibecoder, encontro projetos qualificados e pagamento seguro. Excelente plataforma.",
    rating: 5,
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-automatrix-50 via-background to-background" />
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              AI Automation Hub & Marketplace
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Scale Your Business with{" "}
              <span className="automatrix-text-gradient">AI Automations</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Acesse 4,000+ templates gratuitos de automacao, contrate
              Vibecoders especializados, ou use nossos agentes IA para criar
              solucoes sob medida.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/workflows"
                className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-automatrix-dark hover:shadow-xl"
              >
                Explorar Templates
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-xl border border-border bg-background px-8 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Criar Conta Gratis
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:mt-20">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card p-6 text-center">
                <div className="text-3xl font-bold automatrix-text-gradient">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Tudo que voce precisa para automatizar
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Uma plataforma completa para encontrar, criar e implementar automacoes com IA.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Como Funciona</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { step: "1", title: "Explore & Baixe", description: "Navegue por 4,000+ templates de automacao N8N. Filtre por categoria, complexidade e integracoes." },
              { step: "2", title: "Contrate ou Faca Voce Mesmo", description: "Implemente sozinho com tutoriais ou contrate um Vibecoder especialista pelo marketplace." },
              { step: "3", title: "Escale com IA", description: "Use nossos agentes IA para otimizar, criar projetos custom e escalar suas automacoes." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl automatrix-gradient text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">O que dizem nossos usuarios</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                <div className="mt-4 border-t border-border pt-4">
                  <div className="font-medium text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="rounded-3xl automatrix-gradient p-10 text-center lg:p-16">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Pronto para automatizar?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              Crie sua conta gratuita e comece a explorar templates, contratar especialistas e usar agentes IA.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register" className="flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-automatrix-900 transition-colors hover:bg-white/90">
                Comecar Gratis <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/workflows" className="flex items-center gap-2 rounded-xl border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10">
                Ver Templates
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
