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
    <header>
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 md:gap-3">
          <BirthdayNotifications />
          
          {user && userProfile ? (
            <div className="flex items-center gap-2">
              <UserMenu />
            </div>
          ) : (
            <div className="text-sm text-gray-500">Carregando...</div>
          )}
        </div>
      </div>
    </header>
  );
};
