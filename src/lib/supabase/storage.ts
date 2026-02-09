import { createClient } from "./server"

const AVATAR_BUCKET = "avatars"
const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export async function uploadAvatar(userId: string, file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: "Formato invalido. Use JPG, PNG, WebP ou GIF." }
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return { error: "Imagem muito grande. Maximo 2MB." }
  }

  const ext = file.name.split(".").pop() || "jpg"
  const path = `${userId}/avatar.${ext}`

  const supabase = await createClient()

  // Delete old avatar if exists
  await supabase.storage.from(AVATAR_BUCKET).remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.webp`, `${userId}/avatar.gif`])

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    console.error("Avatar upload error:", uploadError.message)
    return { error: "Erro ao fazer upload da imagem." }
  }

  const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)

  // Add cache-bust to URL
  const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", userId)

  if (updateError) {
    console.error("Profile avatar_url update error:", updateError.message)
    return { error: "Upload feito, mas erro ao salvar no perfil." }
  }

  return { url: avatarUrl, error: null }
}

export function getAvatarUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith("http")) return path
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${AVATAR_BUCKET}/${path}`
}
