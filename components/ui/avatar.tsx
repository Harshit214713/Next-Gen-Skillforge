'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  xl: 'h-12 w-12',
};

export function Avatar({
  src,
  alt,
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        'rounded-full object-cover',
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
