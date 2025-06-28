
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  Settings, 
  MessageSquare, 
  QrCode,
  Calendar,
  Network,
  UserCheck,
  Baby
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Contatos', href: '/contacts' },
  { icon: Baby, label: 'Kids & Jovens', href: '/kids-ministry' },
  { icon: Network, label: 'Genealogia', href: '/genealogy' },
  { icon: Calendar, label: 'Presença Célula', href: '/cell-attendance' },
  { icon: UserCheck, label: 'Presença Membro', href: '/member-attendance' },
  { icon: MessageSquare, label: 'Mensagens', href: '/messages' },
  { icon: QrCode, label: 'QR Codes', href: '/qr-codes' },
  { icon: Settings, label: 'Configurações', href: '/settings' },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-start"
          >
            {collapsed ? '→' : '←'}
            {!collapsed && <span className="ml-2">Recolher</span>}
          </Button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-blue-100 text-blue-900" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="ml-3">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
