import { Hono } from 'hono';
import { makeSessionCookie, type Env } from '../session';
import { persistSession } from '../store';
import type { SocialLinks, DashboardSessionData } from '../types';

const app = new Hono<{
  Bindings: Env;
  Variables: { session: DashboardSessionData; userId: string | null; secure: boolean };
}>();

const LINK_KEYS = ['github', 'linkedin', 'resume', 'twitter', 'portfolio', 'devto'] as const;

export function sanitizeTheme(input: unknown): 'light' | 'dark' | undefined {
  if (input === 'light' || input === 'dark') {
    return input;
  }
  return undefined;
}

export function sanitizeLinkValue(input: string): string | undefined {
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

export function sanitizeLinks(input: unknown): Partial<SocialLinks> {
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
  const session = c.get('session');
  return c.json({
    theme: session.preferences?.theme,
    links: session.preferences?.links ?? {},
    resumeFileName: session.resumeFileName ?? null,
    resumeChars: session.resumeText?.length ?? 0,
    hasAnalysis: Boolean(session.analysis),
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
  const rawLinks = payload.links && typeof payload.links === 'object' ? (payload.links as Record<string, unknown>) : null;
  const linkKeysPresent = rawLinks ? LINK_KEYS.filter((k) => k in rawLinks) : [];
  const hasLinkUpdates = linkKeysPresent.length > 0;
  const hasTheme = typeof theme !== 'undefined';

  if (!hasTheme && !hasLinkUpdates) {
    return c.json({ error: 'No valid preference values provided in payload.' }, 400);
  }

  const session = c.get('session');
  const previousPreferences = session.preferences ?? {};
  const nextLinks = { ...(previousPreferences.links ?? {}) };

  if (hasLinkUpdates) {
    for (const key of linkKeysPresent) {
      const val = rawLinks![key];
      if (typeof val === 'string') {
        const sanitized = sanitizeLinkValue(val);
        if (sanitized) {
          nextLinks[key] = sanitized;
        } else if (!val.trim()) {
          delete nextLinks[key];
        }
      }
    }
  }

  session.preferences = {
    ...previousPreferences,
    ...(hasTheme ? { theme } : {}),
    ...(hasLinkUpdates ? { links: nextLinks } : {}),
  };

  // Changing links invalidates any stored analysis (signature mismatch).
  const hadAnalysis = Boolean(session.analysis);
  if (hasLinkUpdates && session.analysis) {
    delete session.analysis;
  }

  const { cookieValue } = await persistSession(c.env, session, c.get('userId'));

  return c.json(
    {
      ok: true,
      preferences: session.preferences,
      analysisCleared: hasLinkUpdates && hadAnalysis,
    },
    { headers: { 'Set-Cookie': makeSessionCookie(cookieValue, c.get('secure')) } },
  );
});

export default app;
