import React, { useEffect, useState } from 'react';
import { Button } from '@ses-admin/ui/components/ui/button';
import { Switch } from '@ses-admin/ui/components/ui/switch';
import { cn } from '@ses-admin/ui/lib/utils';
import { VERSION } from '@ses-admin/ui/version';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  className?: string;
}

const navItems = [
  { label: 'Identities', path: '/identities' },
  { label: 'Inbox', path: '/messages' },
  { label: 'Send Email', path: '/send' },
  { label: 'Raw & Attachments', path: '/attachments' },
];

export const Sidebar = ({ currentPath, onNavigate, className }: SidebarProps) => {
  // Initialize with actual current theme (not just false)
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync with document theme changes (e.g., from app.tsx initialization)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
      setIsDark(isDarkTheme);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = (checked: boolean) => {
    const next = checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.classList.toggle('dark', checked);
    localStorage.setItem('theme', next);
    setIsDark(checked);
  };

  return (
    <aside
      className={cn(
        'flex flex-col w-64 bg-panel text-text-primary',
        'border-r border-border-subtle',
        className,
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-border-subtle">
        <h1 className="text-xl font-bold">SES Viewr</h1>
        <p className="text-sm text-text-secondary">LocalStack Email Console</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant={currentPath === item.path ? 'secondary' : 'ghost'}
            className={cn('w-full justify-start', currentPath === item.path && 'bg-primary-subtle')}
            onClick={() => onNavigate(item.path)}
          >
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Footer with theme toggle */}
      <div className="p-4 border-t border-border-subtle">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Dark Mode</span>
          <Switch checked={isDark} onChange={(e) => toggleTheme(e.target.checked)} />
        </div>
        <p className="text-xs text-text-tertiary">
          ui v{VERSION.ui} <span className="text-text-quaternary">|</span> server v{VERSION.server}
        </p>
      </div>
    </aside>
  );
};
