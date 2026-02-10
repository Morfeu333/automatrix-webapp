import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.automatrix-ia.com"

export const metadata: Metadata = {
  title: {
    default: "Automatrix - AI Automation Hub & Marketplace",
    template: "%s | Automatrix",
  },
  description:
    "Scale your business with AI automations. Browse 4,000+ free N8N workflow templates, hire expert Vibecoders, or build custom solutions.",
  keywords: [
    "AI automation",
    "N8N workflows",
    "marketplace",
    "automation templates",
    "vibecoder",
    "automatrix",
  ],
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: APP_URL,
    siteName: "Automatrix",
    title: "Automatrix - AI Automation Hub & Marketplace",
    description:
      "Scale your business with AI automations. Browse 4,000+ free N8N workflow templates, hire expert Vibecoders, or build custom solutions.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Automatrix - AI Automation Hub & Marketplace",
    description: "Scale your business with AI automations. 4,000+ free N8N workflow templates.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
