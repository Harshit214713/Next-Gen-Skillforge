'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createEmptyUserProfile } from '@/lib/profileDefaults';
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPostForm,
} from '@/lib/api-client';
import type {
  JobRecommendation,
  LearningPathItem,
  LearningResource,
  SocialLinks,
  SkillData,
  UserProfile,
} from '@/lib/types';

import { Navbar } from '@/components/layout/Navbar';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { LinkInputs } from '@/components/sections/LinkInputs';
import { SkillRadar, SkillGrid } from '@/components/sections/SkillRadar';
import { JobList } from '@/components/sections/JobList';
import { AISummary } from '@/components/sections/AISummary';
import { LearningPath } from '@/components/sections/LearningPath';
import { EmptyState, OverviewStats } from '@/components/sections/Overview';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const animationVariant = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

type ThemeMode = 'light' | 'dark';
type ThemeTransition = 'to-light' | 'to-dark' | null;

interface Skill {
  name: string;
  confidence: number;
  source: string;
}

export default function HomePage() {
  const initialProfile = createEmptyUserProfile();
  const resumeFileInputRef = useRef<HTMLInputElement | null>(null);
  const [links, setLinks] = useState<SocialLinks>({
    github: '',
    linkedin: '',
    resume: '',
    portfolio: '',
    twitter: '',
    devto: '',
  });
  const [linkErrors, setLinkErrors] = useState<Partial<Record<keyof SocialLinks, string>>>({});
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [themeTransition, setThemeTransition] = useState<ThemeTransition>(null);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<Skill[]>([]);
  const [aiSummary, setAiSummary] = useState<string>(initialProfile.aiSummary.overview);
  const [aiGaps, setAiGaps] = useState<string[]>(initialProfile.aiSummary.gaps);
  const [aiStrengths, setAiStrengths] = useState<string[]>(initialProfile.aiSummary.strengths);
  const [aiTechnicalSkills, setAiTechnicalSkills] = useState<SkillData[]>(initialProfile.technicalSkills);
  const [aiSoftSkills, setAiSoftSkills] = useState<SkillData[]>(initialProfile.softSkills);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisMessage, setAnalysisMessage] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(false);

  const [jobs, setJobs] = useState<JobRecommendation[]>(initialProfile.jobRecommendations);
  const [learningPath, setLearningPath] = useState<LearningPathItem[]>(initialProfile.learningPath);
  const [industryRelevanceScore, setIndustryRelevanceScore] = useState(initialProfile.aiSummary.industryRelevanceScore);
  const [atsScore, setAtsScore] = useState(initialProfile.aiSummary.atsScore);
  const [atsFeedback, setAtsFeedback] = useState(initialProfile.aiSummary.atsFeedback);
  const [atsAvailable, setAtsAvailable] = useState(false);
  const [industryInsights, setIndustryInsights] = useState(initialProfile.aiSummary.industryInsights);
  const [topSkills, setTopSkills] = useState(initialProfile.aiSummary.topSkills);

  const technicalSkillsData = useMemo(() => aiTechnicalSkills.slice(0, 8), [aiTechnicalSkills]);
  const softSkillsData = useMemo(() => aiSoftSkills.slice(0, 8), [aiSoftSkills]);

  const averageTechnical = useMemo(() => {
    const total = technicalSkillsData.reduce((sum, item) => sum + item.value, 0);
    return technicalSkillsData.length ? Math.round(total / technicalSkillsData.length) : 0;
  }, [technicalSkillsData]);

  const averageSoft = useMemo(() => {
    const total = softSkillsData.reduce((sum, item) => sum + item.value, 0);
    return softSkillsData.length ? Math.round(total / softSkillsData.length) : 0;
  }, [softSkillsData]);

  const isUrlValid = (value: string) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const getCurrentProfile = (): UserProfile => ({
    links,
    technicalSkills: aiTechnicalSkills,
    softSkills: aiSoftSkills,
    jobRecommendations: jobs,
    aiSummary: {
      overview: aiSummary,
      strengths: aiStrengths,
      gaps: aiGaps,
      industryRelevanceScore,
      atsScore,
      atsFeedback,
      industryInsights,
      topSkills,
    },
    learningPath,
  });

  const resetAnalysis = () => {
    setExtractedSkills([]);
    setAiSummary(initialProfile.aiSummary.overview);
    setAiGaps(initialProfile.aiSummary.gaps);
    setAiStrengths(initialProfile.aiSummary.strengths);
    setAiTechnicalSkills(initialProfile.technicalSkills);
    setAiSoftSkills(initialProfile.softSkills);
    setJobs(initialProfile.jobRecommendations);
    setLearningPath(initialProfile.learningPath);
    setIndustryRelevanceScore(initialProfile.aiSummary.industryRelevanceScore);
    setAtsScore(initialProfile.aiSummary.atsScore);
    setAtsFeedback(initialProfile.aiSummary.atsFeedback);
    setAtsAvailable(false);
    setIndustryInsights(initialProfile.aiSummary.industryInsights);
    setTopSkills(initialProfile.aiSummary.topSkills);
    setHasCompletedAnalysis(false);
  };

  const updateLink = (field: keyof SocialLinks, value: string) => {
    setLinks((prev) => ({ ...prev, [field]: value }));
    void apiDelete('/api/session/analysis');
    resetAnalysis();
    setAnalysisMessage('Edit completed links, then click Analyze Profile to refresh recommendations.');
    if (!isUrlValid(value)) {
      setLinkErrors((prev) => ({ ...prev, [field]: 'Please enter a valid URL (https://...).' }));
    } else {
      setLinkErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleDownloadReport = async () => {
    if (!hasCompletedAnalysis) {
      setAnalysisError('Run profile analysis first, then download the generated PDF report.');
      setAnalysisMessage(null);
      return;
    }

    setDownloadingReport(true);
    setAnalysisError(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://next-gen-skillforge.divyanshakya.workers.dev';
      const response = await fetch(`${apiBase}/api/report/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: getCurrentProfile() }),
        credentials: 'include',
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || 'Failed to generate report PDF.');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      link.href = downloadUrl;
      link.download = `profile-analysis-report-${stamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setAnalysisMessage('PDF report downloaded successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to download the report PDF.';
      setAnalysisError(message);
      setAnalysisMessage(null);
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleResumeUpload = async (file: File) => {
    setUploadingResume(true);
    setAnalysisError(null);
    setAnalysisMessage('Importing resume and extracting text...');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = (await apiPostForm('/api/resume/import', formData)) as { resumeText?: string; fileName?: string; detectedSkills?: unknown };

      const parsedResumeText = typeof response?.resumeText === 'string' ? response.resumeText : '';
      const parsedFileName = typeof response?.fileName === 'string' ? response.fileName : file.name;
      const detectedSkills = Array.isArray(response?.detectedSkills) ? response.detectedSkills : [];

      setResumeText(parsedResumeText);
      setResumeFileName(parsedFileName);
      setAnalysisMessage(
        `Resume imported (${parsedFileName}). Detected ${detectedSkills.length} keyword signals. Click Analyze Profile to include ATS scoring.`,
      );
    } catch (error: any) {
      const responseData = error?.response?.data;
      const stringPayload = typeof responseData === 'string' ? responseData.trim() : '';
      const looksLikeHtml = /^<!doctype html>|^<html[\s>]/i.test(stringPayload);
      const apiError = typeof responseData?.error === 'string'
        ? responseData.error
        : looksLikeHtml
          ? 'Resume upload failed due to a server parsing error. Please try a .pdf, .docx, or .txt file.'
          : stringPayload.length > 0
            ? stringPayload
          : 'Failed to import resume. Please upload PDF, DOCX, or TXT.';
      setAnalysisError(apiError);
      setAnalysisMessage(null);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAnalyzeProfile = async () => {
    const hasLinks = Object.values(links).some((link) => link.trim());
    const hasResumeUpload = resumeText.trim().length > 0;

    if (!hasLinks && !hasResumeUpload) {
      setAnalysisError('Please provide at least one link or upload a resume.');
      setAnalysisMessage(null);
      return;
    }

    const invalidField = Object.entries(links).find(([, value]) => value.trim() && !isUrlValid(value));
    if (invalidField) {
      setAnalysisError(`Please enter a valid URL for ${invalidField[0]}.`);
      setAnalysisMessage(null);
      return;
    }

    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysisMessage('Fetching and parsing skills from provided links...');
    setExtractedSkills([]);

    try {
      const response = (await apiPost('/api/analyze-profile', {
        links,
        resumeText,
        resumeFileName,
      })) as { skills?: unknown[]; aiTechnicalSkills?: unknown[]; aiSoftSkills?: unknown[]; aiSummary?: string; aiGaps?: string[]; aiStrengths?: string[]; aiIndustryRelevanceScore?: number; aiAtsScore?: number; aiAtsFeedback?: string[]; aiAtsAvailable?: boolean; aiIndustryInsights?: string; aiTopSkills?: string[]; aiJobRecommendations?: unknown[]; aiLearningPath?: unknown[]; linkWarnings?: unknown[] };
      const skills = response.skills || [];
      const aiTech = (response.aiTechnicalSkills || []).map((s: any) => ({
        skill: s.name,
        value: Number(s.score || s.confidence * 100 || 0),
        fullMark: 100,
      }));
      const aiSoft = (response.aiSoftSkills || []).map((s: any) => ({
        skill: s.name,
        value: Number(s.score || s.confidence * 100 || 0),
        fullMark: 100,
      }));

      setExtractedSkills(skills as Skill[]);
      setAiSummary(response.aiSummary || '');
      setAiGaps(response.aiGaps || []);
      setAiStrengths(response.aiStrengths || []);
      setAiTechnicalSkills(aiTech);
      setAiSoftSkills(aiSoft);

      setIndustryRelevanceScore(response.aiIndustryRelevanceScore ?? 0);
      setAtsScore(response.aiAtsScore ?? 0);
      setAtsFeedback(response.aiAtsFeedback || []);
      setAtsAvailable(Boolean(response.aiAtsAvailable));
      setIndustryInsights(response.aiIndustryInsights || '');
      setTopSkills(response.aiTopSkills || []);
      setJobs(response.aiJobRecommendations as JobRecommendation[]);
      setLearningPath(response.aiLearningPath as LearningPathItem[]);
      setHasCompletedAnalysis(true);

      const linkWarnings = Array.isArray(response.linkWarnings) ? (response.linkWarnings as { source: string; reason?: string }[]) : [];

      const processedProfile: UserProfile = {
        links,
        technicalSkills: aiTech,
        softSkills: aiSoft,
        jobRecommendations: (response.aiJobRecommendations as JobRecommendation[]) || [],
        aiSummary: {
          overview: response.aiSummary || '',
          strengths: response.aiStrengths || [],
          gaps: response.aiGaps || [],
          industryRelevanceScore: response.aiIndustryRelevanceScore ?? 0,
          atsScore: response.aiAtsScore ?? 0,
          atsFeedback: response.aiAtsFeedback || [],
          industryInsights: response.aiIndustryInsights || '',
          topSkills: response.aiTopSkills || [],
        },
        learningPath: (response.aiLearningPath as LearningPathItem[]) || [],
      };

      try {
        await apiPost('/api/session/analysis', {
          analysis: {
            signature: JSON.stringify(links),
            profile: processedProfile,
          },
        });
      } catch {
        setAnalysisMessage((prev) => `${prev || ''} Saving to this browser session failed.`);
      }

      const warningSuffix = linkWarnings.length > 0
        ? ` Some links could not be directly verified (${linkWarnings.map((link: { source: string; reason?: string }) => `${link.source}${link.reason ? `: ${link.reason}` : ''}`).join(', ')}), but analysis continued.`
        : '';

      if (skills.length > 0 || aiTech.length > 0 || aiSoft.length > 0) {
        setAnalysisMessage(`AI analysis complete with ${skills.length} raw skills and ${aiTech.length + aiSoft.length} AI skills.${warningSuffix}`);
      } else {
        setAnalysisMessage(`AI analysis completed, but no skills were detected from the provided links.${warningSuffix}`);
      }
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.details) {
        const details = err.response.details as Array<{ source: string; url: string; reason: string }>;
        const errorList = details.map((d) => `${d.source}: ${d.reason}`).join('\n');
        setAnalysisError(`Link verification failed:\n\n${errorList}\n\nPlease check the links and try again.`);
      } else if (err.response?.data?.error) {
        setAnalysisError(err.response.error);
      } else {
        setAnalysisError('Failed to analyze profile. Please try again.');
      }
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadPreferences = async () => {
      try {
        const payload = (await apiGet('/api/session/preferences')) as {
          theme?: ThemeMode;
          links?: Partial<SocialLinks>;
        };

        if (ignore) {
          return;
        }

        if (payload.theme === 'dark' || payload.theme === 'light') {
          setTheme(payload.theme);
        }

        if (payload.links && Object.values(payload.links).some((link) => link.trim())) {
          setLinks((prev) => ({ ...prev, ...payload.links }));
        }

        const analysisPayload = (await apiGet('/api/session/analysis')) as {
          analysis?: { profile?: UserProfile } | null;
        };

        const savedProfile = analysisPayload.analysis?.profile;

        if (savedProfile) {
            setLinks(savedProfile.links);
            setExtractedSkills(
              savedProfile.technicalSkills.map((skill) => ({
                name: skill.skill,
                confidence: skill.value / 100,
                source: 'Saved Analysis',
              })),
            );
            setAiSummary(savedProfile.aiSummary.overview);
            setAiGaps(savedProfile.aiSummary.gaps);
            setAiStrengths(savedProfile.aiSummary.strengths);
            setAiTechnicalSkills(savedProfile.technicalSkills);
            setAiSoftSkills(savedProfile.softSkills);
            setIndustryRelevanceScore(savedProfile.aiSummary.industryRelevanceScore);
            setAtsScore(savedProfile.aiSummary.atsScore ?? 0);
            setAtsFeedback(savedProfile.aiSummary.atsFeedback ?? []);
            setAtsAvailable(Boolean((savedProfile.aiSummary.atsScore ?? 0) > 0 && (savedProfile.aiSummary.atsFeedback ?? []).length > 0));
            setIndustryInsights(savedProfile.aiSummary.industryInsights);
            setTopSkills(savedProfile.aiSummary.topSkills);
            setJobs(savedProfile.jobRecommendations);
            setLearningPath(savedProfile.learningPath);
            setHasCompletedAnalysis(true);
            setAnalysisMessage('Loaded saved analysis for this browser session.');
          }
        } catch {
        const savedTheme = window.localStorage.getItem('theme-mode');
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setTheme(savedTheme);
        } else {
          setTheme('light');
        }
      } finally {
        if (!ignore) {
          setPreferencesLoaded(true);
        }
      }
    };

    void loadPreferences();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('theme-mode', theme);
  }, [theme]);

  useEffect(() => {
    if (!preferencesLoaded) {
      return;
    }

    const requestController = new AbortController();
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://next-gen-skillforge.divyanshakya.workers.dev';
    const saveTimer = window.setTimeout(() => {
      void fetch(`${API_BASE_URL}/api/session/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, links }),
        signal: requestController.signal,
        credentials: 'include',
      }).catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        console.error('Failed to save preferences', error);
      });
    }, 250);

    return () => {
      window.clearTimeout(saveTimer);
      requestController.abort();
    };
  }, [theme, links, preferencesLoaded]);

  const handleThemeToggle = () => {
    if (theme === 'dark') {
      setThemeTransition('to-light');
      window.setTimeout(() => setTheme('light'), 260);
      window.setTimeout(() => setThemeTransition(null), 900);
      return;
    }

    setTheme('dark');
    setThemeTransition('to-dark');
    window.setTimeout(() => setThemeTransition(null), 1080);
  };

  return (
    <>
      <AnimatePresence>
        {themeTransition === 'to-light' && (
          <motion.div
            key="sun-expand"
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <motion.div
              className="absolute h-24 w-24 rounded-full bg-amber-200/35"
              initial={{ scale: 0.2 }}
              animate={{ scale: 25 }}
              transition={{ duration: 0.72, ease: 'easeInOut' }}
            />
            <motion.div
              className="rounded-full border border-amber-200/70 bg-amber-100/30 p-5"
              initial={{ opacity: 0.65, scale: 0.4 }}
              animate={{ opacity: 0.18, scale: 1.75 }}
              transition={{ duration: 0.66, ease: 'easeOut' }}
            >
              <svg className="h-12 w-12 text-amber-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {themeTransition === 'to-dark' && (
          <motion.div
            key="light-shrink"
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="h-[100vmax] w-[100vmax] rounded-full bg-amber-100/35"
              initial={{ scale: 1.4 }}
              animate={{ scale: 0 }}
              transition={{ duration: 0.52, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-8 lg:py-10">
        <Navbar onAnalyze={handleAnalyzeProfile} />

        {themeTransition === 'to-light' || themeTransition === 'to-dark' ? null : (
          <>
            <motion.section
              id="overview"
              initial="hidden"
              animate="visible"
              variants={animationVariant}
              transition={{ duration: 0.45 }}
              className="glass-panel relative overflow-hidden rounded-2xl p-6 sm:p-8"
            >
              <div className="pointer-events-none absolute -right-10 -top-8 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

              <div className="relative z-10 mb-4 inline-flex items-center gap-2 rounded-full chip px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700 bg-emerald-50">
                <svg className="h-3.5 w-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Portfolio Intelligence Dashboard
              </div>
              <h1 className="heading-gradient max-w-2xl text-3xl font-bold sm:text-4xl lg:text-5xl text-balance">
                Build your next role strategy with AI-driven skill insights.
              </h1>
              <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
                Connect your professional profiles, evaluate your skills, inspect targeted job recommendations,
                and get a learning path tailored to your experience and industry demand.
              </p>
            </motion.section>

            <LinkInputs
              links={links}
              onLinkChange={updateLink}
              linkErrors={linkErrors}
              resumeFileName={resumeFileName}
              uploadingResume={uploadingResume}
              onResumeFile={handleResumeUpload}
              analyzing={analyzing}
              onAnalyze={handleAnalyzeProfile}
              onDownloadReport={handleDownloadReport}
              downloadingReport={downloadingReport}
              hasCompletedAnalysis={hasCompletedAnalysis}
            />

            {analysisError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                {analysisError}
              </div>
            )}
            {!analysisError && analysisMessage && (
              <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 text-sm text-accent-foreground">
                {analysisMessage}
              </div>
            )}

            {extractedSkills.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={animationVariant}
                className="mt-6"
              >
                <SectionHeader title="AI-Extracted Skills" description="Raw signals detected from your profile links." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {extractedSkills.map((skill, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-background bg-card p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-foreground">{skill.name}</p>
                        <span className="text-xs font-semibold text-primary">{Math.round(skill.confidence * 100)}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">From: {skill.source}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.section
              id="skills"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={animationVariant}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="grid gap-6 lg:grid-cols-2"
            >
              <SkillRadar
                title="Technical Skill Graph"
                subtitle={`Average score ${averageTechnical}%`}
                data={technicalSkillsData}
                color="hsl(var(--primary))"
              />
              <SkillRadar
                title="Soft Skill Graph"
                subtitle={`Average score ${averageSoft}%`}
                data={softSkillsData}
                color="hsl(var(--accent))"
              />
            </motion.section>

            {hasCompletedAnalysis ? (
              <>
                <motion.section
                  id="overview-stats"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={animationVariant}
                  transition={{ duration: 0.45, delay: 0.1 }}
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <OverviewStats
                    industryRelevanceScore={industryRelevanceScore}
                    atsScore={atsScore}
                    atsAvailable={atsAvailable}
                    topSkills={topSkills}
                    technicalCount={aiTechnicalSkills.length}
                    softCount={aiSoftSkills.length}
                  />
                </motion.section>

                <motion.section
                  id="summary"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={animationVariant}
                  transition={{ duration: 0.45, delay: 0.14 }}
                  className="grid gap-6 lg:grid-cols-12"
                >
                  <AISummary
                    overview={aiSummary}
                    strengths={aiStrengths}
                    gaps={aiGaps}
                    industryRelevanceScore={industryRelevanceScore}
                    atsScore={atsScore}
                    atsFeedback={atsFeedback}
                    atsAvailable={atsAvailable}
                    industryInsights={industryInsights}
                    topSkills={topSkills}
                  />
                </motion.section>

                <motion.section
                  id="jobs"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={animationVariant}
                  transition={{ duration: 0.45, delay: 0.18 }}
                >
                  <SectionHeader
                    title="Job & Internship Opportunities"
                    description={`${jobs.length} opportunities matched to your profile.`}
                  />
                  <JobList jobs={jobs} />
                </motion.section>

                <motion.section
                  id="learning"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={animationVariant}
                  transition={{ duration: 0.45, delay: 0.22 }}
                  className="glass-panel rounded-2xl p-6 sm:p-8"
                >
                  <SectionHeader
                    title="AI Learning Path"
                    description="A tailored roadmap to close your skill gaps."
                  />
                  <LearningPath path={learningPath} />
                </motion.section>
              </>
            ) : (
              <motion.section
                initial="hidden"
                animate="visible"
                variants={animationVariant}
                className="grid gap-6 lg:grid-cols-2"
              >
                <EmptyState
                  title="No analysis yet"
                  description="Add your profile links or upload a resume, then click Analyze Profile to generate skill graphs, job matches, and a learning path."
                />
                <EmptyState
                  title="What you'll get"
                  description={
                    <>
                      <ul className="text-left text-sm text-muted-foreground space-y-3">
                        <li>• Technical &amp; soft skill scoring with radar visualizations</li>
                        <li>• Industry relevance score and ATS resume feedback</li>
                        <li>• Matched job &amp; internship recommendations</li>
                        <li>• Prioritized learning path with free and paid resources</li>
                      </ul>
                    </>
                  }
                />
              </motion.section>
            )}
          </>
        )}
      </main>
    </>
  );
}
