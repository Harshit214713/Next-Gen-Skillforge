# Next-Gen Skillforge

> AI-powered career intelligence dashboard

[![Contributors](https://img.shields.io/github/contributors/divyanshakya966/Next-Gen-Skillforge)](https://github.com/divyanshakya966/Next-Gen-Skillforge/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/divyanshakya966/Next-Gen-Skillforge)](https://github.com/divyanshakya966/Next-Gen-Skillforge/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Hosted on Cloudflare](https://img.shields.io/badge/Hosted%20on-Cloudflare-F38020?logo=cloudflare)](https://cloudflare.com/)
[![CI](https://img.shields.io/github/actions/status/divyanshakya966/Next-Gen-Skillforge/ci?label=CI)](https://github.com/divyanshakya966/Next-Gen-Skillforge/actions/workflows/ci.yml)


Next-Gen Skillforge is an AI-powered career intelligence dashboard. It analyzes public profile links and resume content, extracts skill signals, generates role-fit insights, and creates a personalized learning roadmap.

## Architecture

The project is split into two independently deployed parts on Cloudflare:

| Component | Platform | Purpose |
|-----------|----------|---------|
| **Frontend** | Cloudflare Pages | Next.js static export serving the dashboard UI |
| **Backend** | Cloudflare Workers | Hono-based API handling session, analysis, resume import, and PDF report generation |

The frontend calls the Worker backend via `NEXT_PUBLIC_API_URL`. Session data is stored in Workers KV with encrypted cookies.

## Core Functionality

- Link-based profile analysis (GitHub, LinkedIn, portfolio, resume URL, Twitter, Dev.to).
- Resume upload and parsing (`.txt`; `.pdf`/`.docx` parsing unavailable on Workers).
- AI-generated outputs:
  - Technical and soft skill scoring.
  - Summary, strengths, and growth gaps.
  - Industry relevance score.
  - ATS score with actionable feedback (when resume text is available).
  - Job recommendations with match percentage and fit reason.
  - Prioritized learning path with resource links.
- Downloadable PDF report from analyzed profile data.
- Session-backed persistence for preferences and last valid analysis.

## Tech Stack

- Next.js 15 (App Router, static export)
- React 18 + TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- Hono (Worker API)
- Vitest (testing)
- Cloudflare Workers KV (session storage)

## Project Structure

```text
next-gen-skillforge/
├── app/                 # Next.js frontend (App Router)
│   ├── page.tsx         # Dashboard UI
│   └── layout.tsx       # Root layout
├── components/          # React components
│   ├── layout/
│   ├── sections/
│   └── ui/
├── lib/                 # Shared libraries
│   ├── api-client.ts    # Fetch-based API client (calls Worker)
│   ├── ai.ts            # AI provider adapters (OpenAI, Anthropic, etc.)
│   ├── profileDefaults.ts
│   ├── types.ts
│   └── utils.ts
├── src/                 # Cloudflare Worker backend
│   ├── index.ts         # Hono app entry point + routing
│   ├── session.ts       # KV-backed encrypted cookie sessions
│   ├── types.ts         # Worker types
│   └── routes/          # API route handlers
│       ├── preferences.ts
│       ├── analysis.ts
│       ├── resume.ts
│       └── report.ts
├── public/              # Static assets
├── wrangler.toml        # Worker configuration
├── next.config.mjs      # Next.js config (static export)
├── vitest.config.ts     # Test configuration
└── package.json
```

## Local Development

### Prerequisites

- Node.js v22+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account

### Setup

```bash
# Install dependencies
npm ci

# Authenticate with Cloudflare
npx wrangler login

# Create the KV namespace (one-time)
npx wrangler kv:namespace create "SESSION_KV"
# Add the returned ID to wrangler.toml under [[kv_namespaces]] id

# Set the session secret (one-time)
npx wrangler secret put SESSION_SECRET
# Value must be at least 32 characters

# Start the Worker locally (port 8787)
npm run dev:worker

# Start the Next.js frontend locally (port 3000)
npm run dev
```

The frontend calls `https://next-gen-skillforge.divyanshakya.workers.dev` by default. Override with `NEXT_PUBLIC_API_URL` if using a custom Worker URL.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run dev:worker` | Start Worker locally with wrangler |
| `npm run build` | Build Next.js production bundle |
| `npm run build:cf` | Build static export for Cloudflare Pages (`out/`) |
| `npm run deploy:worker` | Deploy Worker to Cloudflare |
| `npm run deploy:cf` | Deploy static frontend to Cloudflare Pages |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type check |
| `npm run test` | Run Vitest test suite |

## CI/CD

GitHub Actions runs on every push and PR to `main`:

1. **Lint** — ESLint
2. **Type Check** — `tsc --noEmit`
3. **Tests** — Vitest unit tests
4. **Build** — Next.js static export (`out/`)
5. **Deploy** (main branch only) — Worker + Pages deployment

Required secrets in GitHub repository settings (Settings → Secrets and variables → Actions):

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Workers/Pages edit permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

## Deployment

### Frontend (Cloudflare Pages)

1. Connect the repository to Cloudflare Pages.
2. Build command: `npm run build:cf`
3. Output directory: `out/`
4. Environment variables: `NEXT_PUBLIC_API_URL` (Worker URL)

### Backend (Cloudflare Workers)

1. Run `npx wrangler deploy src/index.ts`
2. Ensure `SESSION_KV` KV namespace is bound in `wrangler.toml`
3. Ensure `SESSION_SECRET` is set via `wrangler secret put SESSION_SECRET`

## Testing

```bash
npm run test          # Run all tests once
npm run test:watch    # Watch mode
```

Tests cover session encryption/cookie handling, link/sanitization validation, analysis payload validation, PDF report utilities, and the API client.

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting pull requests.

All PRs must pass the CI checks (lint, typecheck, tests, build) before merging to `main`.

Good starting points are issues labeled `good first issue` and `help wanted`.

## License

MIT License — see [LICENSE](LICENSE) for details.
