import { analyzeProfileText, getAIProvider, type AIDetectedSkill } from '../ai';
import type { Env } from '../session';
import { isUserProfile, normalizeLinks } from '../validate';
import type { SocialLinks, UserProfile } from '../../lib/types';
import { buildProfile, detectFocusArea, type FocusArea } from './build';
import { buildProfileText, collectSources, type ScrapeWarning } from './scrape';
import { mergeDetected, type DetectedSkill } from './skills';

export interface RunAnalysisInput {
  links: Partial<SocialLinks>;
  resumeText?: string;
  resumeFileName?: string;
}

export interface RunAnalysisResult {
  profile: UserProfile;
  warnings: ScrapeWarning[];
  sourceCount: number;
  engine: 'ai' | 'heuristic';
  focus: FocusArea;
}

function aiSkillsToDetected(skills: AIDetectedSkill[], fallback: DetectedSkill[], type: 'technical' | 'soft'): DetectedSkill[] {
  const detected = skills
    .filter((skill) => skill.type === type || (skill.type === 'other' && type === 'technical'))
    .map((skill) => ({
      name: skill.name,
      count: Math.max(1, Math.round(skill.score)),
      sources: [skill.source || 'AI'],
      score: Math.max(20, Math.min(98, Math.round(skill.score))),
    }));

  if (detected.length >= 3) return detected.slice(0, type === 'technical' ? 12 : 6);

  const merged = new Map<string, DetectedSkill>();
  for (const skill of fallback) merged.set(skill.name, skill);
  for (const skill of detected) {
    const existing = merged.get(skill.name);
    if (!existing || skill.score > existing.score) merged.set(skill.name, skill);
  }
  return Array.from(merged.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, type === 'technical' ? 12 : 6);
}

export async function runAnalysis(env: Env, input: RunAnalysisInput): Promise<RunAnalysisResult> {
  const links = normalizeLinks(input.links);
  const resumeText = input.resumeText?.trim() || undefined;

  const { sources, warnings } = await collectSources(links, resumeText, input.resumeFileName);

  if (sources.length === 0) {
    const message = warnings.length
      ? `Could not read any profile source. ${warnings.map((w) => `${w.source}: ${w.reason}`).join('; ')}`
      : 'No readable profile sources found. Check your links or upload a resume.';
    throw Object.assign(new Error(message), { status: 422, warnings });
  }

  const merged = mergeDetected(sources.map((source) => ({ text: `${source.title} ${source.text}`, source: source.source })));
  const focus = detectFocusArea(merged.technical);
  const heuristicProfile = buildProfile({
    links,
    technical: merged.technical,
    soft: merged.soft,
    sourceCount: sources.length,
    hasResume: Boolean(resumeText),
    resumeChars: resumeText?.length ?? 0,
    focus,
  });

  let profile = heuristicProfile;
  let engine: RunAnalysisResult['engine'] = 'heuristic';

  if (getAIProvider(env) !== 'none') {
    try {
      const profileText = buildProfileText(links, sources);
      const aiAnalysis = await analyzeProfileText(env, profileText);

      const technical = aiSkillsToDetected(aiAnalysis.technicalSkills, merged.technical, 'technical');
      const soft = aiSkillsToDetected(aiAnalysis.softSkills, merged.soft, 'soft');
      const aiFocus = detectFocusArea(technical);

      const candidate = buildProfile({
        links,
        technical,
        soft,
        sourceCount: sources.length,
        hasResume: Boolean(resumeText),
        resumeChars: resumeText?.length ?? 0,
        focus: aiFocus,
      });

      candidate.aiSummary = {
        ...candidate.aiSummary,
        overview: aiAnalysis.summary || candidate.aiSummary.overview,
        strengths: aiAnalysis.strengths.length ? aiAnalysis.strengths.slice(0, 5) : candidate.aiSummary.strengths,
        gaps: aiAnalysis.gaps.length ? aiAnalysis.gaps.slice(0, 5) : candidate.aiSummary.gaps,
        industryRelevanceScore: aiAnalysis.industryRelevanceScore > 0
          ? Math.min(98, aiAnalysis.industryRelevanceScore)
          : candidate.aiSummary.industryRelevanceScore,
        atsScore: aiAnalysis.atsScore > 0 ? aiAnalysis.atsScore : candidate.aiSummary.atsScore,
        atsFeedback: aiAnalysis.atsFeedback.length ? aiAnalysis.atsFeedback.slice(0, 6) : candidate.aiSummary.atsFeedback,
        industryInsights: aiAnalysis.industryInsights || candidate.aiSummary.industryInsights,
        topSkills: aiAnalysis.topSkills.length ? aiAnalysis.topSkills.slice(0, 6) : candidate.aiSummary.topSkills,
      };

      if (aiAnalysis.jobRecommendations.length) {
        candidate.jobRecommendations = aiAnalysis.jobRecommendations.slice(0, 5).map((job, index) => ({
          id: index + 1,
          title: job.title,
          company: job.company,
          matchPercentage: Math.min(98, Math.max(20, Math.round(job.matchPercentage))),
          salary: job.salary || 'Not disclosed',
          location: job.location || 'Remote',
          type: job.type || 'Full-time',
          skills: job.skills.slice(0, 5),
          description: job.description,
          applyUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title)}`,
          fitReason: job.fitReason,
        }));
      }

      if (aiAnalysis.learningPath.length) {
        candidate.learningPath = aiAnalysis.learningPath.slice(0, 6).map((item, index) => ({
          id: index + 1,
          topic: item.topic,
          priority: item.priority,
          timeEstimate: item.timeEstimate || '2\u20134 weeks',
          explanation: item.explanation,
          resources: item.resources.slice(0, 4).map((resource) => ({
            type: (['course', 'book', 'video', 'documentation'] as const).includes(resource.type as 'course')
              ? resource.type as 'course' | 'book' | 'video' | 'documentation'
              : 'documentation',
            title: resource.title,
            provider: resource.provider,
            url: resource.url,
            free: Boolean(resource.free),
          })),
        }));
      }

      if (isUserProfile(candidate)) {
        profile = candidate;
        engine = 'ai';
      }
    } catch (error) {
      console.error('AI analysis failed, falling back to heuristic engine:', error);
      warnings.push({
        source: 'ai',
        url: '',
        reason: error instanceof Error ? error.message : 'AI provider failed; used heuristic analysis instead.',
      });
    }
  }

  return { profile, warnings, sourceCount: sources.length, engine, focus };
}
