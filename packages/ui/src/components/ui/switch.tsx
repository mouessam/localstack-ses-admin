import React from 'react';
import { cn } from '@ses-admin/ui/lib/utils';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, ...props }, ref) => (
    <label className={cn('inline-flex items-center gap-2 cursor-pointer', className)}>
      {label && <span className="text-sm text-text-secondary">{label}</span>}
      <div className="relative">
        <input type="checkbox" ref={ref} className="sr-only peer" {...props} />
        <div
          className={cn(
            'w-11 h-6 bg-border-subtle rounded-full peer',
            'peer-checked:bg-primary',
            'transition-colors duration-200 ease-in-out',
            "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
            'after:bg-white after:rounded-full after:h-5 after:w-5',
            'after:transition-transform after:duration-200 after:ease-in-out',
            'peer-checked:after:translate-x-5',
          )}
        />
      </div>
    </label>
  ),
);
Switch.displayName = 'Switch';
