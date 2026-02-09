import Link from "next/link"
import { Zap } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 pt-20">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl automatrix-gradient opacity-50">
          <Zap className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Pagina nao encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A pagina que voce procura nao existe ou foi movida.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-automatrix-dark"
          >
            Pagina inicial
          </Link>
          <Link
            href="/workflows"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Explorar Workflows
          </Link>
        </div>
      </div>
    </div>
  )
}
