import { Hono } from 'hono';
import { makeSessionCookie, type Env } from '../session';
import { persistSession } from '../store';
import { detectSkills } from '../engine/skills';
import type { DashboardSessionData } from '../types';

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_RESUME_CHARS = 18000;

function inferExtension(fileName: string): string {
  const trimmed = fileName.trim().toLowerCase();
  const index = trimmed.lastIndexOf('.');
  return index >= 0 ? trimmed.slice(index) : '';
}

const app = new Hono<{
  Bindings: Env;
  Variables: { session: DashboardSessionData; userId: string | null; secure: boolean };
}>();

app.post('/', async (c) => {
  try {
    const formData = await c.req.formData();
    const uploadedResume = formData.get('resume');

    if (!(uploadedResume instanceof File)) {
      return c.json({ error: 'Please upload a resume file.' }, 400);
    }

    const file = uploadedResume;

    if (file.size === 0) {
      return c.json({ error: 'Uploaded file is empty.' }, 400);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return c.json({ error: 'Resume is too large. Keep file size under 8MB.' }, 400);
    }

    const fileName = file.name || 'resume';
    const extension = inferExtension(fileName);
    const mimeType = (file.type || '').toLowerCase();

    if (mimeType.includes('msword') || extension === '.doc') {
      return c.json(
        { error: 'Legacy .doc files are not supported. Please re-save as .txt and upload again.' },
        400,
      );
    }

    if (mimeType.includes('wordprocessingml.document') || extension === '.docx') {
      return c.json(
        { error: 'DOCX parsing is not supported on Workers. Please upload a .txt export of your resume.' },
        422,
      );
    }

    if (mimeType.includes('pdf') || extension === '.pdf') {
      return c.json(
        { error: 'PDF parsing is not supported on Workers. Please upload a .txt export of your resume.' },
        422,
      );
    }

    if (!mimeType.startsWith('text/') && extension !== '.txt' && mimeType) {
      return c.json(
        { error: 'Unsupported file type. Upload a .txt file (PDF/DOCX parsing is unavailable on this platform).' },
        400,
      );
    }

    const buffer = await file.arrayBuffer();
    const text = new TextDecoder().decode(buffer).replace(/\s+/g, ' ').trim();
    if (!text || text.length < 40) {
      return c.json(
        { error: 'Could not extract enough readable content from this resume.' },
        422,
      );
    }

    const resumeText = text.slice(0, MAX_RESUME_CHARS);
    const detected = detectSkills(resumeText, 'resume');

    // Persist the resume text into the session (KV + D1) so the analyze
    // endpoint can use it together with profile links.
    const session = c.get('session');
    session.resumeText = resumeText;
    session.resumeFileName = fileName;
    if (session.analysis) {
      // Stored analysis no longer reflects the new resume content.
      delete session.analysis;
    }
    const { cookieValue } = await persistSession(c.env, session, c.get('userId'));

    return c.json(
      {
        fileName,
        resumeText,
        detectedSkills: [
          ...detected.technical.map((skill) => skill.name),
          ...detected.soft.map((skill) => skill.name),
        ].slice(0, 20),
        extractedChars: text.length,
        saved: true,
        note: 'Resume text saved to your session. Run analysis to include it in your profile.',
      },
      { headers: { 'Set-Cookie': makeSessionCookie(cookieValue, c.get('secure')) } },
    );
  } catch (error) {
    console.error('Resume import failed:', error);
    return c.json({ error: 'Failed to parse uploaded resume.' }, 500);
  }
});

export default app;
