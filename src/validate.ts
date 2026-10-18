import type { SocialLinks } from './types';

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

export function isSocialLinks(value: unknown): value is SocialLinks {
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

export function isSkillDataArray(value: unknown): boolean {
  return Array.isArray(value)
    && value.every((item) => isObject(item)
      && isString(item.skill)
      && typeof item.value === 'number'
      && typeof item.fullMark === 'number');
}

export function isJobRecommendationArray(value: unknown): boolean {
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

export function isAISummary(value: unknown): boolean {
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

export function isLearningPathArray(value: unknown): boolean {
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

export interface ValidUserProfile {
  links: SocialLinks;
  technicalSkills: unknown;
  softSkills: unknown;
  jobRecommendations: unknown;
  aiSummary: unknown;
  learningPath: unknown;
}

export function isUserProfile(value: unknown): value is ValidUserProfile {
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

export function linkSignature(links?: Partial<SocialLinks> | null): string {
  const normalized = normalizeLinks(links);
  return JSON.stringify(normalized);
}

export function normalizeLinks(links?: Partial<SocialLinks> | null): {
  github: string;
  linkedin: string;
  resume: string;
  twitter: string;
  portfolio: string;
  devto: string;
} {
  return {
    github: links?.github ?? '',
    linkedin: links?.linkedin ?? '',
    resume: links?.resume ?? '',
    twitter: links?.twitter ?? '',
    portfolio: links?.portfolio ?? '',
    devto: links?.devto ?? '',
  };
}

export function sanitizeAnalysis(input: unknown): { signature: string; profile: unknown } | null {
  if (!isObject(input)) return null;
  const signature = typeof input.signature === 'string' ? input.signature : '';
  const profile = input.profile;
  if (!signature || !isUserProfile(profile)) return null;
  return { signature, profile };
}
