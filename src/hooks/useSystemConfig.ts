
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemConfig {
  site_logo: { url: string; alt: string };
  form_title: { text: string };
  form_description: { text: string };
}

export const useSystemConfig = () => {
  const [config, setConfig] = useState<SystemConfig>({
    site_logo: { url: '', alt: 'Logo da Igreja' },
    form_title: { text: 'Sistema de Células' },
    form_description: { text: 'Preencha seus dados para nos conectarmos com você' }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log('Carregando configurações do sistema...');
        
        const { data, error } = await supabase
          .from('system_settings')
          .select('key, value')
          .in('key', ['site_logo', 'form_title', 'form_description']);

        if (error) {
          console.error('Erro ao carregar configurações:', error);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const settings: any = {};
          data.forEach(item => {
            settings[item.key] = item.value;
          });
          setConfig(prev => ({ ...prev, ...settings }));

          // Atualizar favicon se houver logo configurado
          if (settings.site_logo?.url) {
            updateFavicon(settings.site_logo.url);
          }
        }
      } catch (error) {
        console.error('Erro crítico ao carregar configurações:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const updateFavicon = (logoUrl: string) => {
    try {
      // Remover favicon existente
      const existingFavicon = document.querySelector('link[rel="icon"]');
      if (existingFavicon) {
        existingFavicon.remove();
      }

      // Adicionar novo favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = logoUrl;
      link.type = 'image/png';
      document.head.appendChild(link);
      
      console.log('Favicon atualizado para:', logoUrl);
    } catch (error) {
      console.error('Erro ao atualizar favicon:', error);
    }
  };

  return { config, loading };
};
