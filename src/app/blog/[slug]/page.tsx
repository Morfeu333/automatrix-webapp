import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Clock, User, Tag } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ShareButtons } from "@/components/ui/share-buttons"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, category")
    .eq("slug", slug)
    .single()

  if (!post) return { title: "Post Not Found - Automatrix" }

  return {
    title: `${post.title} - Automatrix Blog`,
    description: post.excerpt ?? `${post.title} - ${post.category}`,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post, error: postError } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (postError) {
    if (postError.code === "PGRST116") {
      notFound()
    }
    throw new Error(`Failed to load blog post: ${postError.message}`)
  }
  if (!post) {
    notFound()
  }

  // Fetch related posts (same category, excluding current)
  let relatedPosts: Array<{ slug: string; title: string; excerpt: string | null; cover_image: string | null }> = []
  if (post.category) {
    const { data: related } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, cover_image")
      .eq("status", "published")
      .eq("category", post.category)
      .neq("slug", slug)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(3)

    relatedPosts = related ?? []
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.automatrix-ia.com"
  const postUrl = `${appUrl}/blog/${post.slug}`

  return (
    <div className="pt-20 pb-16">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <Link href="/blog" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Blog
        </Link>

        <article>
          <div className="mb-6">
            {post.category && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {post.category}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            {post.title}
          </h1>

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(post.published_at).toLocaleDateString("pt-BR")}
              </span>
            )}
            {post.read_time && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.read_time} de leitura
              </span>
            )}
          </div>

          {/* Share Buttons */}
          <div className="mt-4">
            <ShareButtons url={postUrl} title={post.title} />
          </div>

          {post.cover_image ? (
            <div className="relative my-8 aspect-video w-full">
              <Image src={post.cover_image} alt={post.title} fill className="rounded-2xl object-cover" />
            </div>
          ) : (
            <div className="my-8 aspect-video rounded-2xl bg-muted flex items-center justify-center">
              <Tag className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}

          {post.content && (
            <div className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary prose-pre:bg-muted prose-pre:text-foreground">
              {post.content.split("\n").map((line: string, i: number) => {
                if (line.startsWith("## ")) return <h2 key={i} className="mt-8 mb-4 text-2xl font-bold text-foreground">{line.slice(3)}</h2>
                if (line.startsWith("### ")) return <h3 key={i} className="mt-6 mb-3 text-xl font-semibold text-foreground">{line.slice(4)}</h3>
                if (line.startsWith("```")) return null
                if (line.startsWith("- ")) return <li key={i} className="ml-4 text-muted-foreground">{line.slice(2)}</li>
                if (line.trim() === "") return <br key={i} />
                return <p key={i} className="mb-4 text-muted-foreground leading-relaxed">{line}</p>
              })}
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
              {post.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Share at bottom too */}
          <div className="mt-6 border-t border-border pt-6">
            <ShareButtons url={postUrl} title={post.title} />
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 border-t border-border pt-8">
            <h2 className="mb-6 text-xl font-bold text-foreground">Posts Relacionados</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group rounded-xl border border-border bg-card transition-all hover:border-primary/30"
                >
                  <div className="relative aspect-video rounded-t-xl bg-muted flex items-center justify-center">
                    {related.cover_image ? (
                      <Image src={related.cover_image} alt={related.title} fill className="rounded-t-xl object-cover" />
                    ) : (
                      <Tag className="h-6 w-6 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-foreground group-hover:text-primary line-clamp-2">
                      {related.title}
                    </h3>
                    {related.excerpt && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{related.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
