
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Dashboard } from '@/components/Dashboard';
import { EventsManager } from '@/components/EventsManager';
import { ContactsManager } from '@/components/ContactsManager';
import { CellsManager } from '@/components/CellsManager';
import { Pipeline } from '@/components/Pipeline';
import { Settings } from '@/components/Settings';
import { UsersManager } from '@/components/UsersManager';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Index = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');

  // Mapear as rotas para as seções
  const pathToSection: {
    [key: string]: string;
  } = {
    '/': 'dashboard',
    '/contacts': 'contacts',
    '/cells': 'cells',
    '/pipeline': 'pipeline',
    '/events': 'events',
    '/settings': 'settings',
    '/users': 'users'
  };

  // Atualizar a seção ativa baseada na URL
  useEffect(() => {
    const section = pathToSection[location.pathname] || 'dashboard';
    setActiveSection(section);
    console.log('Seção ativa:', section, 'URL atual:', location.pathname);
  }, [location.pathname]);

  const renderContent = () => {
    console.log('Renderizando conteúdo para seção:', activeSection);
    switch (activeSection) {
      case 'dashboard':
        return (
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        );
      case 'events':
        return (
          <ErrorBoundary>
            <EventsManager />
          </ErrorBoundary>
        );
      case 'contacts':
        return (
          <ErrorBoundary>
            <ContactsManager />
          </ErrorBoundary>
        );
      case 'cells':
        return (
          <ErrorBoundary>
            <CellsManager />
          </ErrorBoundary>
        );
      case 'pipeline':
        return (
          <ErrorBoundary>
            <Pipeline />
          </ErrorBoundary>
        );
      case 'settings':
        return (
          <ErrorBoundary>
            <Settings />
          </ErrorBoundary>
        );
      case 'users':
        return (
          <ErrorBoundary>
            <UsersManager />
          </ErrorBoundary>
        );
      default:
        console.log('Seção não encontrada, retornando Dashboard');
        return (
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
