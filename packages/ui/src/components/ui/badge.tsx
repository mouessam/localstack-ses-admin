import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const variantStyles: Record<string, string> = {
  default: 'bg-primary text-text-inverse hover:bg-primary-hover',
  secondary: 'bg-primary-subtle text-primary hover:bg-primary/20',
  destructive: 'bg-danger text-text-inverse hover:bg-danger-hover',
  outline: 'border border-border-subtle text-text-primary',
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
