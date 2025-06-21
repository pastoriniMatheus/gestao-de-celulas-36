
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Dashboard } from '@/components/Dashboard';
import { EventsManager } from '@/components/EventsManager';
import { ContactsManager } from '@/components/ContactsManager';
import { CellsManager } from '@/components/CellsManager';
import { Pipeline } from '@/components/Pipeline';
import { Settings } from '@/components/Settings';
import { UsersManager } from '@/components/UsersManager';
import { AuthProvider } from '@/components/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

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
        return <Dashboard />;
      case 'events':
        return <EventsManager />;
      case 'contacts':
        return <ContactsManager />;
      case 'cells':
        return <CellsManager />;
      case 'pipeline':
        return <Pipeline />;
      case 'settings':
        return <Settings />;
      case 'users':
        return <UsersManager />;
      default:
        console.log('Seção não encontrada, retornando Dashboard');
        return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <ProtectedRoute>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <SidebarInset className="flex flex-1 flex-col">
              <Header />
              <main className="flex-1 p-6 overflow-auto">
                <div className="max-w-7xl mx-auto">
                  {renderContent()}
                </div>
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default Index;
