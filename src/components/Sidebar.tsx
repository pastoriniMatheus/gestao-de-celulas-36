
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Calendar, 
  QrCode, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  UserCog,
  MapPin,
  TrendingUp,
  Contact
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUserPermissions } from '@/hooks/useUserPermissions';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const permissions = useUserPermissions();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/', show: permissions.canAccessDashboard },
    { icon: Contact, label: 'Contatos', path: '/contacts', show: permissions.canAccessContacts },
    { icon: Users, label: 'Células', path: '/cells', show: permissions.canAccessCells },
    { icon: TrendingUp, label: 'Pipeline', path: '/pipeline', show: permissions.canAccessPipeline },
    { icon: MessageSquare, label: 'Mensagens', path: '/messaging', show: permissions.canAccessMessaging },
    { icon: Calendar, label: 'Eventos', path: '/events', show: permissions.canAccessEvents },
    { icon: QrCode, label: 'QR Codes', path: '/qr-codes', show: permissions.canAccessQRCodes },
    { icon: MapPin, label: 'Localização', path: '/location', show: permissions.canAccessSettings },
    { icon: UserCog, label: 'Usuários', path: '/users', show: permissions.canAccessUserManagement },
    { icon: Settings, label: 'Configurações', path: '/settings', show: permissions.canAccessSettings },
  ].filter(item => item.show);

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-gray-800">Sistema</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                isCollapsed && "justify-center"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {permissions.userProfile && (
        <div className="p-4 border-t border-gray-200">
          <div className={cn(
            "text-xs text-gray-500",
            isCollapsed && "text-center"
          )}>
            {!isCollapsed && (
              <>
                <div className="font-medium">{permissions.userProfile.name}</div>
                <div className="capitalize">{permissions.userProfile.role}</div>
              </>
            )}
            {isCollapsed && (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                {permissions.userProfile.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
