import { NextResponse } from 'next/server';
import { getDashboardSession, type AnalysisSessionData } from '@/lib/session';
import type { SocialLinks, UserProfile } from '@/lib/types';

export const runtime = 'edge';

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
}

function isUserProfile(value: unknown): value is UserProfile {
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

function sanitizeAnalysis(input: unknown): AnalysisSessionData | null {
  if (!isObject(input)) return null;

  const signature = typeof input.signature === 'string' ? input.signature : '';
  const profile = input.profile;

  if (!signature || !isUserProfile(profile)) {
    return null;
  }

  return {
    signature,
    profile: profile as UserProfile,
  };
}

export async function GET() {
  const session = await getDashboardSession();
  const currentSignature = linkSignature(session.preferences?.links ?? null);
  const analysis = session.analysis;

  if (analysis && analysis.signature === currentSignature) {
    return NextResponse.json({
      analysis,
    });
  }

  if (analysis) {
    delete session.analysis;
    await session.save();
  }

  return NextResponse.json({
    analysis: null,
  });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const analysis = sanitizeAnalysis(isObject(body) ? body.analysis : null);

  if (!analysis) {
    return NextResponse.json({ error: 'Invalid analysis payload.' }, { status: 400 });
  }

  const session = await getDashboardSession();
  session.analysis = analysis;
  session.preferences = {
    ...(session.preferences ?? {}),
    links: analysis.profile.links,
  };
  await session.save();

  return NextResponse.json({ ok: true, analysis: session.analysis });
}

export async function DELETE() {
  const session = await getDashboardSession();
  delete session.analysis;
  await session.save();

  return NextResponse.json({ ok: true });
}
