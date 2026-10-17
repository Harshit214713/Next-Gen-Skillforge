'use client';

import { Sparkles, TrendingUp, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Stat } from '@/components/ui/Badge';

interface AISummaryProps {
  overview: string;
  strengths: string[];
  gaps: string[];
  industryRelevanceScore: number;
  atsScore: number;
  atsFeedback: string[];
  atsAvailable: boolean;
  industryInsights: string;
  topSkills: string[];
}

export function AISummary({
  overview,
  strengths,
  gaps,
  industryRelevanceScore,
  atsScore,
  atsFeedback,
  atsAvailable,
  industryInsights,
  topSkills,
}: AISummaryProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <Card className="col-span-3 lg:col-span-3">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-bold text-lg">AI Summary</h3>
          </div>
          <p className="text-sm leading-relaxed mb-6 text-foreground">
            {overview || 'No summary available.'}
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-accent-foreground" />
                <h4 className="font-medium">Strengths</h4>
              </div>
              <ul className="space-y-2">
                {strengths.length > 0 ? (
                  strengths.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-lg bg-accent/10 px-3 py-2">
                      <span className="shrink-0 h-1 w-1 rounded-full bg-accent mt-1.5"></span>
                      <p className="text-sm text-foreground">{item}</p>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No strengths identified yet.
                  </p>
                )}
              </ul>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h4 className="font-medium">Growth Gaps</h4>
              </div>
              <ul className="space-y-2">
                {gaps.length > 0 ? (
                  gaps.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
                      <span className="shrink-0 h-1 w-1 rounded-full bg-amber-600 dark:bg-amber-400 mt-1.5"></span>
                      <p className="text-sm text-foreground">{item}</p>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No growth gaps identified yet.
                  </p>
                )}
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card className="col-span-1 lg:col-span-1">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
              <FileText className="h-4 w-4 text-secondary-foreground" />
            </div>
            <h3 className="font-heading font-bold text-lg">Industry Relevance</h3>
          </div>
          <div className="mb-6">
            <div className="text-4xl font-bold text-foreground">{industryRelevanceScore}%</div>
            <div className="mt-2 h-2 w-full rounded-full bg-background overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${industryRelevanceScore}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              How well your profile matches current industry demand.
            </p>
          </div>

          {atsAvailable ? (
            <div className="mb-6 rounded-lg border border-background p-4">
              <h4 className="font-medium text-sm mb-2">Resume ATS Score</h4>
              <div className="text-3xl font-bold">{atsScore}%</div>
              <div className="mt-2 h-2 w-full rounded-full bg-background overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${atsScore}%` }}
                ></div>
              </div>
              {atsFeedback.slice(0, 3).map((item, i) => (
                <p key={i} className="mt-2 text-xs text-muted-foreground">
                  • {item}
                </p>
              ))}
            </div>
          ) : (
            <div className="mb-6 rounded-lg border border-background p-4">
              <h4 className="font-medium text-sm mb-2">Resume ATS Score</h4>
              <p className="text-xs text-muted-foreground">
                Upload a resume and run analysis to generate ATS scoring.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="font-medium text-sm">Industry Insights</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {industryInsights || 'Waiting for profile analysis.'}
            </p>
          </div>

          <div className="mt-6">
            <p className="font-medium text-sm mb-2">Top Skills</p>
            <div className="flex flex-wrap gap-2">
              {topSkills.map((skill) => (
                <Badge key={skill} variant="default" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
