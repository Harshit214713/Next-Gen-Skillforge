'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({
  className,
  height,
  width,
  variant = 'rectangular',
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        variant === 'circular' && 'rounded-full',
        height && `h-[${typeof height === 'number' ? height + 'px' : height}]`,
        width && `w-[${typeof width === 'number' ? width + 'px' : width}]`,
        className,
      )}
    />
  );
}

interface SkeletonTextProps {
  className?: string;
  lines?: number;
}

export function SkeletonText({ className, lines = 3 }: SkeletonTextProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={i === lines - 1 ? 'w-1/2' : 'w-full'}
          variant="text"
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-muted p-6 animate-pulse',
        className,
      )}
    >
      <SkeletonText lines={2} />
      <Skeleton className="h-4 w-3/4 mt-4" />
      <div className="grid gap-4 mt-6 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}
