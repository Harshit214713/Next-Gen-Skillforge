import * as React from 'react';

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatCard({ value, label, trend, trendPositive }: { value: React.ReactNode; label: string; trend?: string; trendPositive?: boolean }) {
  return (
    <div className="rounded-xl border border-background p-5">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
      {trend && (
        <div className={`mt-2 text-xs font-medium ${trendPositive ? 'text-accent-foreground' : 'text-destructive'}`}>
          {trend}
        </div>
      )}
    </div>
  );
}
