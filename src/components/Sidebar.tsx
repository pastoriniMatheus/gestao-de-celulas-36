
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Home, 
  QrCode, 
  MessageCircle, 
  GitBranch,
  Settings,
  UserCog
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral do sistema'
  },
  {
    id: 'events',
    label: 'Eventos',
    icon: Calendar,
    description: 'Gerenciar eventos'
  },
  {
    id: 'contacts',
    label: 'Contatos',
    icon: Users,
    description: 'Visitantes e membros'
  },
  {
    id: 'cells',
    label: 'Células',
    icon: Home,
    description: 'Células domiciliares'
  },
  {
    id: 'qrcodes',
    label: 'QR Codes',
    icon: QrCode,
    description: 'Códigos QR'
  },
  {
    id: 'messaging',
    label: 'Mensagens',
    icon: MessageCircle,
    description: 'Central de mensagens'
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: GitBranch,
    description: 'Pipeline de conversão'
  },
  {
    id: 'users',
    label: 'Usuários',
    icon: UserCog,
    description: 'Gerenciar usuários'
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    description: 'Configurações do sistema'
  }
];

export const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">CellManager</h1>
            <p className="text-sm text-gray-500">Sistema de Células</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-auto p-3 text-left",
                isActive 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive ? "text-white" : "text-gray-500"
              )} />
              <div className="flex flex-col items-start">
                <span className="font-medium">{item.label}</span>
                <span className={cn(
                  "text-xs",
                  isActive ? "text-blue-100" : "text-gray-500"
                )}>
                  {item.description}
                </span>
              </div>
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">
            Sistema Ativo
          </p>
          <p className="text-xs text-gray-600">
            Versão 1.0.0 - Gestão Inteligente de Células
          </p>
        </div>
      </div>
    </div>
  );
};
