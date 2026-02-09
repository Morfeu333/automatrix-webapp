"use client"

import { useState } from "react"
import { ExternalLink, Loader2 } from "lucide-react"

interface Props {
  status: string
}

export function ConnectOnboardingButton({ status }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleConnect() {
    setLoading(true)

    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Erro ao iniciar configuracao")
        setLoading(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      alert("Erro ao processar. Tente novamente.")
      setLoading(false)
    }
  }

  const buttonText = status === "pending"
    ? "Continuar Configuracao"
    : "Configurar Stripe Connect"

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-automatrix-dark disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </>
      ) : (
        <>
          {buttonText}
          <ExternalLink className="h-4 w-4" />
        </>
      )}
    </button>
  )
}
