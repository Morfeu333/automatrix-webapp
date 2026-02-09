import type { Metadata } from "next"
import { ProjectCreateForm } from "./project-create-form"

export const metadata: Metadata = {
  title: "Novo Projeto - Automatrix",
  description: "Crie um novo projeto e encontre Vibecoders especializados para executar.",
}

export default function NewProjectPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Criar Novo Projeto</h1>
        <p className="mt-1 text-muted-foreground">
          Descreva seu projeto para atrair os melhores Vibecoders.
        </p>
      </div>
      <ProjectCreateForm />
    </div>
  )
}
