"use client"

import { UserCog } from "lucide-react"

interface EmployeeRow {
  id: string
  profile_id: string
  job_title: string | null
  department: string | null
  location: string | null
  start_date: string | null
  phone_number: string | null
  full_name: string | null
  email: string | null
  avatar_url: string | null
}

export function EmployeesClient({ employees }: { employees: EmployeeRow[] }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Equipe</h1>
        <p className="mt-1 text-sm text-muted-foreground">{employees.length} membros</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {employees.map((e) => (
          <div key={e.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {(e.full_name ?? "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{e.full_name ?? "Sem nome"}</p>
                <p className="text-xs text-muted-foreground">{e.job_title ?? "Sem cargo"}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
              {e.department && <span>Dept: {e.department}</span>}
              {e.email && <span>{e.email}</span>}
              {e.location && <span>{e.location}</span>}
              {e.phone_number && <span>{e.phone_number}</span>}
            </div>
          </div>
        ))}
        {employees.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <UserCog className="mx-auto h-8 w-8 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">Nenhum membro na equipe.</p>
          </div>
        )}
      </div>
    </div>
  )
}
