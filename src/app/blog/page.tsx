import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, Tag, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog - Automatrix",
  description: "Tutoriais, dicas e novidades sobre automacao com IA e N8N.",
}

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams
  const activeCategory = typeof params.category === "string" ? params.category : "Todos"
  const searchQuery = typeof params.q === "string" ? params.q.trim() : ""
  const activeTag = typeof params.tag === "string" ? params.tag : ""

  const supabase = await createClient()

  // Fetch all categories and tags (lightweight queries)
  const { data: catRows } = await supabase
    .from("blog_posts")
    .select("category, tags")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())

  const categories = ["Todos", ...new Set((catRows ?? []).map(p => p.category).filter((c): c is string => Boolean(c)))]
  const allTags = [...new Set((catRows ?? []).flatMap(p => p.tags ?? []).filter(Boolean))]

  // Fetch posts with filters
  let postsQuery = supabase
    .from("blog_posts")
    .select("slug, title, excerpt, category, author, read_time, cover_image, published_at, tags")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())

  if (activeCategory !== "Todos") {
    postsQuery = postsQuery.eq("category", activeCategory)
  }

  if (searchQuery) {
    postsQuery = postsQuery.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
  }

  if (activeTag) {
    postsQuery = postsQuery.contains("tags", [activeTag])
  }

  const { data: posts, error: postsError } = await postsQuery.order("published_at", { ascending: false })

  if (postsError) console.error("Blog posts fetch error:", postsError.message)

  const blogPosts = posts ?? []

  // Build current filter URL helper
  function filterUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams()
    const merged = { category: activeCategory === "Todos" ? undefined : activeCategory, q: searchQuery || undefined, tag: activeTag || undefined, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v)
    }
    const qs = p.toString()
    return `/blog${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Blog</h1>
          <p className="mt-2 text-muted-foreground">
            Tutoriais, dicas e novidades sobre automacao com IA e N8N.
          </p>
        </div>

        {/* Search */}
        <form action="/blog" method="GET" className="mb-6">
          {activeCategory !== "Todos" && <input type="hidden" name="category" value={activeCategory} />}
          {activeTag && <input type="hidden" name="tag" value={activeTag} />}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              type="text"
              defaultValue={searchQuery}
              placeholder="Buscar posts..."
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </form>

        {/* Categories */}
        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={filterUrl({ category: cat === "Todos" ? undefined : cat })}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                cat === activeCategory
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-1.5">
            {activeTag && (
              <Link
                href={filterUrl({ tag: undefined })}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                #{activeTag} ✕
              </Link>
            )}
            {allTags.filter(t => t !== activeTag).map((tag) => (
              <Link
                key={tag}
                href={filterUrl({ tag })}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <div className="relative aspect-video rounded-t-2xl bg-muted flex items-center justify-center">
                {post.cover_image ? (
                  <Image src={post.cover_image} alt={post.title} fill className="rounded-t-2xl object-cover" />
                ) : (
                  <Tag className="h-8 w-8 text-muted-foreground/50" />
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {post.category}
                  </span>
                  {post.read_time && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {post.read_time}
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-lg font-semibold text-foreground group-hover:text-primary line-clamp-2">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{post.author}</span>
                  {post.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.published_at).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {blogPosts.length === 0 && (
          <div className="py-16 text-center">
            <Tag className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">
              {searchQuery
                ? `Nenhum resultado para "${searchQuery}".`
                : activeTag
                ? `Nenhum post com a tag "${activeTag}".`
                : activeCategory !== "Todos"
                ? `Nenhum post encontrado na categoria "${activeCategory}".`
                : "Nenhum post publicado ainda."}
            </p>
            {(activeCategory !== "Todos" || searchQuery || activeTag) && (
              <Link href="/blog" className="mt-2 inline-block text-sm text-primary hover:underline">
                Ver todos os posts
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
