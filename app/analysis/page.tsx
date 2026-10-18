'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/toast';
import {
  apiGet,
  apiPost,
  apiDelete,
} from '@/lib/api-client';
import type { UserProfile, JobRecommendation, SkillData, LearningPathItem } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressWithLabel } from '@/components/ui/progress';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import {
  Sparkles,
  TrendingUp,
  FileText,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Play,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

export default function AnalysisPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    try {
      const data = (await apiGet('/api/session/analysis')) as {
        analysis?: { profile?: UserProfile } | null;
      };
      setProfile(data.analysis?.profile ?? null);
      setError(null);
    } catch {
      setProfile(null);
      setError('Unable to load analysis. Run analysis first.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAnalysis();
      toast({
        title: 'Analysis refreshed',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Refresh failed',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiDelete('/api/session/analysis');
      setProfile(null);
      toast({
        title: 'Analysis cleared',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Clear failed',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadReport = async () => {
    if (!profile) return;
    try {
      const response = await fetch('/api/report/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
        credentials: 'include',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error((payload as { error?: string })?.error || 'Failed to generate report.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `profile-analysis-report-${stamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Report downloaded',
        variant: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Download failed',
        description: err.message || 'Could not generate PDF report.',
        variant: 'destructive',
      });
    }
  };

  const technicalSkills = (profile?.technicalSkills ?? []).slice(0, 8) as SkillData[];
  const softSkills = (profile?.softSkills ?? []).slice(0, 8) as SkillData[];
  const jobs = (profile?.jobRecommendations ?? []) as JobRecommendation[];
  const learningPath = (profile?.learningPath ?? []) as LearningPathItem[];

  const avgTechnical = technicalSkills.length
    ? Math.round(technicalSkills.reduce((s, i) => s + i.value, 0) / technicalSkills.length)
    : 0;
  const avgSoft = softSkills.length
    ? Math.round(softSkills.reduce((s, i) => s + i.value, 0) / softSkills.length)
    : 0;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-bold text-lg mb-2">{error}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Add your profile links and run analysis to get started.
            </p>
            <Link
              href="/profile"
              className="inline-flex h-10 items-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary-hover transition-colors px-4"
            >
              Go to Profile
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Play className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-bold text-lg mb-2">No analysis yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Set up your profile first, then run AI analysis to see your skill graphs,
              job matches, and learning path.
            </p>
            <Link
              href="/profile"
              className="inline-flex h-10 items-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary-hover transition-colors px-4"
            >
              Set up Profile
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analysis</h1>
          <p className="text-muted-foreground">
            Your AI-powered skills profile and career insights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={refreshing ? 'animate-spin' : ''} h-4 w-4 />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            onClick={handleDownloadReport}
            variant="outline"
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Industry Relevance</p>
                <p className="text-3xl font-bold">{profile.aiSummary.industryRelevanceScore}%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">ATS Score</p>
                <p className="text-3xl font-bold">{profile.aiSummary.atsScore}%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Technical Skills</p>
                <p className="text-3xl font-bold">{technicalSkills.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground">
                <Play className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Job Matches</p>
                <p className="text-3xl font-bold">{jobs.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <BriefcaseIcon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-heading font-bold text-lg">AI Summary</h2>
            </div>
            <p className="text-sm leading-relaxed text-foreground mb-6">
              {profile.aiSummary.overview || 'No summary available.'}
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-accent-foreground" />
                  <h4 className="font-medium">Strengths</h4>
                </div>
                <ul className="space-y-2">
                  {profile.aiSummary.strengths.length > 0 ? (
                    profile.aiSummary.strengths.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 rounded-lg bg-accent/10 px-3 py-2">
                        <span className="shrink-0 h-1 w-1 rounded-full bg-accent mt-1.5"></span>
                        <p className="text-sm text-foreground">{item}</p>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No strengths identified yet.</p>
                  )}
                </ul>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-amber-600" />
                  <h4 className="font-medium">Growth Gaps</h4>
                </div>
                <ul className="space-y-2">
                  {profile.aiSummary.gaps.length > 0 ? (
                    profile.aiSummary.gaps.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2">
                        <span className="shrink-0 h-1 w-1 rounded-full bg-amber-600 mt-1.5"></span>
                        <p className="text-sm text-foreground">{item}</p>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No growth gaps identified yet.</p>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <ProgressWithLabel
                value={profile.aiSummary.industryRelevanceScore}
                label="Industry Relevance"
              />
              <ProgressWithLabel
                value={profile.aiSummary.atsScore}
                label="Resume ATS Score"
                color="accent"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Play className="h-5 w-5 text-primary" />
              <h2 className="font-heading font-bold text-lg">Skill Scores</h2>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Technical Skills</span>
                  <span className="text-sm font-semibold text-foreground">{avgTechnical}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-background overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${avgTechnical}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Soft Skills</span>
                  <span className="text-sm font-semibold text-foreground">{avgSoft}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-background overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${avgSoft}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-medium text-sm mb-3">Top Skills</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  ...profile.aiSummary.topSkills.slice(0, 6),
                ].map((skill) => (
                  <Badge key={skill} variant="default" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-bold text-lg">Technical Skills</h2>
                <Badge variant="default" className="text-xs">
                  {technicalSkills.length} skills
                </Badge>
              </div>
              {technicalSkills.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No technical skills detected.</p>
              ) : (
                <div className="space-y-3">
                  {technicalSkills.map((skill) => {
                    const pct = Math.round((skill.value / skill.fullMark) * 100);
                    return (
                      <div key={skill.skill} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{skill.skill}</span>
                          <span className="text-xs font-semibold">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-background overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-bold text-lg">Soft Skills</h2>
                <Badge variant="default" className="text-xs">
                  {softSkills.length} skills
                </Badge>
              </div>
              {softSkills.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No soft skills detected.</p>
              ) : (
                <div className="space-y-3">
                  {softSkills.map((skill) => {
                    const pct = Math.round((skill.value / skill.fullMark) * 100);
                    return (
                      <div key={skill.skill} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{skill.skill}</span>
                          <span className="text-xs font-semibold">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-background overflow-hidden">
                          <div
                            className="h-full rounded-full bg-accent transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <BriefcaseIcon className="h-5 w-5 text-primary" />
                <h2 className="font-heading font-bold text-lg">Job Recommendations</h2>
              </div>
              {jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No job recommendations yet.</p>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="flex items-start gap-3 p-3 rounded-lg border border-background hover:border-primary/50 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-heading font-bold text-sm group-hover:text-primary transition-colors">
                            {job.title}
                          </h4>
                          <Badge variant="success" className="text-[10px] px-2 py-1">
                            {job.matchPercentage}% match
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {job.company} · {job.location} · {job.type}
                        </p>
                        <p className="text-xs text-foreground line-clamp-2 mb-3">
                          {job.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {job.skills.slice(0, 4).map((skill) => (
                            <span key={skill} className="rounded-md border border-background bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                              {skill}
                            </span>
                          ))}
                        </div>
                        {job.applyUrl && job.applyUrl !== '#' && (
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-primary underline"
                          >
                            Apply → <ExternalLink className="h-3 w-3 inline ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="font-heading font-bold text-lg">Learning Path</h2>
              </div>
              {learningPath.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No learning path yet.</p>
              ) : (
                <div className="space-y-3">
                  {learningPath.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-background hover:border-primary/50 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-heading font-bold text-sm group-hover:text-primary transition-colors">
                            {item.topic}
                          </h4>
                          <Badge
                            variant="default"
                            className={`text-[10px] px-2 py-1 ${
                              item.priority === 'high'
                                ? 'text-destructive bg-destructive/10'
                                : item.priority === 'medium'
                                ? 'text-amber-700 bg-amber-50'
                                : 'text-accent-foreground bg-accent/10'
                            }`}
                          >
                            {item.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {item.explanation}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.resources.slice(0, 2).map((resource) => (
                            <a
                              key={resource.title}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-primary underline truncate"
                            >
                              {resource.title}
                            </a>
                          ))}
                          {item.resources.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{item.resources.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/learning"
                className="mt-4 block text-sm font-medium text-primary underline"
              >
                View full learning path →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7.414a1 1 0 00-.707.293L4.414 8.236A1 1 0 004 9.414V19a2 2 0 002 2z"></path>
    </svg>
  );
}