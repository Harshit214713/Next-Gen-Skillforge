'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'accent' | 'destructive';
}

const sizes = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

const colors = {
  primary: 'bg-primary',
  accent: 'bg-accent',
  destructive: 'bg-destructive',
};

export function Progress({
  value,
  className,
  size = 'md',
  color = 'primary',
  ...props
}: ProgressProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 w-full',
        className,
      )}
      {...props}
    >
      <div className={cn('overflow-hidden rounded-full border', sizes[size])}>
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            colors[color],
          )}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

interface ProgressWithLabelProps {
  value: number;
  label: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'accent' | 'destructive';
  showValue?: boolean;
}

export function ProgressWithLabel({
  value,
  label,
  className,
  size = 'md',
  color = 'primary',
  showValue = true,
}: ProgressWithLabelProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between mb-1 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        {showValue && <span className="font-semibold text-foreground">{Math.round(value)}%</span>}
      </div>
      <Progress value={value} size={size} color={color} />
    </div>
  );
}
