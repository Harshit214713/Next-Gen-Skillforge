import { describe, it, expect } from 'vitest';
import { isAllowedOrigin } from '../../src/index';

describe('isAllowedOrigin', () => {
  it('allows localhost and local worker dev servers', () => {
    expect(isAllowedOrigin('http://localhost:3000')).toBe(true);
    expect(isAllowedOrigin('http://localhost:8787')).toBe(true);
  });

  it('allows Cloudflare Workers subdomains', () => {
    expect(isAllowedOrigin('https://skillforge.workers.dev')).toBe(true);
    expect(isAllowedOrigin('https://my-preview-app.workers.dev')).toBe(true);
  });

  it('allows Cloudflare Pages subdomains', () => {
    expect(isAllowedOrigin('https://skillforge.pages.dev')).toBe(true);
    expect(isAllowedOrigin('https://pr-12-preview.pages.dev')).toBe(true);
  });

  it('rejects unauthorized or arbitrary domains', () => {
    expect(isAllowedOrigin('https://example.com')).toBe(false);
    expect(isAllowedOrigin('https://evilpages.dev.attacker.com')).toBe(false);
    expect(isAllowedOrigin('http://malicious.workers.dev')).toBe(false); // only https
    expect(isAllowedOrigin('')).toBe(false);
  });
});
