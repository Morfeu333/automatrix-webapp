import { Suspense } from "react"
import { RegisterForm } from "./register-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Criar Conta - Automatrix",
  description: "Junte-se a Automatrix gratuitamente. Acesse workflows, projetos e agentes IA.",
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-16 pb-8">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
