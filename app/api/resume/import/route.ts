import { NextResponse } from 'next/server';

export const runtime = 'edge';

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

async function extractPlainText(buffer: Buffer): Promise<string> {
  return buffer.toString('utf8').replace(/\s+/g, ' ').trim();
}

function inferExtension(fileName: string): string {
  const trimmed = fileName.trim().toLowerCase();
  const index = trimmed.lastIndexOf('.');
  return index >= 0 ? trimmed.slice(index) : '';
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const uploadedResume = formData.get('resume');

    if (!(uploadedResume instanceof File)) {
      return NextResponse.json({ error: 'Please upload a resume file.' }, { status: 400 });
    }

    const file = uploadedResume;

    if (file.size === 0) {
      return NextResponse.json({ error: 'Uploaded file is empty.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Resume is too large. Keep file size under 8MB.' }, { status: 400 });
    }

    const fileName = file.name || 'resume';
    const extension = inferExtension(fileName);
    const mimeType = (file.type || '').toLowerCase();

    if (mimeType.includes('msword') || extension === '.doc') {
      return NextResponse.json(
        { error: 'Legacy .doc files are not supported yet. Please re-save as .docx or .txt and upload again.' },
        { status: 400 },
      );
    }

    let extractedText = '';

    if (
      mimeType.includes('wordprocessingml.document')
      || extension === '.docx'
    ) {
      return NextResponse.json(
        {
          error:
            'DOCX parsing is not supported on this platform. Please upload a .txt file or paste your resume text via profile links instead.',
        },
        { status: 422 },
      );
    } else if (mimeType.includes('pdf') || extension === '.pdf') {
      return NextResponse.json(
        {
          error:
            'PDF parsing is not supported on this platform. Please upload a .txt file or paste your resume text via profile links instead.',
        },
        { status: 422 },
      );
    } else if (mimeType.startsWith('text/') || extension === '.txt' || !mimeType) {
      extractedText = await extractPlainText(await file.arrayBuffer().then((b) => Buffer.from(b)));
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Upload a .txt file (PDF/DOCX parsing is unavailable on this platform).' },
        { status: 400 },
      );
    }

    if (!extractedText || extractedText.length < 40) {
      return NextResponse.json(
        { error: 'Could not extract enough readable content from this resume.' },
        { status: 422 },
      );
    }

    return NextResponse.json({
      fileName,
      resumeText: extractedText.slice(0, 18000),
      detectedSkills: [],
      extractedChars: extractedText.length,
      note: 'Skill detection from uploaded resumes is limited on this platform. Add profile links for full analysis.',
    });
  } catch (error) {
    console.error('Resume import failed:', error);
    return NextResponse.json(
      { error: 'Failed to parse uploaded resume.' },
      { status: 500 },
    );
  }
}
