
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
  const logoUrl = config?.site_logo?.url;
  const logoAlt = config?.site_logo?.alt || 'Logo';
  const churchName = config?.church_name?.text || config?.form_title?.text || 'Sistema de Células';

  console.log('Header: user =', user);
  console.log('Header: userProfile =', userProfile);
  console.log('Header: logoUrl =', logoUrl);
  console.log('Header: config =', config);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {configLoading ? (
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          ) : logoUrl ? (
            <img 
              src={logoUrl} 
              alt={logoAlt}
              className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-lg border border-gray-200"
              onError={(e) => {
                console.error('Erro ao carregar logo:', logoUrl);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Logo carregado com sucesso:', logoUrl);
              }}
            />
          ) : (
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm md:text-lg">
                {churchName.charAt(0)}
              </span>
            </div>
          )}
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-bold text-gray-900">{churchName}</h1>
            <p className="text-xs md:text-sm text-gray-600">Sistema de Gestão</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <BirthdayNotifications />
          
          {user && userProfile ? (
            <div className="flex items-center gap-2">
              <div className="block">
                <UserMenu />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 p-2 flex items-center"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline ml-1">Sair</span>
              </Button>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Carregando...</div>
          )}
        </div>
      </div>
    </header>
  );
};
