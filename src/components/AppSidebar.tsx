
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Calendar, 
  Settings, 
  UserCog,
  TrendingUp,
  Contact
} from 'lucide-react';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { useAuth } from './AuthProvider';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, Shield } from 'lucide-react';
import { EditProfileDialog } from './EditProfileDialog';

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = useUserPermissions();
  const { config, loading: configLoading } = useSystemConfig();
  const { user, userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getUserInitials = () => {
    if (userProfile?.name) {
      return userProfile.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'leader':
        return 'Líder';
      case 'user':
        return 'Usuário';
      default:
        return 'Usuário';
    }
  };

  const menuItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      path: '/', 
      show: permissions.canAccessDashboard 
    },
    { 
      icon: Calendar, 
      label: 'Eventos', 
      path: '/events', 
      show: permissions.canAccessEvents 
    },
    { 
      icon: Contact, 
      label: 'Discípulos', 
      path: '/contacts', 
      show: permissions.canAccessContacts 
    },
    { 
      icon: Users, 
      label: 'Células', 
      path: '/cells', 
      show: permissions.canAccessCells 
    },
    { 
      icon: MessageSquare, 
      label: 'Mensagens', 
      path: '/messaging', 
      show: permissions.canAccessMessaging 
    },
    { 
      icon: TrendingUp, 
      label: 'Pipeline', 
      path: '/pipeline', 
      show: permissions.canAccessPipeline 
    },
    { 
      icon: UserCog, 
      label: 'Usuários', 
      path: '/users', 
      show: permissions.canAccessUserManagement 
    },
    { 
      icon: Settings, 
      label: 'Configurações', 
      path: '/settings', 
      show: permissions.canAccessSettings 
    },
  ];

  const filteredMenuItems = menuItems.filter(item => item.show);

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const logoUrl = config?.site_logo?.url;
  const logoAlt = config?.site_logo?.alt || 'Logo';
  const churchName = config?.church_name?.text || config?.form_title?.text || 'Sistema';

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          {configLoading ? (
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          ) : logoUrl ? (
            <img 
              src={logoUrl} 
              alt={logoAlt}
              className="w-8 h-8 object-contain rounded border border-gray-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {churchName.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">Gestão Celular</h1>
            <p className="text-xs text-muted-foreground">{churchName}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <button
                        onClick={() => handleMenuClick(item.path)}
                        className="w-full flex items-center gap-3"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {user && userProfile && (
        <SidebarFooter className="border-t border-sidebar-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-auto p-2 hover:bg-sidebar-accent">
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile?.photo_url} alt={userProfile?.name || 'User'} />
                    <AvatarFallback className="text-xs font-semibold bg-blue-100 text-blue-700">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="text-sm font-medium truncate w-full">
                      {userProfile?.name || 'Usuário'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {getRoleLabel(userProfile?.role || 'user')}
                      </span>
                    </div>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userProfile?.name || 'Usuário'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <EditProfileDialog />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
