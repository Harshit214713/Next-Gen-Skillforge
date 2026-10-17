import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
}

const badgeVariants = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-accent text-accent-foreground',
  warning: 'bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-400',
  destructive: 'bg-destructive text-destructive-foreground',
  outline: 'border border-input bg-transparent',
};

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-tighter transition-colors',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

interface StatProps {
  value: React.ReactNode;
  label: string;
  trend?: string;
  trendPositive?: boolean;
}

export function Stat({ value, label, trend, trendPositive }: StatProps) {
  return (
    <div className="flex flex-col">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {trend && (
        <div className={`mt-1 text-xs font-medium ${trendPositive ? 'text-accent-foreground' : 'text-destructive'}`}>
          {trend}
        </div>
      )}
    </div>
  );
}
