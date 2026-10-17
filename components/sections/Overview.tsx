'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';

interface EmptyStateProps {
  title: string;
  description: string | React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <div className="p-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-background text-center">
        <h3 className="font-heading font-bold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          {description}
        </p>
        {action && <div>{action}</div>}
      </div>
    </Card>
  );
}

interface OverviewProps {
  industryRelevanceScore: number;
  atsScore: number;
  atsAvailable: boolean;
  topSkills: string[];
  technicalCount: number;
  softCount: number;
}

export function OverviewStats({
  industryRelevanceScore,
  atsScore,
  atsAvailable,
  topSkills,
  technicalCount,
  softCount,
}: OverviewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <div className="p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Industry Relevance</p>
          <div className="text-3xl font-bold">{industryRelevanceScore}%</div>
        </div>
      </Card>
      <Card>
        <div className="p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">ATS Score</p>
          <div className="text-3xl font-bold">{atsAvailable ? `${atsScore}%` : '—'}</div>
          {atsAvailable ? (
            <p className="text-xs text-muted-foreground">Resume analyzed</p>
          ) : (
            <p className="text-xs text-muted-foreground">Upload a resume</p>
          )}
        </div>
      </Card>
      <Card>
        <div className="p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Technical Skills</p>
          <div className="text-3xl font-bold">{technicalCount}</div>
        </div>
      </Card>
      <Card>
        <div className="p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Soft Skills</p>
          <div className="text-3xl font-bold">{softCount}</div>
        </div>
      </Card>
    </div>
  );
}
