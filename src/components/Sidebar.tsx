
import { Home, QrCode, Users, MessageSquare, Users2, Settings, ChevronLeft, ChevronRight, GitBranch } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'events', label: 'Eventos QR', icon: QrCode },
  { id: 'contacts', label: 'Contatos', icon: Users },
  { id: 'cells', label: 'Células', icon: Users2 },
  { id: 'messaging', label: 'Mensagens', icon: MessageSquare },
  { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "bg-white shadow-lg border-r border-gray-200 transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-blue-900">Igreja Manager</h1>
            <p className="text-sm text-gray-600">Sistema de Células</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                    activeSection === item.id
                      ? "bg-blue-100 text-blue-900 shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <IconComponent size={20} />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
