# Contributing to Next-Gen Skillforge

Thank you for your interest in contributing! This project is open to contributors from **[Nexus Spring of Code (NSoC)](https://www.nsoc.in/)** and the wider open source community.

## Nexus Spring of Code (NSoC)

This repository is a registered NSoC project. If you are participating in the program:

- Every issue carries a difficulty label — pick by your comfort level:
  - **`Level 1`** — documentation, typo fixes, and other small work. Start here for your first PR.
  - **`Level 2`** — UI and frontend work: layouts, components, styling, and page-level changes.
  - **`Level 3`** — core logic, data/session changes, and complex features.
- **`good first issue`** and **`help wanted`** mark the best starting points.
- Reference the issue number in your PR (`Closes #123`) — it's required by CI, and program scoring links merges to issues.
- Keep PRs small and focused; they get reviewed faster.
- Questions? Use the [NSoC Discord](https://discord.gg/bZ47fac2jn) or the issue thread — not DMs.
- Read the [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

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

3. Create a branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

   Branch naming: `feature/<short-description>`, `fix/<short-description>`, `docs/<short-description>`, `chore/<short-description>`.

4. Install dependencies:

   ```bash
   npm ci
   ```

5. Authenticate with Cloudflare (for local Worker development):

   ```bash
   npx wrangler login
   ```

   For local Worker secrets, copy `.dev.vars.example` to `.dev.vars` and fill in values (this file is gitignored — never commit it).

6. Make your changes.

7. Run checks locally before pushing:

   ```bash
   npm run lint        # ESLint
   npm run typecheck   # TypeScript
   npm run test        # Vitest
   npm run build       # Next.js static export
   ```

8. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (this is what maintainers squash-merge with):

   ```bash
   git add -p
   git commit -m "feat: add keyboard shortcuts to dashboard"
   git push origin feature/your-feature-name
   ```

   Prefix with `feat:`, `fix:`, `docs:`, `test:`, `chore:`, or `refactor:`. See `git log` for examples.

9. Open a Pull Request against `main` and fill in the PR template.

## Keeping Your Branch Up to Date & Resolving Conflicts

Do this **before** opening your PR and again if CI or review shows conflicts:

```bash
git fetch origin
git rebase origin/main
```

If Git stops on a conflict:

1. Open each reported file, look for `<<<<<<<` / `=======` / `>>>>>>>` markers.
2. Keep the correct code (usually both changes are wanted — combine them; ask in the issue if unsure).
3. Mark it resolved: `git add <file>`
4. Continue: `git rebase --continue`
5. Push the updated branch: `git push --force-with-lease`

Rules:

- **Never use `git push --force`** without `--force-with-lease` — it can destroy other people's commits.
- Never merge `main` into your branch; rebase instead (keeps history clean).
- Prefer few, small commits — conflicts are easier to resolve when changes are focused.
- Stuck for more than 15 minutes? Comment on your PR or ask on Discord. Maintainers can resolve it for you (see [MAINTAINERS.md](MAINTAINERS.md#handling-merge-conflicts)).

## Required CI Checks

Every PR must pass the following GitHub Actions checks before it can be merged:

| Check | Command / meaning |
|-------|-------------------|
| Lint | `npm run lint` |
| Type Check | `npm run typecheck` |
| Tests | `npm run test` |
| Build | `npm run build` |
| PR structure | Automated PR Guard (see below) |

Branch protection on `main` requires all five checks to pass. PRs cannot be merged if any check fails.

### PR Guard rules

The **PR structure** check enforces the project's contribution standards on every PR:

- **Title** follows [Conventional Commits](https://www.conventionalcommits.org/) — e.g. `feat: ...`, `fix: ...`, `docs: ...`
- **Linked issue** — a line like `Closes #123` is required (open the issue first and discuss the approach)
- **Real description** — at least ~40 words beyond the template placeholders, including your test plan
- **No secret files** — `.env`, `.dev.vars`, keys, certificates are rejected
- **Workflow changes are maintainer-only** — propose CI changes in an issue first
- **Size limit** — ≤4,000 changed lines, or add `large-pr-ok` to the description with a justification (split larger work into stacked PRs)

If the check fails, edit the PR title/description and push — it re-runs automatically.

### AI-assisted contributions

Using AI tools to help write code is allowed — **but you are responsible for every line you submit.** PRs that are clearly bulk-generated without understanding will be closed. Specifically, your PR must:

1. Link a real issue where you described the problem and approach **before** coding.
2. Contain a test plan you actually executed (commands run, pages checked, edge cases tried).
3. Be code you can explain in review — you should be able to answer what a changed line does and why.
4. Stay scoped to the linked issue — no drive-by rewrites or speculative features.

If AI wrote it, verify it, test it, and be ready to defend it in review. Maintainers may close PRs that fail these standards (see [MAINTAINERS.md](MAINTAINERS.md#ai-generated-prs-and-spam)).

## How to Contribute

- Report bugs with the **Bug report** issue form (security issues go through [SECURITY.md](SECURITY.md) instead — never a public issue).
- Suggest features with the **Feature request** issue form.
- Pick up issues labeled `good first issue` or `help wanted` — comment on the issue first so we can assign it.
- **Open the issue first, describe your approach, get agreement, then code.** PRs without a linked issue fail CI.
- Submit PRs with a clear description, a test plan, and a linked issue (`Closes #n`).
- Keep PRs to one concern. Large PRs get split during review.

## Review Process

1. A maintainer reviews within ~2 working days during NSoC.
2. Expect either an approval, or specific change requests — prefix `nit:` comments are optional polish.
3. Push fixes to the same branch (do not open a new PR); CI re-runs automatically.
4. Squash merge by a maintainer once approved and green.

Details for maintainers: [MAINTAINERS.md](MAINTAINERS.md).

## Code Style

- Follow the existing TypeScript and ESLint configuration.
- Use Tailwind CSS for styling; colors come from HSL theme variables in `globals.css` / `tailwind.config.ts` — no hardcoded hex colors in components.
- Keep components small and focused.
- Place Worker API routes under `src/routes/` and shared logic under `lib/`.
- Place Next.js frontend code under `app/` and `components/`.
- UI primitives live in `components/ui/` — reuse them (`Button`, `Card`, `Input`, `Badge`, `toast`, `Skeleton`) instead of re-rolling equivalents.
- No `//` comments that restate the code; comments should explain *why* (maintainers will ask you to drop the rest).

## Security

- **Never** commit secrets, `.env` files, `.dev.vars`, or API keys. The gitignore covers them — do not force-add them (`git add -f`).
- Report vulnerabilities privately per [SECURITY.md](SECURITY.md).
- Do not log cookies, session data, user profile payloads, or provider API keys.
- New dependencies need justification in the PR discussion (Dependabot and the Dependency Review CI check also screen them).

## Deployment

This project is deployed to **Cloudflare** as a single Worker (API + static frontend) via `npm run deploy`. Deployment is maintainer-only; see the Deployment section in README.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
