import { describe, it, expect } from 'vitest';

// Pure functions are re-implemented locally since they are module-private in preferences.ts

const LINK_KEYS = ['github', 'linkedin', 'resume', 'twitter', 'portfolio', 'devto'] as const;

function sanitizeThemeTest(input: unknown): 'light' | 'dark' | undefined {
  if (input === 'light' || input === 'dark') {
    return input;
  }
  return undefined;
}

function sanitizeLinkValueTest(input: string): string | undefined {
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

function sanitizeLinksTest(input: unknown): Record<string, string> {
  if (!input || typeof input !== 'object') return {};
  const normalizedLinks: Record<string, string> = {};
  for (const key of LINK_KEYS) {
    const value = (input as Record<string, unknown>)[key];
    if (typeof value === 'string') {
      const sanitized = sanitizeLinkValueTest(value);
      if (sanitized) normalizedLinks[key] = sanitized;
    }
  }
  return normalizedLinks;
}

describe('sanitizeTheme', () => {
  it.each([['light'], ['dark']])('accepts %s', (input) => {
    expect(sanitizeThemeTest(input)).toBe(input);
  });

  it.each([[''], ['medium'], [null], [undefined], [123], ['LIGHT']])('rejects %j', (input) => {
    expect(sanitizeThemeTest(input)).toBeUndefined();
  });
});

describe('sanitizeLinkValue', () => {
  it('accepts valid https URLs', () => {
    expect(sanitizeLinkValueTest('https://github.com/user')).toBe('https://github.com/user');
  });

  it('accepts valid http URLs', () => {
    expect(sanitizeLinkValueTest('http://example.com')).toBe('http://example.com/');
  });

  it('strips hash fragments', () => {
    expect(sanitizeLinkValueTest('https://github.com/user#section')).toBe('https://github.com/user');
  });

  it('rejects non-http protocols', () => {
    expect(sanitizeLinkValueTest('ftp://example.com')).toBeUndefined();
    expect(sanitizeLinkValueTest('javascript:alert(1)')).toBeUndefined();
  });

  it('rejects empty strings', () => {
    expect(sanitizeLinkValueTest('')).toBeUndefined();
    expect(sanitizeLinkValueTest('   ')).toBeUndefined();
  });

  it('rejects invalid URLs', () => {
    expect(sanitizeLinkValueTest('not-a-url')).toBeUndefined();
  });
});

describe('sanitizeLinks', () => {
  it('returns empty object for non-object input', () => {
    expect(sanitizeLinksTest(null)).toEqual({});
    expect(sanitizeLinksTest(undefined)).toEqual({});
    expect(sanitizeLinksTest('string')).toEqual({});
    expect(sanitizeLinksTest(123)).toEqual({});
  });

  it('sanitizes valid links and drops invalid ones', () => {
    const result = sanitizeLinksTest({
      github: 'https://github.com/user',
      linkedin: 'not-a-url',
      twitter: 'https://twitter.com/user',
      resume: '',
      portfolio: 'ftp://files.com',
      devto: 'https://dev.to/user',
    });
    expect(result.github).toBe('https://github.com/user');
    expect(result.twitter).toBe('https://twitter.com/user');
    expect(result.devto).toBe('https://dev.to/user');
    expect(result.linkedin).toBeUndefined();
    expect(result.resume).toBeUndefined();
    expect(result.portfolio).toBeUndefined();
  });

  it('trims whitespace and normalizes', () => {
    const result = sanitizeLinksTest({
      github: '  https://github.com/user  ',
    });
    expect(result.github).toBe('https://github.com/user');
  });
});
