
import { useAuth } from '@/components/AuthProvider';

export const useLeaderPermissions = () => {
  const { userProfile } = useAuth();

  console.log('useLeaderPermissions - userProfile:', userProfile);
  console.log('useLeaderPermissions - role:', userProfile?.role);

  // Admin tem acesso a tudo
  const isAdmin = userProfile?.role === 'admin';
  const isLeader = userProfile?.role === 'leader' || isAdmin;

  console.log('useLeaderPermissions - isAdmin:', isAdmin);
  console.log('useLeaderPermissions - isLeader:', isLeader);

  // Permissões específicas para células - ajustando para permitir acesso aos líderes
  const canManageAllCells = isAdmin;
  const canEditCells = isAdmin || isLeader;
  const canDeleteCells = isAdmin;
  const canCreateCells = isAdmin;

  const permissions = {
    canManageAllCells,
    canEditCells,
    canDeleteCells,
    canCreateCells,
    isLeader,
    isAdmin,
    userProfile
  };

  console.log('useLeaderPermissions - todas as permissões:', permissions);

  return permissions;
};
