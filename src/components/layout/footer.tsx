import Link from "next/link"
import { Zap } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg automatrix-gradient">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold automatrix-text-gradient">
                Automatrix
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              AI Automation Hub & Marketplace. Scale your business with
              intelligent automation.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Plataforma</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/workflows" className="text-sm text-muted-foreground hover:text-foreground">Workflow Templates</Link></li>
              <li><Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">Mission Board</Link></li>
              <li><Link href="/agents" className="text-sm text-muted-foreground hover:text-foreground">Agentes IA</Link></li>
              <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Empresa</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Precos</Link></li>
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">Sobre</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Termos de Uso</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacidade</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Automatrix. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
