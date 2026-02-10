import { createClient } from "@/lib/supabase/server"
import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.automatrix-ia.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/workflows`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/vibecoders`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ]

  // Blog posts
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(200)

  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  // Workflow pages
  const { data: workflows } = await supabase
    .from("workflows")
    .select("id, updated_at")
    .order("updated_at", { ascending: false })
    .limit(500)

  const workflowPages: MetadataRoute.Sitemap = (workflows ?? []).map((wf) => ({
    url: `${BASE_URL}/workflows/${wf.id}`,
    lastModified: new Date(wf.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }))

  return [...staticPages, ...blogPages, ...workflowPages]
}
