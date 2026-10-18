import { Hono } from 'hono';
import type { Env } from '../session';
import type { DashboardSessionData } from '../types';

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

function inferExtension(fileName: string): string {
  const trimmed = fileName.trim().toLowerCase();
  const index = trimmed.lastIndexOf('.');
  return index >= 0 ? trimmed.slice(index) : '';
}

const app = new Hono<{ Bindings: Env; Variables: { session: DashboardSessionData } }>();

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
        { error: 'Legacy .doc files are not supported yet. Please re-save as .docx or .txt and upload again.' },
        400,
      );
    }

    if (
      mimeType.includes('wordprocessingml.document')
      || extension === '.docx'
    ) {
      return c.json(
        {
          error:
            'DOCX parsing is not supported on this platform. Please upload a .txt file or paste your resume text via profile links instead.',
        },
        422,
      );
    } else if (mimeType.includes('pdf') || extension === '.pdf') {
      return c.json(
        {
          error:
            'PDF parsing is not supported on this platform. Please upload a .txt file or paste your resume text via profile links instead.',
        },
        422,
      );
    } else if (mimeType.startsWith('text/') || extension === '.txt' || !mimeType) {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer).replace(/\s+/g, ' ').trim();
      if (!text || text.length < 40) {
        return c.json(
          { error: 'Could not extract enough readable content from this resume.' },
          422,
        );
      }
      return c.json({
        fileName,
        resumeText: text.slice(0, 18000),
        detectedSkills: [],
        extractedChars: text.length,
        note: 'Skill detection from uploaded resumes is limited on this platform. Add profile links for full analysis.',
      });
    } else {
      return c.json(
        { error: 'Unsupported file type. Upload a .txt file (PDF/DOCX parsing is unavailable on this platform).' },
        400,
      );
    }
  } catch (error) {
    console.error('Resume import failed:', error);
    return c.json({ error: 'Failed to parse uploaded resume.' }, 500);
  }
});

export default app;
