
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Home, 
  MessageCircle, 
  GitBranch, 
  Settings as SettingsIcon,
  Shield,
  QrCode
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'events', label: 'Eventos', icon: Calendar },
    { id: 'contacts', label: 'Contatos', icon: Users },
    { id: 'cells', label: 'Células', icon: Home },
    { id: 'qrcodes', label: 'QR Codes', icon: QrCode },
    { id: 'messaging', label: 'Mensagens', icon: MessageCircle },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
    { id: 'users', label: 'Usuários', icon: Shield },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon },
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">Sistema de Células</h1>
        <p className="text-sm text-gray-600 mt-2">Gestão Completa</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start px-6 py-3 h-auto text-left",
                activeSection === item.id && "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};
