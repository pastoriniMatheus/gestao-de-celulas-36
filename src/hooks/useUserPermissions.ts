
import { useAuth } from '@/components/AuthProvider';

export const useUserPermissions = () => {
  const { userProfile } = useAuth();

  const canAccessUserManagement = userProfile?.role === 'admin';
  const canAccessSettings = userProfile?.role === 'admin';
  const canAccessEvents = userProfile?.role === 'admin';
  const canAccessQRCodes = userProfile?.role === 'admin';
  const canAccessMessaging = userProfile?.role === 'admin' || userProfile?.role === 'leader';
  const canAccessContacts = true; // Por enquanto deixar aberto conforme solicitado
  const canAccessDashboard = true;
  const canAccessCells = true;
  const canAccessPipeline = true;

  const isLeader = userProfile?.role === 'leader';
  const isAdmin = userProfile?.role === 'admin';

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
