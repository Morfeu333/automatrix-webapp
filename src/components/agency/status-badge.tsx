"use client"

import type { AgencyTaskStatus, AgencyClientStatus, ProjectPhaseStatus } from "@/types"

const taskStatusStyles: Record<AgencyTaskStatus, string> = {
  "BLOCKED": "bg-red-500/10 text-red-500",
  "Not Started": "bg-gray-500/10 text-gray-400",
  "In Progress": "bg-yellow-500/10 text-yellow-500",
  "Complete": "bg-green-500/10 text-green-500",
}

const clientStatusStyles: Record<string, string> = {
  "Pre-Onboarding": "bg-gray-500/10 text-gray-400",
  "Onboarding Call": "bg-blue-500/10 text-blue-400",
  "Onboarding Email": "bg-blue-500/10 text-blue-400",
  "Audit Process": "bg-purple-500/10 text-purple-400",
  "Kick Off Call": "bg-indigo-500/10 text-indigo-400",
  "Start Implementation": "bg-yellow-500/10 text-yellow-500",
  "End Implementation": "bg-yellow-500/10 text-yellow-500",
  "Train Team": "bg-orange-500/10 text-orange-400",
  "Optimisation": "bg-green-500/10 text-green-500",
  "Full Launch": "bg-green-500/10 text-green-500",
  "Monthly Optimisation": "bg-emerald-500/10 text-emerald-400",
}

const phaseStatusStyles: Record<ProjectPhaseStatus, string> = {
  "Blocked": "bg-red-500/10 text-red-500",
  "Not Started": "bg-gray-500/10 text-gray-400",
  "In Progress": "bg-yellow-500/10 text-yellow-500",
  "Complete": "bg-green-500/10 text-green-500",
}

export function StatusBadge({
  status,
  variant = "task",
}: {
  status: string
  variant?: "task" | "client" | "phase"
}) {
  let styles = "bg-gray-500/10 text-gray-400"

  if (variant === "task") {
    styles = taskStatusStyles[status as AgencyTaskStatus] ?? styles
  } else if (variant === "client") {
    styles = clientStatusStyles[status] ?? styles
  } else if (variant === "phase") {
    styles = phaseStatusStyles[status as ProjectPhaseStatus] ?? styles
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>
      {status}
    </span>
  )
}
