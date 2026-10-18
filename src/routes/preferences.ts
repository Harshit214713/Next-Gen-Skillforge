import { Hono } from 'hono';
import { getSession, saveSession, makeSessionCookie, clearSessionCookie, type Env } from '../session';
import type { SocialLinks, DashboardSessionData } from '../types';

const app = new Hono<{ Bindings: Env; Variables: { session: DashboardSessionData } }>();

const LINK_KEYS = ['github', 'linkedin', 'resume', 'twitter', 'portfolio', 'devto'] as const;

function sanitizeTheme(input: unknown): 'light' | 'dark' | undefined {
  if (input === 'light' || input === 'dark') {
    return input;
  }
  return undefined;
}

function sanitizeLinkValue(input: string): string | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return undefined;
  }
}

function sanitizeLinks(input: unknown): Partial<SocialLinks> {
  if (!input || typeof input !== 'object') return {};
  const normalizedLinks: Partial<SocialLinks> = {};
  for (const key of LINK_KEYS) {
    const value = (input as Record<string, unknown>)[key];
    if (typeof value === 'string') {
      const sanitized = sanitizeLinkValue(value);
      if (sanitized) normalizedLinks[key] = sanitized;
    }
  }
  return normalizedLinks;
}

app.get('/', async (c) => {
  const session = c.get('session') as Awaited<ReturnType<typeof getSession>>;
  return c.json({
    theme: session.preferences?.theme,
    links: session.preferences?.links ?? {},
  });
});

app.post('/', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body.' }, 400);
  }

  const payload = (body ?? {}) as Record<string, unknown>;
  const theme = sanitizeTheme(payload.theme);
  const links = sanitizeLinks(payload.links);

  const hasLinks = Object.keys(links).length > 0;
  const hasTheme = typeof theme !== 'undefined';

  if (!hasTheme && !hasLinks) {
    return c.json({ error: 'No valid preference values provided in payload.' }, 400);
  }

  const session = c.get('session') as Awaited<ReturnType<typeof getSession>>;
  const previousPreferences = session.preferences ?? {};

  session.preferences = {
    ...previousPreferences,
    ...(hasTheme ? { theme } : {}),
    ...(hasLinks ? { links: { ...previousPreferences.links, ...links } } : {}),
  };

  const encrypted = await saveSession(c.env, session);

  return c.json({
    ok: true,
    preferences: session.preferences,
  }, {
    headers: { 'Set-Cookie': makeSessionCookie(encrypted) },
  });
});

export default app;
