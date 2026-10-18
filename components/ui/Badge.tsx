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
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide transition-colors',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

