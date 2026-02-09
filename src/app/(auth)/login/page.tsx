import { LoginForm } from "./login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - Automatrix",
  description: "Entre na sua conta Automatrix para acessar workflows, projetos e agentes IA.",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-16">
      <LoginForm />
    </div>
  )
}
