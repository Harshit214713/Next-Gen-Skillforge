# Contributing to Next-Gen Skillforge

Thank you for your interest in contributing! This project is open to contributors from **Nexus Spring of Code** and the wider open source community.

## Architecture

- **Single app**: one Cloudflare Worker serving the Hono API on `/api/*` plus the Next.js static export from `out/` (Workers Assets)
- Frontend lives in `app/`, `components/`, `lib/`; Worker backend lives in `src/`
- The frontend calls the API on the same origin via relative paths (`/api/...`)

## Getting Started

1. Fork the repository.
2. Clone your fork:

   ```bash
   git clone https://github.com/<your-username>/Next-Gen-Skillforge.git
   cd Next-Gen-Skillforge
   ```

3. Create a branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. Install dependencies:

   ```bash
   npm ci
   ```

5. Authenticate with Cloudflare (for local Worker development):

   ```bash
   npx wrangler login
   ```

6. Make your changes.
7. Run checks locally before pushing:

   ```bash
   npm run lint        # ESLint
   npm run typecheck   # TypeScript
   npm run test        # Vitest
   npm run build       # Next.js static export
   ```

8. Commit and push:

   ```bash
   git add .
   git commit -m "feat: describe your change"
   git push origin feature/your-feature-name
   ```

9. Open a Pull Request against `main`.

## Required CI Checks

Every PR must pass the following GitHub Actions checks before it can be merged:

| Check | Command |
|-------|---------|
| Lint | `npm run lint` |
| Type Check | `npm run typecheck` |
| Tests | `npm run test` |

Branch protection on `main` requires all three checks to pass. PRs cannot be merged if any check fails.

## How to Contribute

- Report bugs by opening an issue using the bug report template.
- Suggest new features using the feature request template.
- Pick up issues labeled `good first issue` or `help wanted`.
- Submit PRs with a clear description and link to the related issue.

## Code Style

- Follow the existing TypeScript and ESLint configuration.
- Use Tailwind CSS for styling.
- Keep components small and focused.
- Place Worker API routes under `src/routes/` and shared logic under `lib/`.
- Place Next.js frontend code under `app/` and `components/`.

## Deployment

This project is deployed to **Cloudflare** as a single Worker (API + static frontend) via `npm run deploy`. See the Deployment section in README for details.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
