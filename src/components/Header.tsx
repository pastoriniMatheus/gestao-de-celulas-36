
import { BirthdayNotifications } from './BirthdayNotifications';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useSystemConfig } from '@/hooks/useSystemConfig';

export const Header = () => {
  const { config, loading: configLoading } = useSystemConfig();
  
  const logoUrl = config?.site_logo?.url;
  const logoAlt = config?.site_logo?.alt || 'Logo';
  const churchName = config?.church_name?.text || config?.form_title?.text || 'Sistema';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
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
            <h1 className="text-lg font-semibold text-sidebar-foreground">{churchName}</h1>
            <p className="text-xs text-muted-foreground">Gestão Celular</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <BirthdayNotifications />
        </div>
      </div>
    </header>
  );
};
