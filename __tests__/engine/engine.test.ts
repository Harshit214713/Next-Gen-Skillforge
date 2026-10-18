import { describe, it, expect } from 'vitest';
import { detectSkills, mergeDetected } from '../../src/engine/skills';
import { stripHtml, usernameFromUrl } from '../../src/engine/scrape';
import { detectFocusArea, buildProfile } from '../../src/engine/build';

describe('detectSkills', () => {
  it('detects technical keywords', () => {
    const { technical } = detectSkills('I build apps with React, TypeScript, Node.js and Docker.');
    const names = technical.map((s) => s.name);
    expect(names).toContain('React');
    expect(names).toContain('TypeScript');
    expect(names).toContain('Node.js');
    expect(names).toContain('Docker');
  });

  it('detects soft keywords', () => {
    const { soft } = detectSkills('Strong communication and leadership skills with teamwork.');
    const names = soft.map((s) => s.name);
    expect(names).toContain('Communication');
    expect(names).toContain('Leadership');
    expect(names).toContain('Teamwork');
  });

  it('returns empty arrays for unrelated text', () => {
    const { technical, soft } = detectSkills('cat dog bird fish');
    expect(technical).toHaveLength(0);
    expect(soft).toHaveLength(0);
  });

  it('scores are within 0-100 and sorted descending', () => {
    const { technical } = detectSkills('React React React TypeScript JavaScript Python SQL Docker Kubernetes AWS');
    expect(technical.length).toBeGreaterThan(0);
    for (const skill of technical) {
      expect(skill.score).toBeGreaterThanOrEqual(0);
      expect(skill.score).toBeLessThanOrEqual(100);
    }
    const scores = technical.map((s) => s.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });
});

describe('mergeDetected', () => {
  it('merges skills across sources and dedupes source names', () => {
    const { technical } = mergeDetected([
      { text: 'React and Node.js', source: 'github' },
      { text: 'React and Python', source: 'resume' },
    ]);
    const react = technical.find((s) => s.name === 'React');
    expect(react).toBeDefined();
    expect(react!.sources).toEqual(expect.arrayContaining(['github', 'resume']));
    expect(react!.count).toBeGreaterThanOrEqual(2);
  });

  it('is deterministic', () => {
    const batches = [
      { text: 'React TypeScript Node.js Docker', source: 'github' },
      { text: 'Python SQL Machine Learning', source: 'resume' },
    ];
    const a = mergeDetected(batches);
    const b = mergeDetected(batches);
    expect(a).toEqual(b);
  });
});

describe('stripHtml', () => {
  it('removes tags and scripts', () => {
    const html = '<html><head><script>alert(1)</script><style>.x{}</style></head><body><h1>Hello</h1><p>World &amp; more</p></body></html>';
    const text = stripHtml(html);
    expect(text).not.toContain('<h1>');
    expect(text).not.toContain('alert(1)');
    expect(text).toContain('Hello');
    expect(text).toContain('World');
  });
});

describe('usernameFromUrl', () => {
  it('extracts GitHub username', () => {
    expect(usernameFromUrl('https://github.com/octocat', 'github.com')).toBe('octocat');
  });

  it('returns null for wrong host', () => {
    expect(usernameFromUrl('https://gitlab.com/octocat', 'github.com')).toBeNull();
  });

  it('returns null for invalid URL', () => {
    expect(usernameFromUrl('not-a-url', 'github.com')).toBeNull();
  });
});

describe('detectFocusArea', () => {
  it('detects frontend focus', () => {
    const { technical } = detectSkills('React Next.js TypeScript CSS HTML Redux Webpack');
    expect(detectFocusArea(technical)).toBe('frontend');
  });

  it('detects backend focus', () => {
    const { technical } = detectSkills('Node.js Python Java Go SQL MongoDB GraphQL Microservices');
    expect(detectFocusArea(technical)).toBe('backend');
  });

  it('falls back to general', () => {
    expect(detectFocusArea([])).toBe('general');
  });
});

describe('buildProfile', () => {
  const links = {
    github: 'https://github.com/testuser',
    linkedin: '',
    resume: '',
    twitter: '',
    portfolio: '',
    devto: '',
  };

  it('builds a valid-shaped profile deterministically', () => {
    const { technical, soft } = detectSkills('React TypeScript Node.js communication leadership');
    const input = {
      links,
      technical,
      soft,
      sourceCount: 2,
      hasResume: false,
      resumeChars: 0,
      focus: 'fullstack' as const,
    };
    const a = buildProfile(input);
    const b = buildProfile(input);
    expect(a).toEqual(b);
    expect(a.links).toEqual(links);
    expect(a.technicalSkills.length).toBeGreaterThan(0);
    expect(a.jobRecommendations.length).toBeGreaterThan(0);
    expect(a.learningPath.length).toBeGreaterThan(0);
    expect(a.aiSummary.industryRelevanceScore).toBeGreaterThanOrEqual(0);
    expect(a.aiSummary.industryRelevanceScore).toBeLessThanOrEqual(100);
  });
});
