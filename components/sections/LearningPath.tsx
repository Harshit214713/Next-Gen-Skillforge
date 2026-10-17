'use client';

import { BookOpen, Play, FileText, Monitor } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { LearningPathItem } from '@/lib/types';

const RESOURCE_ICONS: Record<string, React.ReactNode> = {
  course: <Play className="h-4 w-4" />,
  book: <BookOpen className="h-4 w-4" />,
  video: <Monitor className="h-4 w-4" />,
  documentation: <FileText className="h-4 w-4" />,
};

interface Resource {
  type: string;
  title: string;
  provider?: string;
  url: string;
  free: boolean;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high: { label: 'High', color: 'text-destructive bg-destructive/10' },
  medium: { label: 'Medium', color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' },
  low: { label: 'Low', color: 'text-accent-foreground bg-accent/10' },
};

interface LearningPathProps {
  path: LearningPathItem[];
}

export function LearningPath({ path }: LearningPathProps) {
  if (path.length === 0) {
    return (
      <Card>
        <div className="p-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-background text-center">
          <p className="text-sm text-muted-foreground">
            No learning path yet. Run profile analysis to get a tailored roadmap.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-heading font-bold text-lg">AI Learning Path</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {path.map((item) => {
            const config = PRIORITY_CONFIG[item.priority];
            return (
              <article key={item.id} className="group rounded-xl border border-background p-5 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-heading font-bold text-base group-hover:text-primary transition-colors">
                    {item.topic}
                  </h4>
                  <Badge
                    variant="default"
                    className={`text-xs px-2 py-1 ${config.color}`}
                  >
                    {config.label}
                  </Badge>
                </div>
                <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
                  {item.explanation}
                </p>
                <div className="mb-4 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {item.timeEstimate}
                  </span>
                </div>
                <div className="space-y-2">
                  {item.resources.map((resource, i) => (
                    <a
                      key={i}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 rounded-lg border border-background bg-background/50 px-3 py-2 text-sm transition-colors hover:border-primary/50 hover:bg-primary/5 group-hover:text-primary"
                    >
                      <span className="flex items-center gap-1.5 truncate min-w-0">
                        {RESOURCE_ICONS[resource.type] || <FileText className="h-3.5 w-3.5" />}
                        {resource.title}
                        {resource.provider && ` · ${resource.provider}`}
                      </span>
                      <span className="shrink-0 text-[10px] font-semibold uppercase opacity-70">
                        {resource.free ? 'Free' : 'Paid'}
                      </span>
                    </a>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Card>
  );
}