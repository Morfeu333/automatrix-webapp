"use client"

import { useState } from "react"
import { ExternalLink, Loader2 } from "lucide-react"

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  async function handleManage() {
    setLoading(true)

    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Erro ao acessar portal")
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

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </>
      ) : (
        <>
          Gerenciar Assinatura
          <ExternalLink className="h-4 w-4" />
        </>
      )}
    </button>
  )
}
