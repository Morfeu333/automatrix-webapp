"use client"

import { Phone } from "lucide-react"

interface ContactRow {
  id: string
  name: string
  type: string[]
  email: string | null
  phone: string | null
  role_title: string | null
  time_zone: string | null
  created_at: string
}

export function ContactsClient({ contacts }: { contacts: ContactRow[] }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Contatos</h1>
        <p className="mt-1 text-sm text-muted-foreground">{contacts.length} contatos</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Cargo</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Fuso</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{c.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c.role_title ?? "-"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c.email ?? "-"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c.phone ?? "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.type.map((t) => (
                      <span key={t} className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-400">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c.time_zone ?? "-"}</td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <Phone className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">Nenhum contato.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
