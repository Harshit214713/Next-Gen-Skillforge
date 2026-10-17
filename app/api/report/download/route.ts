import { NextRequest, NextResponse } from 'next/server';
import type { UserProfile } from '@/lib/types';

export const runtime = 'edge';

interface DownloadReportBody {
  profile?: UserProfile;
}

type LineStyle = 'title' | 'meta' | 'section' | 'body' | 'bullet';

interface StyledLine {
  text: string;
  style: LineStyle;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isUserProfile(value: unknown): value is UserProfile {
  if (!isObject(value)) return false;

  const links = value.links;
  const aiSummary = value.aiSummary;

  if (!isObject(links) || !isObject(aiSummary)) return false;

  const hasValidLinks = isString(links.github)
    && isString(links.linkedin)
    && isString(links.resume)
    && isString(links.twitter)
    && isString(links.portfolio)
    && isString(links.devto);

  const hasValidSkills = (skills: unknown) => Array.isArray(skills)
    && skills.every((item) => isObject(item)
      && isString(item.skill)
      && typeof item.value === 'number'
      && typeof item.fullMark === 'number');

  const hasValidJobs = Array.isArray(value.jobRecommendations)
    && value.jobRecommendations.every((job) => isObject(job)
      && typeof job.id === 'number'
      && isString(job.title)
      && isString(job.company)
      && typeof job.matchPercentage === 'number'
      && isString(job.salary)
      && isString(job.location)
      && isString(job.type)
      && isStringArray(job.skills)
      && isString(job.description)
      && isString(job.applyUrl)
      && (typeof job.fitReason === 'undefined' || isString(job.fitReason)));

  const hasValidSummary = isString(aiSummary.overview)
    && isStringArray(aiSummary.strengths)
    && isStringArray(aiSummary.gaps)
    && typeof aiSummary.industryRelevanceScore === 'number'
    && typeof aiSummary.atsScore === 'number'
    && isStringArray(aiSummary.atsFeedback)
    && isString(aiSummary.industryInsights)
    && isStringArray(aiSummary.topSkills);

  const hasValidLearningPath = Array.isArray(value.learningPath)
    && value.learningPath.every((item) => isObject(item)
      && typeof item.id === 'number'
      && isString(item.topic)
      && (item.priority === 'high' || item.priority === 'medium' || item.priority === 'low')
      && isString(item.timeEstimate)
      && isString(item.explanation)
      && Array.isArray(item.resources)
      && item.resources.every((resource) => isObject(resource)
        && (resource.type === 'course' || resource.type === 'book' || resource.type === 'video' || resource.type === 'documentation')
        && isString(resource.title)
        && (typeof resource.provider === 'undefined' || isString(resource.provider))
        && isString(resource.url)
        && typeof resource.free === 'boolean'));

  return hasValidLinks
    && hasValidSkills(value.technicalSkills)
    && hasValidSkills(value.softSkills)
    && hasValidJobs
    && hasValidSummary
    && hasValidLearningPath;
}

function toSafeText(value: string | undefined | null): string {
  if (!value) return 'N/A';
  return value.replace(/\s+/g, ' ').trim() || 'N/A';
}

function stripMarkdown(value: string): string {
  return toSafeText(value)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/^>\s?/g, '')
    .replace(/^#+\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function wrapText(value: string, maxLength = 95): string[] {
  const words = stripMarkdown(value).split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxLength) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.length > 0 ? lines : ['N/A'];
}

function pushSection(lines: StyledLine[], title: string, values: string[]) {
  lines.push({ text: '', style: 'body' });
  lines.push({ text: title.toUpperCase(), style: 'section' });
  lines.push({ text: '', style: 'body' });

  if (values.length === 0) {
    lines.push({ text: 'N/A', style: 'bullet' });
    return;
  }

  for (const value of values) {
    const wrapped = wrapText(value);
    wrapped.forEach((line, index) => {
      lines.push({ text: index === 0 ? line : `  ${line}`, style: 'bullet' });
    });
  }
}

function escapePdfText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildReportLines(profile: UserProfile): StyledLine[] {
  const today = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const lines: StyledLine[] = [
    { text: 'PROFILE ANALYSIS REPORT', style: 'title' },
    { text: 'Next-Gen Skillforge', style: 'meta' },
    { text: `Generated: ${today}`, style: 'meta' },
  ];

  const links = profile.links;
  pushSection(lines, 'Profile Links', [
    `GitHub: ${toSafeText(links.github)}`,
    `LinkedIn: ${toSafeText(links.linkedin)}`,
    `Portfolio: ${toSafeText(links.portfolio)}`,
    `Resume Link: ${toSafeText(links.resume)}`,
    `Twitter: ${toSafeText(links.twitter)}`,
    `Dev.to: ${toSafeText(links.devto)}`,
  ]);

  pushSection(lines, 'AI Summary', [profile.aiSummary.overview]);
  pushSection(lines, 'Top Skills', profile.aiSummary.topSkills);
  pushSection(lines, 'Strengths', profile.aiSummary.strengths);
  pushSection(lines, 'Growth Gaps', profile.aiSummary.gaps);
  pushSection(lines, 'Scores', [
    `Industry Relevance: ${profile.aiSummary.industryRelevanceScore}%`,
    `ATS Score: ${profile.aiSummary.atsScore}%`,
  ]);
  pushSection(lines, 'ATS Feedback', profile.aiSummary.atsFeedback);
  pushSection(lines, 'Industry Insights', [profile.aiSummary.industryInsights]);

  pushSection(
    lines,
    'Technical Skills',
    profile.technicalSkills.map((skill) => `${skill.skill}: ${Math.round(skill.value)} / ${skill.fullMark}`),
  );

  pushSection(
    lines,
    'Soft Skills',
    profile.softSkills.map((skill) => `${skill.skill}: ${Math.round(skill.value)} / ${skill.fullMark}`),
  );

  pushSection(
    lines,
    'Job Recommendations',
    profile.jobRecommendations.slice(0, 5).flatMap((job) => [
      `${job.title} at ${job.company}`,
      `${job.matchPercentage}% match | ${toSafeText(job.location)} | ${toSafeText(job.type)}`,
      `Skills: ${job.skills.length > 0 ? job.skills.join(', ') : 'N/A'}`,
      `Why fit: ${toSafeText(job.fitReason)}`,
    ]),
  );

  pushSection(
    lines,
    'Learning Path',
    profile.learningPath.slice(0, 6).flatMap((item) => {
      const resources = item.resources.length > 0
        ? item.resources.map((resource) => `${resource.title}${resource.provider ? ` (${resource.provider})` : ''}`).join('; ')
        : 'N/A';

      return [
        `${item.topic} (${item.priority.toUpperCase()})`,
        `Time estimate: ${toSafeText(item.timeEstimate)}`,
        toSafeText(item.explanation),
        `Resources: ${resources}`,
      ];
    }),
  );

  return lines;
}

function buildReportPdf(profile: UserProfile): Buffer {
  const lines = buildReportLines(profile);
  const pageHeight = 842;
  const topMargin = 64;
  const bottomMargin = 52;
  const pages: StyledLine[][] = [];
  let currentPage: StyledLine[] = [];
  let currentY = pageHeight - topMargin;

  const styleConfig: Record<LineStyle, { fontSize: number; lineHeight: number }> = {
    title: { fontSize: 19, lineHeight: 25 },
    meta: { fontSize: 10, lineHeight: 14 },
    section: { fontSize: 12, lineHeight: 17 },
    body: { fontSize: 10, lineHeight: 14 },
    bullet: { fontSize: 10, lineHeight: 14 },
  };

  for (const line of lines) {
    const config = styleConfig[line.style];
    if (currentY - config.lineHeight < bottomMargin) {
      pages.push(currentPage);
      currentPage = [];
      currentY = pageHeight - topMargin;
    }
    currentPage.push(line);
    currentY -= config.lineHeight;
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  const objects: string[] = [];
  const fontObjectNumber = 3;
  const boldFontObjectNumber = 4;
  const firstPageObjectNumber = 5;

  objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');

  const kidsRefs = pages
    .map((_, index) => `${firstPageObjectNumber + index * 2} 0 R`)
    .join(' ');
  objects.push(`2 0 obj << /Type /Pages /Count ${pages.length} /Kids [${kidsRefs}] >> endobj`);
  objects.push('3 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');
  objects.push('4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj');

  pages.forEach((pageLines, index) => {
    const pageObjectNumber = firstPageObjectNumber + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    const textCommands = ['BT'];
    let currentYPosition = 842 - topMargin;

    const resolveFont = (style: LineStyle): { fontRef: string; size: number; color: string; lineHeight: number; x: number } => {
      if (style === 'title') {
        return { fontRef: `/F2 ${styleConfig.title.fontSize} Tf`, size: styleConfig.title.fontSize, color: '0.06 0.31 0.24 rg', lineHeight: styleConfig.title.lineHeight, x: 50 };
      }
      if (style === 'meta') {
        return { fontRef: `/F1 ${styleConfig.meta.fontSize} Tf`, size: styleConfig.meta.fontSize, color: '0.32 0.36 0.42 rg', lineHeight: styleConfig.meta.lineHeight, x: 50 };
      }
      if (style === 'section') {
        return { fontRef: `/F2 ${styleConfig.section.fontSize} Tf`, size: styleConfig.section.fontSize, color: '0.09 0.36 0.22 rg', lineHeight: styleConfig.section.lineHeight, x: 50 };
      }
      if (style === 'bullet') {
        return { fontRef: `/F1 ${styleConfig.bullet.fontSize} Tf`, size: styleConfig.bullet.fontSize, color: '0.08 0.09 0.11 rg', lineHeight: styleConfig.bullet.lineHeight, x: 62 };
      }
      return { fontRef: `/F1 ${styleConfig.body.fontSize} Tf`, size: styleConfig.body.fontSize, color: '0.08 0.09 0.11 rg', lineHeight: styleConfig.body.lineHeight, x: 50 };
    };

    pageLines.forEach((line) => {
      const rendered = resolveFont(line.style);
      const text = line.style === 'bullet' && line.text.trim() ? `- ${line.text.trim()}` : line.text;
      textCommands.push(rendered.color);
      textCommands.push(rendered.fontRef);
      textCommands.push(`1 0 0 1 ${rendered.x} ${Math.round(currentYPosition)} Tm`);
      textCommands.push(`(${escapePdfText(text)}) Tj`);

      if (line.style === 'section') {
        textCommands.push('0.78 0.85 0.81 rg');
        textCommands.push('0.6 w');
        textCommands.push(`48 ${Math.round(currentYPosition - 4)} m 547 ${Math.round(currentYPosition - 4)} l S`);
      }

      currentYPosition -= rendered.lineHeight;
    });

    textCommands.push('0.5 0.54 0.60 rg');
    textCommands.push('/F1 9 Tf');
    textCommands.push(`1 0 0 1 270 24 Tm`);
    textCommands.push(`(Page ${index + 1} of ${pages.length}) Tj`);

    textCommands.push('ET');
    const stream = textCommands.join('\n');

    objects.push(
      `${pageObjectNumber} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjectNumber} 0 R /F2 ${boldFontObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >> endobj`,
    );
    objects.push(
      `${contentObjectNumber} 0 obj << /Length ${Buffer.byteLength(stream, 'latin1')} >> stream\n${stream}\nendstream endobj`,
    );
  });

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${object}\n`;
  }

  const xrefStart = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${offsets.length}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer << /Size ${offsets.length} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, 'latin1');
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DownloadReportBody;
    const profile = isUserProfile(body?.profile) ? body.profile : null;

    if (!profile) {
      return NextResponse.json({ error: 'Invalid or missing analysis report payload.' }, { status: 400 });
    }

    const pdfBuffer = buildReportPdf(profile);
    const pdfBytes = new Uint8Array(pdfBuffer);
    const fileStamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="profile-analysis-report-${fileStamp}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to build report PDF', error);
    return NextResponse.json({ error: 'Failed to generate PDF report.' }, { status: 500 });
  }
}
