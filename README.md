# WhiteLotusAI — Frontend

The browser-based interface for WhiteLotusAI. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## Tech stack

| Area                   | Technology                 |
| ---------------------- | -------------------------- |
| Framework              | Next.js 16.4, React 19     |
| Language               | TypeScript 5               |
| Styling                | Tailwind CSS 3             |
| State management       | Zustand 5                  |
| Server state / caching | TanStack Query 5           |
| Markdown rendering     | react-markdown, remark-gfm |

## Project structure

```text
frontend/
├── public/               # Static assets (logo, app preview)
├── src/
│   ├── app/
│   │   ├── (app)/        # Authenticated routes: chat, plugins, settings, team
│   │   └── (landing)/    # Public routes: landing page, login, signup
│   ├── components/       # UI components
│   ├── context/          # React context (AuthContext)
│   ├── hooks/            # Custom hooks
│   ├── lib/              # API client, config, utilities, theme
│   ├── store/            # Zustand stores (session, shell)
│   └── types/            # Shared TypeScript types
├── .env.local.example    # Environment variable template
├── next.config.mjs       # Next.js config with security headers
├── tailwind.config.ts
└── tsconfig.json
```

## Getting started

### Prerequisites

- Node.js 24 or later
- npm

### 1. Install dependencies

```bash
npm ci
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```dotenv
# API origin — no trailing slash, no /api suffix
NEXT_PUBLIC_API_URL=http://localhost:8000

# Documentation site origin
NEXT_PUBLIC_DOCS_URL=http://localhost:3001

# Public-facing frontend origin (used for Open Graph metadata)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> `NEXT_PUBLIC_API_URL` must be the bare origin. The API client in `src/lib/api.ts` appends `/api/...` automatically.

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The backend stack must be running separately. See the root `README.md` for `docker compose` instructions.

## Available scripts

| Script          | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Production build             |
| `npm start`     | Start the production server  |
| `npm run lint`  | Run ESLint                   |

## Routes

| Route       | Description            |
| ----------- | ---------------------- |
| `/`         | Landing page           |
| `/login`    | Sign in                |
| `/signup`   | Register               |
| `/app/chat` | Chat workspace         |
| `/plugins`  | Integrations catalogue |
| `/settings` | User settings          |
| `/team`     | Team management        |

## Environment variables

| Variable               | Required | Description                                                                                           |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`  | Yes      | Backend API origin (e.g. `http://localhost:8000`)                                                     |
| `NEXT_PUBLIC_DOCS_URL` | No       | Documentation site origin                                                                             |
| `NEXT_PUBLIC_SITE_URL` | No       | Frontend public origin for Open Graph metadata. Set manually in `.env.local`; not a Docker build arg. |

`NEXT_PUBLIC_*` variables are embedded at build time. Rebuild the application when changing these values for a production deployment.

## Docker

The included `Dockerfile` produces a standalone Next.js image. Build arguments mirror the environment variables above:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_DOCS_URL=https://docs.example.com \
  -t whitelotusai-frontend .
```

## Security headers

`next.config.mjs` applies the following headers to all routes:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — disables camera, microphone, geolocation, and payment
- `Content-Security-Policy` — restricts scripts, styles, images, and connections to the app origin and configured API origin
