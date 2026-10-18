declare type KVNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
};

import type { DashboardSessionData } from './types';

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const SESSION_COOKIE_NAME = 'session';

export interface D1StatementLike {
  bind(...params: unknown[]): {
    first<T = Record<string, unknown>>(): Promise<T | null>;
    run(): Promise<unknown>;
  };
}

export interface D1Like {
  prepare(query: string): D1StatementLike;
}

export interface Env {
  SESSION_KV: KVNamespace;
  SESSION_SECRET: string;
  DB?: D1Like;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  AZURE_OPENAI_API_KEY?: string;
  AZURE_OPENAI_ENDPOINT?: string;
  AZURE_OPENAI_DEPLOYMENT?: string;
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_MODEL?: string;
  HF_API_TOKEN?: string;
  HF_MODEL?: string;
}

function deriveKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveKey']).then((base) =>
    crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: enc.encode('next-gen-skillforge-session'), iterations: 100000, hash: 'SHA-256' },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    ),
  );
}

export async function encryptValue(plaintext: string, secret: string): Promise<string> {
  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  const base64 = btoa(String.fromCharCode(...combined));
  return base64;
}

export async function decryptValue(ciphertextB64: string, secret: string): Promise<string | null> {
  try {
    const key = await deriveKey(secret);
    const combined = Uint8Array.from(atob(ciphertextB64), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const [name, ...valueParts] = part.split('=');
    if (name && valueParts.length > 0) {
      cookies[name.trim()] = valueParts.join('=').trim();
    }
  }
  return cookies;
}

export async function getSessionId(env: Env, cookieStore: string | undefined): Promise<string | null> {
  if (!cookieStore) return null;
  const sessionCookie = parseCookies(cookieStore)[SESSION_COOKIE_NAME];
  if (!sessionCookie) return null;
  const decrypted = await decryptValue(sessionCookie, env.SESSION_SECRET);
  if (!decrypted) return null;
  try {
    const parsed = JSON.parse(decrypted) as { id?: unknown };
    return typeof parsed.id === 'string' && parsed.id ? parsed.id : null;
  } catch {
    return null;
  }
}

export async function getSession(env: Env, cookieStore: string | undefined): Promise<DashboardSessionData> {
  const id = await getSessionId(env, cookieStore);
  if (!id) return {};
  try {
    const stored = await env.SESSION_KV.get(`session:${id}`);
    if (stored) {
      return JSON.parse(stored) as DashboardSessionData;
    }
  } catch {
    return {};
  }
  return {};
}

export async function saveSession(
  env: Env,
  session: DashboardSessionData,
  existingId?: string | null,
): Promise<string> {
  const id = existingId ?? crypto.randomUUID();
  await env.SESSION_KV.put(`session:${id}`, JSON.stringify(session), { expirationTtl: SESSION_TTL_SECONDS });
  const encrypted = await encryptValue(JSON.stringify({ id }), env.SESSION_SECRET);
  return encrypted;
}

export function makeSessionCookie(value: string, secure = false): string {
  const secureFlag = secure ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=${value}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_SECONDS}; SameSite=Lax${secureFlag}`;
}

export function clearSessionCookie(secure = false): string {
  const secureFlag = secure ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secureFlag}`;
}
