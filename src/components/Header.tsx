
import { Bell, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from './AuthProvider';
import { UserMenu } from './UserMenu';
import { BirthdayNotifications } from './BirthdayNotifications';
import { useSystemConfig } from '@/hooks/useSystemConfig';

export const Header = () => {
  const { user, userProfile, signOut } = useAuth();
  const { config, loading: configLoading } = useSystemConfig();

  const handleLogout = async () => {
    await signOut();
  };

  // Usar configurações do sistema para o logo
  const logoUrl = config.site_logo?.url;
  const logoAlt = config.site_logo?.alt || 'Logo';
  const churchName = config.church_name?.text || config.form_title?.text || 'Sistema de Células';

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {configLoading ? (
            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          ) : logoUrl ? (
            <img 
              src={logoUrl} 
              alt={logoAlt}
              className="w-12 h-12 object-contain rounded-lg border border-gray-200"
              onError={(e) => {
                console.error('Erro ao carregar logo:', logoUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {churchName.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{churchName}</h1>
            <p className="text-sm text-gray-600">Sistema de Gestão</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <BirthdayNotifications />
          
          {user && (
            <div className="flex items-center gap-2">
              <UserMenu />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
