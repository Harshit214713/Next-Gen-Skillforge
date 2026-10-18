import { describe, it, expect } from 'vitest';

// Re-implement pure validation functions from analysis.ts for isolated testing
// (they are module-private, not exported)

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isSocialLinks(value: unknown): boolean {
  if (!isObject(value)) return false;
  return (
    isString((value as Record<string, unknown>).github)
    && isString((value as Record<string, unknown>).linkedin)
    && isString((value as Record<string, unknown>).resume)
    && isString((value as Record<string, unknown>).twitter)
    && isString((value as Record<string, unknown>).portfolio)
    && isString((value as Record<string, unknown>).devto)
  );
}

function isSkillDataArray(value: unknown): boolean {
  return Array.isArray(value)
    && value.every((item) => isObject(item)
      && isString((item as Record<string, unknown>).skill)
      && typeof (item as Record<string, unknown>).value === 'number'
      && typeof (item as Record<string, unknown>).fullMark === 'number');
}

function isJobRecommendationArray(value: unknown): boolean {
  return Array.isArray(value)
    && value.every((item) => isObject(item)
      && typeof (item as Record<string, unknown>).id === 'number'
      && isString((item as Record<string, unknown>).title)
      && isString((item as Record<string, unknown>).company)
      && typeof (item as Record<string, unknown>).matchPercentage === 'number'
      && isString((item as Record<string, unknown>).salary)
      && isString((item as Record<string, unknown>).location)
      && isString((item as Record<string, unknown>).type)
      && isStringArray((item as Record<string, unknown>).skills)
      && isString((item as Record<string, unknown>).description)
      && isString((item as Record<string, unknown>).applyUrl)
      && (typeof (item as Record<string, unknown>).fitReason === 'undefined'
        || isString((item as Record<string, unknown>).fitReason)));
}

function isAISummary(value: unknown): boolean {
  if (!isObject(value)) return false;
  return (
    isString((value as Record<string, unknown>).overview)
    && isStringArray((value as Record<string, unknown>).strengths)
    && isStringArray((value as Record<string, unknown>).gaps)
    && typeof (value as Record<string, unknown>).industryRelevanceScore === 'number'
    && typeof (value as Record<string, unknown>).atsScore === 'number'
    && isStringArray((value as Record<string, unknown>).atsFeedback)
    && isString((value as Record<string, unknown>).industryInsights)
    && isStringArray((value as Record<string, unknown>).topSkills)
  );
}

function isLearningPathArray(value: unknown): boolean {
  return Array.isArray(value)
    && value.every((item) => isObject(item)
      && typeof (item as Record<string, unknown>).id === 'number'
      && isString((item as Record<string, unknown>).topic)
      && (['high', 'medium', 'low'] as readonly string[]).includes(String((item as Record<string, unknown>).priority))
      && isString((item as Record<string, unknown>).timeEstimate)
      && isString((item as Record<string, unknown>).explanation)
      && Array.isArray((item as Record<string, unknown>).resources)
      && ((item as Record<string, unknown>).resources as unknown[]).every((resource) => isObject(resource)
        && (['course', 'book', 'video', 'documentation'] as readonly string[]).includes(String((resource as Record<string, unknown>).type))
        && isString((resource as Record<string, unknown>).title)
        && isString((resource as Record<string, unknown>).url)
        && typeof (resource as Record<string, unknown>).free === 'boolean'));
}

function linkSignature(links?: Record<string, string | undefined> | null): string {
  const normalized = {
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
  const profile = (input as Record<string, unknown>).profile;
  if (!signature || !isUserProfile(profile)) return null;
  return { signature, profile };
}

function isUserProfile(value: unknown): boolean {
  if (!isObject(value)) return false;
  return (
    isSocialLinks((value as Record<string, unknown>).links)
    && isSkillDataArray((value as Record<string, unknown>).technicalSkills)
    && isSkillDataArray((value as Record<string, unknown>).softSkills)
    && isJobRecommendationArray((value as Record<string, unknown>).jobRecommendations)
    && isAISummary((value as Record<string, unknown>).aiSummary)
    && isLearningPathArray((value as Record<string, unknown>).learningPath)
  );
}

const validSocialLinks = {
  github: 'https://github.com/user',
  linkedin: 'https://linkedin.com/in/user',
  resume: 'https://example.com/resume.pdf',
  twitter: 'https://twitter.com/user',
  portfolio: 'https://portfolio.com',
  devto: 'https://dev.to/user',
};

const validSkillData = [{ skill: 'JavaScript', value: 85, fullMark: 100 }];

const validJobRecommendation = {
  id: 1,
  title: 'Software Engineer',
  company: 'TechCorp',
  matchPercentage: 90,
  salary: '$100k',
  location: 'Remote',
  type: 'Full-time',
  skills: ['JavaScript', 'React'],
  description: 'Build web apps',
  applyUrl: 'https://example.com/apply',
};

const validAISummary = {
  overview: 'Great profile',
  strengths: ['React', 'Node'],
  gaps: ['Testing'],
  industryRelevanceScore: 85,
  atsScore: 80,
  atsFeedback: ['Add keywords'],
  industryInsights: 'Growing market',
  topSkills: ['React', 'Node'],
};

const validLearningPath = [
  {
    id: 1,
    topic: 'Testing',
    priority: 'high' as const,
    timeEstimate: '2 weeks',
    explanation: 'Learn testing',
    resources: [
      { type: 'course' as const, title: 'Testing 101', url: 'https://example.com', free: true },
    ],
  },
];

const validProfile = {
  links: validSocialLinks,
  technicalSkills: validSkillData,
  softSkills: validSkillData,
  jobRecommendations: [validJobRecommendation],
  aiSummary: validAISummary,
  learningPath: validLearningPath,
};

describe('validation functions', () => {
  describe('isSocialLinks', () => {
    it('accepts valid social links object', () => {
      expect(isSocialLinks(validSocialLinks)).toBe(true);
    });

    it('rejects missing fields', () => {
      const { github, ...rest } = validSocialLinks;
      expect(isSocialLinks(rest)).toBe(false);
    });

    it('rejects non-objects', () => {
      expect(isSocialLinks(null)).toBe(false);
      expect(isSocialLinks('string')).toBe(false);
      expect(isSocialLinks(123)).toBe(false);
    });
  });

  describe('isSkillDataArray', () => {
    it('accepts valid array', () => {
      expect(isSkillDataArray(validSkillData)).toBe(true);
    });

    it('rejects items with missing fields', () => {
      expect(isSkillDataArray([{ skill: 'JS' }])).toBe(false);
      expect(isSkillDataArray([{ value: 1 }])).toBe(false);
    });
  });

  describe('isJobRecommendationArray', () => {
    it('accepts valid array', () => {
      expect(isJobRecommendationArray([validJobRecommendation])).toBe(true);
    });

    it('rejects missing required fields', () => {
      const { id, ...rest } = validJobRecommendation;
      expect(isJobRecommendationArray([rest])).toBe(false);
    });
  });

  describe('isAISummary', () => {
    it('accepts valid summary', () => {
      expect(isAISummary(validAISummary)).toBe(true);
    });
  });

  describe('isLearningPathArray', () => {
    it('accepts valid learning path', () => {
      expect(isLearningPathArray(validLearningPath)).toBe(true);
    });

    it('rejects invalid priority', () => {
      const bad = [{ ...validLearningPath[0], priority: 'urgent' }];
      expect(isLearningPathArray(bad)).toBe(false);
    });
  });

  describe('isUserProfile', () => {
    it('accepts complete valid profile', () => {
      expect(isUserProfile(validProfile)).toBe(true);
    });

    it('rejects incomplete profile', () => {
      expect(isUserProfile({ links: validSocialLinks })).toBe(false);
    });
  });

  describe('linkSignature', () => {
    it('produces consistent signature for same links', () => {
      const a = linkSignature(validSocialLinks);
      const b = linkSignature(validSocialLinks);
      expect(a).toBe(b);
    });

    it('produces different signature for different links', () => {
      const a = linkSignature({ ...validSocialLinks, github: 'https://github.com/other' });
      const b = linkSignature(validSocialLinks);
      expect(a).not.toBe(b);
    });

    it('handles null/undefined gracefully', () => {
      const sig = linkSignature(null);
      expect(sig).toContain('"github":""');
      expect(linkSignature(undefined)).toBe(sig);
    });
  });

  describe('sanitizeAnalysis', () => {
    it('accepts valid analysis payload', () => {
      const result = sanitizeAnalysis({ signature: 'sig-123', profile: validProfile });
      expect(result).not.toBeNull();
      expect(result?.signature).toBe('sig-123');
    });

    it('rejects missing signature', () => {
      expect(sanitizeAnalysis({ profile: validProfile })).toBeNull();
    });

    it('rejects invalid profile', () => {
      expect(sanitizeAnalysis({ signature: 'sig', profile: {} })).toBeNull();
    });

    it('rejects non-object input', () => {
      expect(sanitizeAnalysis(null)).toBeNull();
      expect(sanitizeAnalysis('string')).toBeNull();
    });
  });
});
