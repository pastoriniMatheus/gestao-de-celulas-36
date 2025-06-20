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

  return (
    <header className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 md:gap-3 bg-white p-2 rounded-xl shadow-lg">
        <BirthdayNotifications />
        
        {user && userProfile ? (
          <div className="flex items-center gap-2">
            <UserMenu />
          </div>
        ) : (
          <div className="text-sm text-gray-500">Carregando...</div>
        )}
      </div>
    </header>
  );
};
