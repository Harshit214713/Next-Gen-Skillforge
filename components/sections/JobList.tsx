'use client';

import { ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { JobRecommendation } from '@/lib/types';

interface JobListProps {
  jobs: JobRecommendation[];
}

export function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <Card>
        <div className="p-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-background text-center">
          <p className="text-sm text-muted-foreground">
            No job recommendations yet. Run profile analysis to see targeted opportunities.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <article
              key={job.id}
              className="group rounded-xl border border-background p-5 hover:border-primary/50 transition-colors"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-base group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {job.company} · {job.location}
                  </p>
                </div>
                <Badge
                  variant="success"
                  className="text-xs px-2 py-1"
                >
                  {job.matchPercentage}% match
                </Badge>
              </div>
              <p className="mb-3 text-sm text-foreground line-clamp-2">
                {job.description}
              </p>
              {job.fitReason && (
                <p className="mb-3 text-xs text-muted-foreground">
                  {job.fitReason}
                </p>
              )}
              <div className="mb-4 flex flex-wrap gap-1.5">
                {job.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md border border-background bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-background pt-3">
                <span className="text-xs font-medium text-foreground">
                  {job.salary}
                </span>
                <span className="text-xs text-muted-foreground">{job.type}</span>
                {job.applyUrl && job.applyUrl !== '#' && (
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                  >
                    Apply
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </Card>
  );
}
