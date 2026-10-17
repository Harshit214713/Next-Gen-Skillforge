import * as React from 'react';
import { cn } from '@/lib/utils';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, required, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    >
      {required && <span className="ml-1 text-destructive">*</span>}
    </label>
  );
}

interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <hr
      className={cn(
        'border-border mx-auto flex shrink-0 [&>hr]:shrink-0',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className,
      )}
      aria-orientation={orientation}
      aria-hidden={decorative}
      {...props}
    />
  );
}
