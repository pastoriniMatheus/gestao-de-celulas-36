
import { Home, Users, Building2, MessageSquare, Settings, Calendar, UserCheck } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useUserPermissions } from '@/hooks/useUserPermissions';

const allItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    permission: 'canAccessDashboard'
  },
  {
    title: "Contatos",
    url: "/contacts",
    icon: Users,
    permission: 'canAccessContacts'
  },
  {
    title: "Estágio dos Discípulos",
    url: "/pipeline",
    icon: UserCheck,
    permission: 'canAccessPipeline'
  },
  {
    title: "Células",
    url: "/cells",
    icon: Building2,
    permission: 'canAccessCells'
  },
  {
    title: "Mensagens",
    url: "/messages",
    icon: MessageSquare,
    permission: 'canAccessMessaging'
  },
  {
    title: "Eventos",
    url: "/events",
    icon: Calendar,
    permission: 'canAccessEvents'
  },
  {
    title: "Usuários",
    url: "/users",
    icon: Users,
    permission: 'canAccessUserManagement'
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
    permission: 'canAccessSettings'
  },
];

export function AppSidebar() {
  const location = useLocation();
  const permissions = useUserPermissions();
  
  console.log('AppSidebar - permissions:', permissions);
  
  // Filtrar itens baseado nas permissões
  const items = allItems.filter(item => {
    const hasPermission = permissions[item.permission as keyof typeof permissions];
    console.log(`AppSidebar - ${item.title}: permission ${item.permission} = ${hasPermission}`);
    return hasPermission;
  });

  console.log('AppSidebar - items to show:', items.length, items.map(i => i.title));

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Sistema de Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
