'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/toast';
import type { UserProfile } from '@/lib/types';
import { apiGet } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  FileText,
  Download,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

export default function ReportPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchAnalysis = useCallback(async () => {
    try {
      const data = (await apiGet('/api/session/analysis')) as {
        analysis?: { profile?: UserProfile } | null;
      };
      setProfile(data.analysis?.profile ?? null);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const handleDownloadReport = async () => {
    if (!profile) return;
    setGenerating(true);
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
      link.download = `skillforge-report-${stamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Report downloaded',
        description: 'Your PDF report has been saved.',
        variant: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Download failed',
        description: err.message || 'Could not generate PDF report.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Skeleton className="h-4 w-1/2" />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-secondary/50 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-2">No analysis data</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Run profile analysis first to generate a downloadable report.
            </p>
            <Link
              href="/analysis"
              className="inline-flex h-10 items-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary-hover transition-colors px-4"
            >
              Go to Analysis
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasJobs = profile.jobRecommendations.length > 0;
  const hasLearningPath = profile.learningPath.length > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Download Report</h1>
        <p className="text-muted-foreground">
          Generate a professional PDF report of your profile analysis.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-heading font-bold text-lg">Report Contents</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Profile Overview</h4>
                <p className="text-xs text-muted-foreground">
                  Industry relevance score, ATS score, and AI summary.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Technical & Soft Skills</h4>
                <p className="text-xs text-muted-foreground">
                  Skill breakdown with scores and progress bars.
                </p>
              </div>
            </div>
            {hasJobs && (
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">Job Recommendations</h4>
                  <p className="text-xs text-muted-foreground">
                    {profile.jobRecommendations.length} matched opportunities.
                  </p>
                </div>
              </div>
            )}
            {hasLearningPath && (
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">Learning Path</h4>
                  <p className="text-xs text-muted-foreground">
                    {profile.learningPath.length} prioritized learning steps.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <div>
              <p className="text-xs text-muted-foreground">Report format</p>
              <p className="text-sm font-medium text-foreground">PDF</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Download PDF Report</p>
            <p className="text-xs text-muted-foreground">
              Share with employers or keep for your records.
            </p>
          </div>
        </div>
        <Button
          onClick={handleDownloadReport}
          disabled={generating || !profile}
          size="lg"
          className="w-full sm:w-auto"
        >
          {generating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </>
          )}
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Industry Relevance</p>
            <p className="text-3xl font-bold">{profile.aiSummary.industryRelevanceScore}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">ATS Score</p>
            <p className="text-3xl font-bold">{profile.aiSummary.atsScore}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Job Matches</p>
            <p className="text-3xl font-bold">{profile.jobRecommendations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Learning Steps</p>
            <p className="text-3xl font-bold">{profile.learningPath.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}