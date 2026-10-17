# Next-Gen Skillforge

> AI-powered career intelligence dashboard

[![Contributors](https://img.shields.io/github/contributors/divyanshakya966/Next-Gen-Skillforge)](https://github.com/divyanshakya966/Next-Gen-Skillforge/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/divyanshakya966/Next-Gen-Skillforge)](https://github.com/divyanshakya966/Next-Gen-Skillforge/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Hosted on Cloudflare Pages](https://img.shields.io/badge/Hosted%20on-Cloudflare%20Pages-F38020?logo=cloudflare)](https://pages.cloudflare.com/)


Next-Gen Skillforge is an AI-powered career intelligence dashboard built with Next.js. It analyzes public profile links and resume content, extracts skill signals, generates role-fit insights, and creates a personalized learning roadmap.

## Core Functionality

- Link-based profile analysis (GitHub, LinkedIn, portfolio, resume URL, Twitter, Dev.to).
- Resume upload and parsing (`.pdf`, `.docx`, `.txt`) with detected skill keywords.
- AI-generated outputs:
	- Technical and soft skill scoring.
	- Summary, strengths, and growth gaps.
	- Industry relevance score.
	- ATS score with actionable feedback (when resume text is available).
	- Job recommendations with match percentage and fit reason.
	- Prioritized learning path with resource links.
- Downloadable PDF report from analyzed profile data.
- Session-backed persistence for preferences and last valid analysis.
- Optional profile snapshot export to generated TypeScript/JSON files.

## Tech Stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- iron-session
- Axios + Cheerio
- pdf-parse + mammoth

## Architecture Overview

```text
next-gen-skillforge/
├── app/
│   ├── page.tsx
│   │   └── Interactive dashboard UI, link input, resume import, analysis trigger, and results panels.
│   └── api/
│       ├── analyze-profile/
│       │   └── route.ts      -> URL validation, scraping, skill extraction, AI orchestration, and response shaping.
│       ├── resume/
│       │   └── import/
│       │       └── route.ts  -> Resume file parsing and keyword detection.
│       ├── report/
│       │   └── download/
│       │       └── route.ts  -> Generates a PDF report from validated profile payload.
│       ├── session/
│       │   ├── preferences/
│       │   │   └── route.ts  -> Stores theme, links, and UI preference state.
│       │   └── analysis/
│       │       └── route.ts  -> Stores/retrieves/clears current analysis in session.
│       └── profile/
│           └── snapshot/
│               └── route.ts  -> Writes lib/generatedUserProfile.ts with JSON fallback.
└── lib/
	├── ai.ts
	│   └── Multi-provider AI adapter and normalized profile analysis parsing.
	└── session.ts
		└── Session secret handling and cookie configuration.
```

## UX Flow

1. Add professional links and/or import a resume file.
2. Run profile analysis.
3. Review skill graphs, recommendations, ATS feedback, and learning path.
4. Download the generated PDF report.
5. Return later with session-restored preferences and analysis (when link signature matches).

## Contributing

We welcome contributions from **Nexus Spring of Code** participants and the open source community! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting pull requests.

Good starting points are issues labeled `good first issue` and `help wanted`.

## Deployment

This project is hosted on **Cloudflare Pages** using the [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/) integration.

### Deploying to Cloudflare Pages

1. Connect your GitHub repository to [Cloudflare Pages](https://dash.cloudflare.com/pages).
2. Set the build command to `npm run build:cf`.
3. Set the build output directory to `.next`.
4. Add any required environment variables (e.g. API keys) in the Pages dashboard.

Environment variables are configured via `wrangler.toml` and the Cloudflare dashboard.

## Notes

- URL handling includes SSRF-focused safeguards (no localhost/private network targets).
- Session data is cookie-backed and encrypted via `iron-session`.
- Resume ATS scoring is most useful after successful resume import.
- Snapshot files are generated artifacts and can be regenerated anytime.

## Future Enhancements (Startup Roadmap)

These enhancements can help evolve Next-Gen Skillforge from a prototype into a startup-ready product:

- User accounts and persistent profile history
	- Allow users to track progress over weeks/months and compare score deltas over time.

- Recruiter and hiring manager mode
	- Add candidate comparison views, shortlist pipelines, and shareable evaluation reports.

- Subscription tiers (B2C + B2B)
	- Free tier for basic analysis, Pro for deeper insights/reports, and Team plans for bootcamps or hiring teams.

- Job board and ATS integrations
	- Connect with LinkedIn Jobs, Greenhouse, Lever, and Workday to deliver role-specific match insights.

- Interview preparation assistant
	- Generate mock interview questions from detected skill gaps and provide feedback loops.

- Learning path execution tracking
	- Add milestone checklists, reminders, and completion analytics to increase retention and outcomes.

- AI cost and reliability layer
	- Add provider fallback, response caching, retries, and per-feature token budgets for predictable margins.

- Privacy and compliance foundation
	- Introduce consent controls, data retention policies, delete-my-data flows, and audit logs.

- White-label offering for institutions
	- Offer branded portals for colleges, bootcamps, and workforce programs with cohort analytics.

- Outcome analytics dashboard
	- Track conversion metrics like interview callbacks, resume score improvement, and placement success.