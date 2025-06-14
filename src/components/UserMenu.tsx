
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Shield } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export const UserMenu = () => {
  const { user, userProfile, signOut } = useAuth();

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      console.log('Iniciando logout...');
      await signOut();
      console.log('Logout completado');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'leader':
        return 'Líder';
      default:
        return 'Usuário';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="mr-2 h-4 w-4 text-red-600" />;
      case 'leader':
        return <Shield className="mr-2 h-4 w-4 text-blue-600" />;
      default:
        return <User className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {userProfile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem className="flex flex-col items-start space-y-1">
          <div className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <p className="text-sm font-medium leading-none">
              {userProfile?.name || 'Usuário'}
            </p>
          </div>
          <p className="text-xs text-gray-500">{user.email}</p>
        </DropdownMenuItem>
        
        {userProfile?.role && (
          <DropdownMenuItem className="flex items-center">
            {getRoleIcon(userProfile.role)}
            <span className="text-sm">{getRoleDisplay(userProfile.role)}</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
