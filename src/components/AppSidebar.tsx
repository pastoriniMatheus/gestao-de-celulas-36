
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
import { useAuth } from './AuthProvider';

const adminItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Contatos",
    url: "/contacts",
    icon: Users,
  },
  {
    title: "Estágio dos Discípulos",
    url: "/pipeline",
    icon: UserCheck,
  },
  {
    title: "Células",
    url: "/cells",
    icon: Building2,
  },
  {
    title: "Mensagens",
    url: "/messages",
    icon: MessageSquare,
  },
  {
    title: "Eventos",
    url: "/events",
    icon: Calendar,
  },
  {
    title: "Usuários",
    url: "/users",
    icon: Users,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
];

const leaderItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Meus Contatos",
    url: "/contacts",
    icon: Users,
  },
  {
    title: "Estágio dos Discípulos",
    url: "/pipeline",
    icon: UserCheck,
  },
  {
    title: "Minha Célula",
    url: "/cells",
    icon: Building2,
  },
];

const userItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Contatos",
    url: "/contacts",
    icon: Users,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { userProfile } = useAuth();
  
  console.log('AppSidebar - userProfile:', userProfile);
  
  // Determinar itens baseado no papel do usuário
  let items = userItems;
  if (userProfile?.role === 'admin') {
    items = adminItems;
  } else if (userProfile?.role === 'leader') {
    items = leaderItems;
  }

  console.log('AppSidebar - items selecionados:', items.length);

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
