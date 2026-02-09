import { Zap, BookOpen, FolderKanban, Bot } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { HeaderClient } from "./header-client"
import type { UserRole } from "@/types"

const navigation = [
  { name: "Workflows", href: "/workflows", icon: Zap },
  { name: "Blog", href: "/blog", icon: BookOpen },
  { name: "Projetos", href: "/projects", icon: FolderKanban },
  { name: "Agentes IA", href: "/agents", icon: Bot },
]

export async function Header() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    console.error("Header auth error:", userError.message)
  }

  let profile = null
  let notificationCount = 0
  if (user) {
    const [profileRes, notifRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, avatar_url, role, subscription_tier")
        .eq("id", user.id)
        .single(),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false),
    ])
    if (profileRes.error) {
      console.error("Header profile fetch error:", profileRes.error.message)
    }
    profile = profileRes.data
    notificationCount = notifRes.count ?? 0
  }

  const userData = user && profile ? {
    id: user.id,
    email: user.email ?? "",
    full_name: profile.full_name ?? user.user_metadata?.full_name ?? "",
    avatar_url: profile.avatar_url ?? user.user_metadata?.avatar_url ?? "",
    role: (profile.role as UserRole) ?? "learner",
    subscription_tier: profile.subscription_tier ?? "free",
  } : null

  return (
    <HeaderClient
      navigation={navigation.map(n => ({ name: n.name, href: n.href }))}
      user={userData}
      notificationCount={notificationCount}
    />
  )
}
