import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "cookieGPT - AI Cookie Cutter Generator",
    short_name: "cookieGPT",
    description: "画像からオリジナルクッキー型を作成するAIアプリ",
    start_url: "/",
    display: "standalone",
    background_color: "#FEF3C7",
    theme_color: "#F59E0B",
    orientation: "portrait",
    categories: ["food", "productivity", "utilities"],
    lang: "ja",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
      },
      {
        src: "/screenshot-desktop.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
      },
    ],
  }
}
