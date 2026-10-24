import {
  getSessionId,
  saveSession,
  SESSION_TTL_SECONDS,
  type Env,
} from './session';
import type { DashboardSessionData } from './types';

/**
 * Durable per-user data layer.
 *
 * Workers KV is the primary store (fast, free, 30-day rolling TTL refreshed on
 * every write). When a D1 database binding is present, records are mirrored
 * into D1 so data survives past the KV TTL and stays queryable. Every D1
 * failure degrades gracefully to KV-only behaviour, so the app works even
 * before the D1 database is provisioned.
 */

const KV_KEY_PREFIX = 'session:';

function parseStored(raw: string | null): DashboardSessionData | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DashboardSessionData;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

async function readFromD1(env: Env, userId: string): Promise<DashboardSessionData | null> {
  if (!env.DB) return null;
  try {
    const row = await env.DB
      .prepare('SELECT data FROM users WHERE id = ?')
      .bind(userId)
      .first<{ data?: string }>();
    return parseStored(row?.data ?? null);
  } catch (error) {
    console.error('D1 read failed:', error);
    return null;
  }
}

async function writeToD1(env: Env, userId: string, data: DashboardSessionData): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB
      .prepare(
        'INSERT INTO users (id, data, updated_at) VALUES (?, ?, ?) '
        + 'ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at',
      )
      .bind(userId, JSON.stringify(data), Date.now())
      .run();
  } catch (error) {
    console.error('D1 write failed:', error);
  }
}

async function deleteFromD1(env: Env, userId: string): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
  } catch (error) {
    console.error('D1 delete failed:', error);
  }
}

export async function loadSession(
  env: Env,
  cookieHeader: string | undefined,
): Promise<{ session: DashboardSessionData; userId: string | null }> {
  const userId = await getSessionId(env, cookieHeader);
  if (!userId) {
    return { session: {}, userId: null };
  }

  const stored = parseStored(await env.SESSION_KV.get(`${KV_KEY_PREFIX}${userId}`));
  if (stored) {
    return { session: stored, userId };
  }

  const fromD1 = await readFromD1(env, userId);
  if (fromD1) {
    // Rehydrate KV so the rolling TTL stays fresh for cookie-only sessions.
    await env.SESSION_KV.put(`${KV_KEY_PREFIX}${userId}`, JSON.stringify(fromD1), {
      expirationTtl: SESSION_TTL_SECONDS,
    });
    return { session: fromD1, userId };
  }

  // Cookie references a record that no longer exists (expired/rotated).
  return { session: {}, userId: null };
}

export async function persistSession(
  env: Env,
  session: DashboardSessionData,
  userId: string | null,
): Promise<{ cookieValue: string; userId: string }> {
  const nextUserId = userId ?? crypto.randomUUID();
  const cookieValue = await saveSession(env, session, nextUserId);
  await writeToD1(env, nextUserId, session);
  return { cookieValue, userId: nextUserId };
}

export async function deleteSessionData(env: Env, userId: string): Promise<void> {
  await env.SESSION_KV.delete(`${KV_KEY_PREFIX}${userId}`);
  await deleteFromD1(env, userId);
}
