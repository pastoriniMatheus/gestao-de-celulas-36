
import { useAuth } from '@/components/AuthProvider';

export const useUserPermissions = () => {
  const { userProfile } = useAuth();

  // Admin tem acesso a tudo
  const isAdmin = userProfile?.role === 'admin';
  const isLeader = userProfile?.role === 'leader';

  const canAccessUserManagement = isAdmin;
  const canAccessSettings = isAdmin;
  const canAccessEvents = isAdmin;
  const canAccessQRCodes = isAdmin;
  const canAccessMessaging = isAdmin || isLeader;
  const canAccessContacts = true; // Sempre permitir acesso aos contatos
  const canAccessDashboard = true; // Sempre permitir acesso ao dashboard
  const canAccessCells = true; // Sempre permitir acesso às células
  const canAccessPipeline = true; // Sempre permitir acesso ao pipeline

  return {
    canAccessUserManagement,
    canAccessSettings,
    canAccessEvents,
    canAccessQRCodes,
    canAccessMessaging,
    canAccessContacts,
    canAccessDashboard,
    canAccessCells,
    canAccessPipeline,
    isLeader,
    isAdmin,
    userProfile
  };
};
