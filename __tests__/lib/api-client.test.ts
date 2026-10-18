import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.stubGlobal('fetch', originalFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('api-client behavior', () => {
  it('handleResponse throws on non-ok responses', async () => {
    const errorBody = { error: 'Invalid payload' };
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(errorBody), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { apiPost } = await import('../../lib/api-client');

    await expect(apiPost('/api/test', {})).rejects.toThrow('Invalid payload');
  });

  it('handleResponse returns parsed JSON on success', async () => {
    const data = { ok: true, preferences: { theme: 'dark' } };
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })));

    const { apiGet } = await import('../../lib/api-client');

    const result = await apiGet('/api/test');
    expect(result).toEqual(data);
  });

  it('handleResponse returns blob for PDF content type', async () => {
    const bytes = new TextEncoder().encode('%PDF-1.4');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(bytes, {
      status: 200,
      headers: { 'content-type': 'application/pdf' },
    })));

    const { apiGet } = await import('../../lib/api-client');

    const result = await apiGet('/api/report');
    expect(result).toBeInstanceOf(Blob);
  });

  it('fetch is called with credentials include', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { apiGet } = await import('../../lib/api-client');
    await apiGet('/api/test');

    const calls = (fetchMock.mock.calls as unknown) as [string, any][];
    const callUrl = calls[0][0];
    const callOpts = calls[0][1];
    expect(callOpts).toMatchObject({ credentials: 'include' });
    expect(typeof callUrl).toBe('string');
  });
});
