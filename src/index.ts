import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getSession, saveSession, makeSessionCookie, clearSessionCookie, type Env } from './session';
import type { DashboardSessionData } from './types';
import type { ExportedHandler, ExecutionContext } from '@cloudflare/workers-types';
import preferencesRoute from './routes/preferences';
import analysisRoute from './routes/analysis';
import resumeRoute from './routes/resume';
import reportRoute from './routes/report';

interface AssetBinding {
  fetch(request: Request): Promise<Response>;
}

interface WorkerEnv extends Env {
  ASSETS: AssetBinding;
}

const app = new Hono<{ Bindings: Env; Variables: { session: DashboardSessionData } }>();

app.use('*', cors({
  origin: ['http://localhost:3000', 'https://*.workers.dev', 'https://*.pages.dev'],
  allowHeaders: ['Content-Type', 'Cookie'],
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use('*', async (c, next) => {
  const cookieHeader = c.req.header('cookie');
  c.set('session', await getSession(c.env, cookieHeader));
  await next();
});

app.route('/api/session/preferences', preferencesRoute);
app.route('/api/session/analysis', analysisRoute);
app.route('/api/resume/import', resumeRoute);
app.route('/api/report/download', reportRoute);

app.get('/api/health', (c) => c.json({ ok: true }));

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return app.fetch(request, env, ctx);
    }

    return env.ASSETS.fetch(request);
  },
} as unknown as ExportedHandler<WorkerEnv>;
