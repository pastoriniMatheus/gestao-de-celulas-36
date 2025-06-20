import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { EventsManager } from '@/components/EventsManager';
import { ContactsManager } from '@/components/ContactsManager';
import { CellsManager } from '@/components/CellsManager';
import { MessagingCenter } from '@/components/MessagingCenter';
import { Pipeline } from '@/components/Pipeline';
import { Settings } from '@/components/Settings';
import { UsersManager } from '@/components/UsersManager';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AuthProvider } from '@/components/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserMenu } from '@/components/UserMenu';
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
    '/messaging': 'messaging',
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
      case 'messaging':
        return <MessagingCenter />;
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
  return <AuthProvider>
      <ProtectedRoute>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-indigo-100">
            <Sidebar />
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">
                
                {renderContent()}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </ProtectedRoute>
    </AuthProvider>;
};
export default Index;