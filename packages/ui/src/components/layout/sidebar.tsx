import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { cn } from '../../lib/utils';

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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    setIsDark(isDarkTheme);
  }, []);

  const toggleTheme = (checked: boolean) => {
    const next = checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.classList.toggle('dark', checked);
    localStorage.setItem('theme', next);
    setIsDark(checked);
  };

  return (
    <aside className={cn(
      'flex flex-col w-64 bg-panel text-text-primary',
      'border-r border-border-subtle',
      className
    )}>
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
            className={cn(
              'w-full justify-start',
              currentPath === item.path && 'bg-primary-subtle'
            )}
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
          <Switch
            checked={isDark}
            onChange={(e) => toggleTheme(e.target.checked)}
          />
        </div>
        <p className="text-xs text-text-tertiary">v1.0.0</p>
      </div>
    </aside>
  );
};
