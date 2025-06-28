import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import PWAInstaller from "@/components/pwa-installer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "cookieGPT - AI Cookie Cutter Generator",
  description: "画像からオリジナルクッキー型を作成するAIアプリ。GPT-4oで画像を分析し、SVGとSTLファイルを生成します。",
  keywords: ["クッキー型", "AI", "3Dプリント", "SVG", "STL", "cookieGPT"],
  authors: [{ name: "cookieGPT Team" }],
  creator: "cookieGPT",
  publisher: "cookieGPT",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://cookiegpt.vercel.app"),
  openGraph: {
    title: "cookieGPT - AI Cookie Cutter Generator",
    description: "画像からオリジナルクッキー型を作成するAIアプリ",
    url: "https://cookiegpt.vercel.app",
    siteName: "cookieGPT",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "cookieGPT - AI Cookie Cutter Generator",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "cookieGPT - AI Cookie Cutter Generator",
    description: "画像からオリジナルクッキー型を作成するAIアプリ",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "cookieGPT",
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F59E0B" },
    { media: "(prefers-color-scheme: dark)", color: "#F59E0B" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="cookieGPT" />
        <meta name="application-name" content="cookieGPT" />
        <meta name="msapplication-TileColor" content="#F59E0B" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
          <PWAInstaller />
        </ThemeProvider>
      </body>
    </html>
  )
}
