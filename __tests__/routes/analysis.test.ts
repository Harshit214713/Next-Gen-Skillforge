import { describe, it, expect } from 'vitest';
import {
  isSocialLinks,
  isSkillDataArray,
  isJobRecommendationArray,
  isAISummary,
  isLearningPathArray,
  isUserProfile,
  linkSignature,
  sanitizeAnalysis,
} from '../../src/validate';

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
      { type: 'course' as const, title: 'Testing 101', provider: 'TestAcademy', url: 'https://example.com', free: true },
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
