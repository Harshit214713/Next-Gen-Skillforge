import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  encryptValue,
  decryptValue,
  getSession,
  saveSession,
  parseCookies,
  makeSessionCookie,
  clearSessionCookie,
  type Env,
} from '../src/session';
import type { DashboardSessionData } from '../src/types';
import { loadSession } from '../src/store';

const mockSecret = 'test-secret-minimum-thirty-two-characters-long';

const mockKV = new Map<string, string>();
const mockEnv: Env = {
  SESSION_KV: {
    get: vi.fn(async (key: string) => mockKV.get(key) ?? null),
    put: vi.fn(async (key: string, value: string, _options?: { expirationTtl?: number }) => {
      mockKV.set(key, value);
    }),
    delete: vi.fn(async (key: string) => {
      mockKV.delete(key);
    }),
  },
  SESSION_SECRET: mockSecret,
};

beforeEach(() => {
  mockKV.clear();
  vi.clearAllMocks();
});

describe('session cookie parsing', () => {
  it('parses multiple cookies correctly', () => {
    const result = parseCookies('session=abc123; theme=dark; other=x=y');
    expect(result.session).toBe('abc123');
    expect(result.theme).toBe('dark');
    expect(result.other).toBe('x=y');
  });

  it('returns empty object for empty string', () => {
    expect(parseCookies('')).toEqual({});
  });

  it('ignores malformed cookie parts', () => {
    const result = parseCookies('=value; valid=ok;');
    expect(result.valid).toBe('ok');
  });
});

describe('encryption roundtrip', () => {
  it('encrypts and decrypts a value correctly', async () => {
    const plaintext = JSON.stringify({ id: 'test-id-123' });
    const encrypted = await encryptValue(plaintext, mockSecret);
    expect(typeof encrypted).toBe('string');
    expect(encrypted).not.toBe(plaintext);

    const decrypted = await decryptValue(encrypted, mockSecret);
    expect(decrypted).toBe(plaintext);
  });

  it('returns null for tampered ciphertext', async () => {
    const plaintext = JSON.stringify({ id: 'test-id' });
    const encrypted = await encryptValue(plaintext, mockSecret);
    const tampered = encrypted.slice(0, -5) + 'XXXXX';
    const result = await decryptValue(tampered, mockSecret);
    expect(result).toBeNull();
  });

  it('returns null for invalid base64', async () => {
    const result = await decryptValue('not-valid-base64!!!', mockSecret);
    expect(result).toBeNull();
  });
});

describe('getSession', () => {
  it('returns empty session when no cookie provided', async () => {
    const session = await getSession(mockEnv, undefined);
    expect(session).toEqual({});
  });

  it('returns empty session when session cookie missing', async () => {
    const session = await getSession(mockEnv, 'theme=dark');
    expect(session).toEqual({});
  });

  it('returns decrypted session from KV', async () => {
    const sessionData: DashboardSessionData = {
      preferences: { theme: 'dark', links: { github: 'https://github.com/user' } },
    };
    const id = 'test-session-id';
    await mockEnv.SESSION_KV.put(`session:${id}`, JSON.stringify(sessionData));

    const encrypted = await encryptValue(JSON.stringify({ id }), mockSecret);
    const session = await getSession(mockEnv, `session=${encrypted}`);

    expect(session.preferences?.theme).toBe('dark');
    expect(session.preferences?.links?.github).toBe('https://github.com/user');
  });

  it('returns empty session when KV entry missing', async () => {
    const encrypted = await encryptValue(JSON.stringify({ id: 'nonexistent' }), mockSecret);
    const session = await getSession(mockEnv, `session=${encrypted}`);
    expect(session).toEqual({});
  });
});

describe('saveSession', () => {
  it('saves session to KV and returns encrypted cookie value', async () => {
    const session: DashboardSessionData = {
      preferences: { theme: 'light' },
    };
    const encrypted = await saveSession(mockEnv, session);
    expect(typeof encrypted).toBe('string');

    const decrypted = await decryptValue(encrypted, mockSecret);
    const parsed = JSON.parse(decrypted!) as { id: string };
    const stored = await mockEnv.SESSION_KV.get(`session:${parsed.id}`);
    expect(stored).toBe(JSON.stringify(session));
  });
});

describe('cookie helpers', () => {
  it('makes a session cookie with correct attributes', () => {
    const cookie = makeSessionCookie('encrypted-value');
    expect(cookie).toContain('session=encrypted-value');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Max-Age=');
  });

  it('clears session cookie with Max-Age=0', () => {
    const cookie = clearSessionCookie();
    expect(cookie).toContain('session=');
    expect(cookie).toContain('Max-Age=0');
  });
});


describe('loadSession store priority', () => {
  it('prefers KV store and does not query D1 when KV has session data', async () => {
    const userId = 'kv-user-123';
    const kvData: DashboardSessionData = { preferences: { theme: 'dark' } };
    await mockEnv.SESSION_KV.put(`session:${userId}`, JSON.stringify(kvData));

    const d1First = vi.fn();
    const envWithD1: Env = {
      ...mockEnv,
      DB: {
        prepare: vi.fn(() => ({
          bind: vi.fn(() => ({ first: d1First, run: vi.fn() })),
        })),
      },
    };

    const encrypted = await encryptValue(JSON.stringify({ id: userId }), mockSecret);
    const result = await loadSession(envWithD1, `session=${encrypted}`);

    expect(result.userId).toBe(userId);
    expect(result.session.preferences?.theme).toBe('dark');
    expect(d1First).not.toHaveBeenCalled();
  });

  it('falls back to D1 and rehydrates KV on cache miss', async () => {
    const userId = 'd1-user-456';
    const d1Data: DashboardSessionData = { preferences: { theme: 'light' } };
    const d1First = vi.fn(async () => ({ data: JSON.stringify(d1Data) })) as unknown as <T>() => Promise<T | null>;

    const envWithD1: Env = {
      ...mockEnv,
      DB: {
        prepare: vi.fn(() => ({
          bind: vi.fn(() => ({ first: d1First, run: vi.fn() })),
        })),
      },
    };

    const encrypted = await encryptValue(JSON.stringify({ id: userId }), mockSecret);
    const result = await loadSession(envWithD1, `session=${encrypted}`);

    expect(result.userId).toBe(userId);
    expect(result.session.preferences?.theme).toBe('light');
    expect(d1First).toHaveBeenCalled();
    expect(await mockEnv.SESSION_KV.get(`session:${userId}`)).toBe(JSON.stringify(d1Data));
  });
});