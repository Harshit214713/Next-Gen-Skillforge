import { describe, it, expect } from 'vitest';
import { escapePdfText } from '../../src/routes/report';

// Re-implement pure report utilities for isolated testing
function toSafeText(value: string | undefined | null): string {
  if (!value) return 'N/A';
  return value.replace(/\s+/g, ' ').trim() || 'N/A';
}

function stripMarkdown(value: string): string {
  let result = value
    .replace(/```[\s\S]*?```/g, (match) => {
      const inner = match.replace(/^```[\s\S]*?\n/, '').replace(/\n```$/, '');
      return inner.trim() || ' ';
    })
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/^>\s?/g, '')
    .replace(/^#+\s*/g, '');
  return toSafeText(result);
}

function wrapText(value: string, maxLength = 95): string[] {
  const words = stripMarkdown(value).split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxLength) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : ['N/A'];
}


describe('report utilities', () => {
  describe('toSafeText', () => {
    it('returns N/A for empty/null/undefined', () => {
      expect(toSafeText('')).toBe('N/A');
      expect(toSafeText(null)).toBe('N/A');
      expect(toSafeText(undefined)).toBe('N/A');
      expect(toSafeText('   ')).toBe('N/A');
    });

    it('normalizes whitespace', () => {
      expect(toSafeText('  hello   world  ')).toBe('hello world');
    });
  });

  describe('stripMarkdown', () => {
    it('removes code fences but keeps content', () => {
      expect(stripMarkdown('```\ncode\n```')).toBe('code');
    });

    it('removes inline code backticks', () => {
      expect(stripMarkdown('`inline code`')).toBe('inline code');
    });

    it('removes bold markers', () => {
      expect(stripMarkdown('**bold text**')).toBe('bold text');
    });

    it('removes italic markers', () => {
      expect(stripMarkdown('*italic*')).toBe('italic');
      expect(stripMarkdown('_italic_')).toBe('italic');
    });

    it('converts links to text', () => {
      expect(stripMarkdown('[Google](https://google.com)')).toBe('Google (https://google.com)');
    });

    it('removes heading markers', () => {
      expect(stripMarkdown('# Heading')).toBe('Heading');
    });

    it('normalizes whitespace', () => {
      expect(stripMarkdown('  multiple   spaces  ')).toBe('multiple spaces');
    });
  });

  describe('wrapText', () => {
    it('wraps long text at maxLength', () => {
      const lines = wrapText('The quick brown fox jumps over the lazy dog', 10);
      expect(lines.length).toBeGreaterThan(1);
      for (const line of lines) {
        expect(line.length).toBeLessThanOrEqual(10);
      }
    });

    it('returns N/A for empty input', () => {
      expect(wrapText('')).toEqual(['N/A']);
    });

    it('returns single line for short text', () => {
      expect(wrapText('hello', 100)).toEqual(['hello']);
    });
  });

  describe('escapePdfText', () => {
    it('escapes backslashes', () => {
      expect(escapePdfText('a\\b')).toBe('a\\\\b');
    });

    it('escapes parentheses', () => {
      expect(escapePdfText('a(b)c')).toBe('a\\(b\\)c');
    });

    it('transliterates en-dash and em-dash to hyphen', () => {
      expect(escapePdfText('2\u20134 weeks')).toBe('2-4 weeks');
      expect(escapePdfText('term\u2014definition')).toBe('term-definition');
    });

    it('normalizes curly quotes to standard ASCII quotes', () => {
      expect(escapePdfText('\u201Cquoted\u201D')).toBe('"quoted"');
      expect(escapePdfText('\u2018single\u2019')).toBe("'single'");
    });

    it('normalizes accented characters to ASCII equivalents', () => {
      expect(escapePdfText('r\u00E9sum\u00E9')).toBe('resume');
      expect(escapePdfText('Jos\u00E9')).toBe('Jose');
    });
  });
});
