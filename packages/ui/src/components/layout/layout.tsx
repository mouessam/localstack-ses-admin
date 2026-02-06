import React from 'react';
import { Sidebar } from '@ses-admin/ui/components/layout/sidebar';
import { cn } from '@ses-admin/ui/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  className?: string;
}

export const Layout = ({ children, currentPath, onNavigate, className }: LayoutProps) => {
  return (
    <div className={cn('flex h-screen overflow-hidden', className)}>
      <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
      <main className="flex-1 overflow-hidden bg-background">{children}</main>
    </div>
  );
};
