"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

interface Props {
  tier: "pro" | "business"
  children: React.ReactNode
  className?: string
}

export function CheckoutButton({ tier, children, className }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Erro ao iniciar checkout")
        setLoading(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      alert("Erro ao processar pagamento. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <button onClick={handleCheckout} disabled={loading} className={className}>
      {loading ? (
        <>
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
          Processando...
        </>
      ) : (
        children
      )}
    </button>
  )
}
