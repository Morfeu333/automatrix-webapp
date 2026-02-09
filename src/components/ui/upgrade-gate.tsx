"use client"

import Link from "next/link"
import { Lock } from "lucide-react"

const TIER_RANK: Record<string, number> = { free: 0, pro: 1, business: 2 }

interface UpgradeGateProps {
  requiredTier: "pro" | "business"
  currentTier: string
  featureName: string
  children: React.ReactNode
}

export function UpgradeGate({ requiredTier, currentTier, featureName, children }: UpgradeGateProps) {
  const required = TIER_RANK[requiredTier] ?? 1
  const current = TIER_RANK[currentTier] ?? 0

  if (current >= required) {
    return <>{children}</>
  }

  const tierLabel = requiredTier === "business" ? "Max" : "Pro"

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-foreground">{featureName}</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Este recurso esta disponivel a partir do plano <strong>{tierLabel}</strong>.
          Faca upgrade para desbloquear.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-automatrix-dark"
        >
          Ver Planos
        </Link>
      </div>
    </div>
  )
}
