import { Hono } from 'hono';
import { getSession, saveSession, makeSessionCookie, clearSessionCookie, type Env } from '../session';
import type { SocialLinks, DashboardSessionData } from '../types';

const app = new Hono<{ Bindings: Env; Variables: { session: DashboardSessionData } }>();

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isSocialLinks(value: unknown): value is SocialLinks {
  if (!isObject(value)) return false;
  return (
    isString(value.github)
    && isString(value.linkedin)
    && isString(value.resume)
    && isString(value.twitter)
    && isString(value.portfolio)
    && isString(value.devto)
  );
}

function isSkillDataArray(value: unknown): boolean {
  return Array.isArray(value)
    && value.every((item) => isObject(item)
      && isString(item.skill)
      && typeof item.value === 'number'
      && typeof item.fullMark === 'number');
}

function isJobRecommendationArray(value: unknown): boolean {
  return Array.isArray(value)
    && value.every((item) => isObject(item)
      && typeof item.id === 'number'
      && isString(item.title)
      && isString(item.company)
      && typeof item.matchPercentage === 'number'
      && isString(item.salary)
      && isString(item.location)
      && isString(item.type)
      && isStringArray(item.skills)
      && isString(item.description)
      && isString(item.applyUrl)
      && (typeof item.fitReason === 'undefined' || isString(item.fitReason)));
}

function isAISummary(value: unknown): boolean {
  if (!isObject(value)) return false;
  return (
    isString(value.overview)
    && isStringArray(value.strengths)
    && isStringArray(value.gaps)
    && typeof value.industryRelevanceScore === 'number'
    && typeof value.atsScore === 'number'
    && isStringArray(value.atsFeedback)
    && isString(value.industryInsights)
    && isStringArray(value.topSkills)
  );
}

function isLearningPathArray(value: unknown): boolean {
  return Array.isArray(value)
    && value.every((item) => isObject(item)
      && typeof item.id === 'number'
      && isString(item.topic)
      && (item.priority === 'high' || item.priority === 'medium' || item.priority === 'low')
      && isString(item.timeEstimate)
      && isString(item.explanation)
      && Array.isArray(item.resources)
      && item.resources.every((resource) => isObject(resource)
        && (resource.type === 'course' || resource.type === 'book' || resource.type === 'video' || resource.type === 'documentation')
        && isString(resource.title)
        && (typeof resource.provider === 'undefined' || isString(resource.provider))
        && isString(resource.url)
        && typeof resource.free === 'boolean'));
  ;
}

function isUserProfile(value: unknown): value is { links: SocialLinks; technicalSkills: unknown; softSkills: unknown; jobRecommendations: unknown; aiSummary: unknown; learningPath: unknown } {
  if (!isObject(value)) return false;
  return (
    isSocialLinks(value.links)
    && isSkillDataArray(value.technicalSkills)
    && isSkillDataArray(value.softSkills)
    && isJobRecommendationArray(value.jobRecommendations)
    && isAISummary(value.aiSummary)
    && isLearningPathArray(value.learningPath)
  );
}

function linkSignature(links?: Partial<SocialLinks> | null): string {
  const normalized: SocialLinks = {
    github: links?.github ?? '',
    linkedin: links?.linkedin ?? '',
    resume: links?.resume ?? '',
    twitter: links?.twitter ?? '',
    portfolio: links?.portfolio ?? '',
    devto: links?.devto ?? '',
  };
  return JSON.stringify(normalized);
}

function sanitizeAnalysis(input: unknown): { signature: string; profile: unknown } | null {
  if (!isObject(input)) return null;
  const signature = typeof input.signature === 'string' ? input.signature : '';
  const profile = input.profile;
  if (!signature || !isUserProfile(profile)) return null;
  return { signature, profile };
}

app.get('/', async (c) => {
  const session = c.get('session') as Awaited<ReturnType<typeof getSession>>;
  const currentSignature = linkSignature(session.preferences?.links ?? null);
  const analysis = session.analysis;

  if (analysis && analysis.signature === currentSignature) {
    return c.json({ analysis });
  }

  if (analysis) {
    delete session.analysis;
    await saveSession(c.env, session);
  }

  return c.json({ analysis: null });
});

app.post('/', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body.' }, 400);
  }

  const analysis = sanitizeAnalysis(isObject(body) ? body.analysis : null);
  if (!analysis) {
    return c.json({ error: 'Invalid analysis payload.' }, 400);
  }

  const session = c.get('session') as Awaited<ReturnType<typeof getSession>>;
  session.analysis = analysis;
  session.preferences = {
    ...(session.preferences ?? {}),
    links: (analysis.profile as { links?: SocialLinks }).links,
  };
  const encrypted = await saveSession(c.env, session);

  return c.json({ ok: true, analysis: session.analysis }, {
    headers: { 'Set-Cookie': makeSessionCookie(encrypted) },
  });
});

app.delete('/', async (c) => {
  const session = c.get('session') as Awaited<ReturnType<typeof getSession>>;
  delete session.analysis;
  const encrypted = await saveSession(c.env, session);
  return c.json({ ok: true }, {
    headers: { 'Set-Cookie': makeSessionCookie(encrypted) },
  });
});

export default app;
