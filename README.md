# Cookie design chat

_Automatically synced with your [v0.dev](https://v0.dev) deployments_

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/ufoo68s-projects/v0-cookie-design-chat)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/e7Yp72tDy1h)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/ufoo68s-projects/v0-cookie-design-chat](https://vercel.com/ufoo68s-projects/v0-cookie-design-chat)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/e7Yp72tDy1h](https://v0.dev/chat/projects/e7Yp72tDy1h)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Application Architecture

```mermaid
graph TD
    subgraph "User Interaction"
        User -- "Accesses App" --> Browser
    end

    subgraph "Next.js Application"
        Browser -- "HTTP Request" --> A["app/page.tsx (Main UI)"]

        subgraph "Frontend Components"
            A --> B["cookie-chat.tsx"]
            A --> C["cookie-3d-chat.tsx"]
            C --> D["components/cookie-3d-viewer.tsx"]
            A --> E["components/ui/* (Shadcn UI)"]
            A --> F["components/pwa-installer.tsx"]
            A --> G["components/stl-download.tsx"]
        end

        subgraph "Backend (API Routes)"
            B -- "POST /api/generate-cookie" --> H["app/api/generate-cookie/route.ts"]
            G -- "GET /api/download/[filename]" --> I["app/api/download/[filename]/route.ts"]
        end

        subgraph "Styling & Configuration"
            J["app/globals.css & tailwind.config.ts"] --> A
            K["next.config.mjs"] -- "Configures" --> App
            L["tsconfig.json"] -- "Configures" --> App
        end

        subgraph "Public Assets"
            Browser -- "Loads Icons, etc." --> M["public/*"]
        end

        style H fill:#f9f,stroke:#333,stroke-width:2px
        style I fill:#f9f,stroke:#333,stroke-width:2px
    end

    classDef App fill:#fff,stroke:#333,stroke-width:2px
    class App App
```
