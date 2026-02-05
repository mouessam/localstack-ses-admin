import React, { useEffect, useState } from 'react';
import { Layout } from './components/layout/layout';
import { IdentitiesPage } from './features/identities/identities-page';
import { SendPage } from './features/send/send-page';
import { RawPage } from './features/raw/raw-page';
import { MessagesPage } from './features/messages/messages-page';

export const App = () => {
  const [path, setPath] = usePath();

  // Theme Initialization
  useEffect(() => {
    const stored = window.localStorage.getItem('theme');
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = stored || system;
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  const navigate = (to: string) => {
    if (window.location.pathname === to) return;
    window.history.pushState({}, '', to);
    setPath(to);
  };

  const renderContent = () => {
    switch (path) {
      case '/identities':
      case '/':
        return <IdentitiesPage />;
      case '/messages':
        return <MessagesPage />;
      case '/send':
        return <SendPage />;
      case '/attachments':
        return <RawPage />;
      default:
        // Redirect to identities if unknown
        if (path !== '/identities') {
            window.history.replaceState({}, '', '/identities');
            setPath('/identities');
        }
        return <IdentitiesPage />;
    }
  };

  return (
    <div id="app">
      <Layout currentPath={path === '/' ? '/identities' : path} onNavigate={navigate}>
        {renderContent()}
      </Layout>
    </div>
  );
};

const usePath = (): [string, React.Dispatch<React.SetStateAction<string>>] => {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return [path, setPath];
};