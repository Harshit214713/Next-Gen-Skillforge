import { NextResponse } from 'next/server';
import type { UserProfile } from '@/lib/types';

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

function isValidProfile(profile: unknown): profile is UserProfile {
  if (!isObject(profile)) return false;

  const links = profile.links;
  const aiSummary = profile.aiSummary;

  if (!isObject(links) || !isObject(aiSummary)) return false;

  const hasValidLinks = isString(links.github)
    && isString(links.linkedin)
    && isString(links.resume)
    && isString(links.twitter)
    && isString(links.portfolio)
    && isString(links.devto);

  const hasValidSkills = (value: unknown) => Array.isArray(value)
    && value.every((item) => isObject(item)
      && isString(item.skill)
      && typeof item.value === 'number'
      && typeof item.fullMark === 'number');

  const hasValidJobs = Array.isArray(profile.jobRecommendations)
    && profile.jobRecommendations.every((job) => isObject(job)
      && typeof job.id === 'number'
      && isString(job.title)
      && isString(job.company)
      && typeof job.matchPercentage === 'number'
      && isString(job.salary)
      && isString(job.location)
      && isString(job.type)
      && isStringArray(job.skills)
      && isString(job.description)
      && isString(job.applyUrl)
      && (typeof job.fitReason === 'undefined' || isString(job.fitReason)));

  const hasValidSummary = isString(aiSummary.overview)
    && isStringArray(aiSummary.strengths)
    && isStringArray(aiSummary.gaps)
    && typeof aiSummary.industryRelevanceScore === 'number'
    && typeof aiSummary.atsScore === 'number'
    && isStringArray(aiSummary.atsFeedback)
    && isString(aiSummary.industryInsights)
    && isStringArray(aiSummary.topSkills);

  const hasValidLearningPath = Array.isArray(profile.learningPath)
    && profile.learningPath.every((item) => isObject(item)
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

  return hasValidLinks
    && hasValidSkills(profile.technicalSkills)
    && hasValidSkills(profile.softSkills)
    && hasValidJobs
    && hasValidSummary
    && hasValidLearningPath;
}

function sanitizeProfile(input: unknown): UserProfile | null {
  if (!isValidProfile(input)) {
    return null;
  }

  return input;
}

function toTsModule(profile: UserProfile): string {
  const serialized = JSON.stringify(profile, null, 2);
  return `import type { UserProfile } from './types';\n\nexport const generatedUserProfile: UserProfile = ${serialized};\n`;
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const body = isObject(payload) ? payload : {};
  const profile = sanitizeProfile(body.profile);

  if (!profile) {
    return NextResponse.json({ error: 'Invalid profile payload.' }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    format: 'json',
    profile,
    message: 'Filesystem writes are not supported on this platform. Use the returned JSON directly.',
  });
}
