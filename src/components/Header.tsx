
import { useSystemConfig } from '@/hooks/useSystemConfig';

export const Header = () => {
  const { config, loading } = useSystemConfig();

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center gap-3">
        {config.site_logo?.url && (
          <img 
            src={config.site_logo.url} 
            alt={config.site_logo.alt || 'Logo'}
            className="h-10 w-auto object-contain"
          />
        )}
        <h1 className="text-xl font-semibold text-gray-800">
          {config.church_name?.text || config.form_title?.text || 'Sistema de Células'}
        </h1>
      </div>
    </header>
  );
};
