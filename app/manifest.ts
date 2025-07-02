import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "cookieGPT - AI Cookie Cutter Generator",
    short_name: "cookieGPT",
    description: "オリジナルクッキー型を作成するAIアプリ",
    start_url: "/",
    display: "standalone",
    background_color: "#FEF3C7",
    theme_color: "#F59E0B",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    categories: ["productivity", "utilities", "design"],
    lang: "ja",
    dir: "ltr",
    scope: "/",
    screenshots: [
      {
        src: "/screenshot-mobile.png",
        sizes: "390x844",
        type: "image/png",
      },
      {
        src: "/screenshot-desktop.png",
        sizes: "1280x720",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "新しいクッキー型を作成",
        short_name: "新規作成",
        description: "新しいクッキー型を作成",
        url: "/",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
          },
        ],
      },
    ],
  }
}
