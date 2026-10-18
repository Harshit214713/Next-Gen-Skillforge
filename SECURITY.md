# Security Policy

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

Report vulnerabilities privately through one of these channels:

- **Preferred:** [GitHub Security Advisories](https://github.com/divyanshakya966/Next-Gen-Skillforge/security/advisories/new) (Report a vulnerability)
- **Email:** 196189584+divyanshakya966@users.noreply.github.com

Please include:

1. Description of the vulnerability and its impact
2. Steps to reproduce (proof of concept, if possible)
3. Affected files, endpoints, or versions
4. Any suggested fix (optional)

## What to Expect

| Stage | Target |
|-------|--------|
| Acknowledgement | Within 3 working days |
| Initial assessment | Within 7 working days |
| Fix or mitigation timeline | Depends on severity; coordinated disclosure |

You will receive updates as the issue is triaged. Once a fix is released, we are happy to credit you in the release notes (unless you prefer to remain anonymous).

## Scope

In scope:

- The Hono API (`src/`) — session handling, cookie encryption, input validation, report generation
- The Next.js frontend (`app/`, `components/`, `lib/`) — XSS, CSRF, injection, unsafe redirects
- Dependency vulnerabilities disclosed through Dependabot / GitHub Advisory Database
- Secrets management (`.dev.vars`, Worker secrets, KV bindings)

Out of scope:

- Vulnerabilities in third-party services (AI provider APIs, LinkedIn/GitHub scraping targets)
- Denial-of-service against the public `workers.dev` endpoint
- Social engineering or issues requiring physical access
- Reports from automated scanners without a demonstrated impact

## Safe Harbor

We consider good-faith security research conducted under this policy to be authorized. We will not pursue legal action against researchers who:

- Avoid privacy violations, data destruction, and service disruption
- Only interact with accounts they own or with explicit permission
- Give us reasonable time to address issues before public disclosure
- Never access, modify, or exfiltrate other users' session data or profile data

## Supported Versions

Only the latest deployment of `main` is supported. Security fixes are applied to `main` and deployed by maintainers.

## Secret Handling Best Practices (for contributors)

- Never commit `.dev.vars`, `.env*` files, API keys, or `SESSION_SECRET` values. `.dev.vars` and `.env*` are gitignored — keep it that way.
- Use [`.dev.vars.example`](.dev.vars.example) as the template for local Worker secrets.
- Use `wrangler secret put SESSION_SECRET` (not config files) for production secrets.
- Never log request bodies, cookies, or AI provider API keys.
- If you accidentally commit a secret, rotate it immediately and follow the reporting channel above.
