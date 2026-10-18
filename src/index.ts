import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getSession, saveSession, makeSessionCookie, clearSessionCookie, type Env } from './session';
import { DashboardSessionData } from './types';
import preferencesRoute from './routes/preferences';
import analysisRoute from './routes/analysis';
import resumeRoute from './routes/resume';
import reportRoute from './routes/report';

const app = new Hono<{ Bindings: Env; Variables: { session: DashboardSessionData } }>();

app.use('*', cors({
  origin: ['http://localhost:3000', 'https://*.pages.dev'],
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

export default app;
