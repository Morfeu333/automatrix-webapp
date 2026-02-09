import Link from "next/link"
import { Check, Zap } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "R$0",
    period: "/mes",
    description: "Para explorar e aprender",
    features: [
      "Download de workflow templates",
      "Acesso ao blog e tutoriais",
      "3 conversas com agentes IA/mes",
      "Perfil basico",
    ],
    cta: "Comecar Gratis",
    popular: false,
  },
  {
    name: "Pro",
    price: "R$49",
    period: "/mes",
    description: "Para profissionais e freelancers",
    features: [
      "Tudo do Free",
      "Chat DM ilimitado",
      "Conversas ilimitadas com agentes IA",
      "Criar e publicar projetos",
      "Receber propostas de Vibecoders",
      "Perfil destacado",
      "Suporte prioritario",
    ],
    cta: "Assinar Pro",
    popular: true,
  },
  {
    name: "Business",
    price: "R$149",
    period: "/mes",
    description: "Para empresas e equipes",
    features: [
      "Tudo do Pro",
      "AI onboarding com geracao de PRD",
      "Matching automatico de Vibecoders",
      "Dashboard analytics avancado",
      "Ate 5 membros da equipe",
      "Integracao Google Calendar",
      "Suporte dedicado",
      "SLA de atendimento",
    ],
    cta: "Assinar Business",
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-4 w-4" />
            Precos Simples
          </div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Escolha o plano ideal
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Comece gratis e evolua conforme sua necessidade. Sem surpresas.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border bg-card p-8 ${
                plan.popular
                  ? "border-primary shadow-xl shadow-primary/10"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Mais Popular
                </div>
              )}

              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

              <div className="mt-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`mt-8 block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-automatrix-dark"
                    : "border border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Marketplace Fee Info */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
          <h3 className="text-lg font-semibold text-foreground">Marketplace</h3>
          <p className="mt-2 text-muted-foreground">
            Para transacoes no marketplace (projetos e servicos), a Automatrix cobra uma taxa de <strong className="text-foreground">10%</strong> sobre cada pagamento processado via Stripe Connect.
          </p>
        </div>
      </div>
    </div>
  )
}
