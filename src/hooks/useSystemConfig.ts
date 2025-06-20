
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemConfig {
  site_logo: { url: string; alt: string };
  form_title: { text: string };
  form_description: { text: string };
  church_name: { text: string };
}

export const useSystemConfig = () => {
  const [config, setConfig] = useState<SystemConfig>({
    site_logo: { url: '', alt: 'Logo da Igreja' },
    form_title: { text: 'Sistema de Células' },
    form_description: { text: 'Preencha seus dados para nos conectarmos com você' },
    church_name: { text: '' }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log('Carregando configurações do sistema...');
        
        const { data, error } = await supabase
          .from('system_settings')
          .select('key, value')
          .in('key', ['site_logo', 'form_title', 'form_description', 'church_name']);

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

    // Criar canal único com nome baseado em timestamp
    const channelName = `system-config-${Date.now()}`;
    console.log('Creating system config channel:', channelName);

    // Configurar real-time updates para configurações
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings'
        },
        (payload) => {
          console.log('Configuração alterada em tempo real:', payload);
          loadConfig(); // Recarregar configurações
        }
      )
      .subscribe((status) => {
        console.log('System config channel subscription status:', status);
      });

    return () => {
      console.log('Cleaning up system config channel:', channelName);
      supabase.removeChannel(channel);
    };
  }, []);

  const updateFavicon = (logoUrl: string) => {
    try {
      // Remover favicons existentes
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(favicon => favicon.remove());

      // Adicionar novo favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = logoUrl;
      link.type = 'image/png';
      document.head.appendChild(link);
      
      // Adicionar também como shortcut icon para melhor compatibilidade
      const shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      shortcutLink.href = logoUrl;
      shortcutLink.type = 'image/png';
      document.head.appendChild(shortcutLink);
      
      console.log('Favicon atualizado para:', logoUrl);
    } catch (error) {
      console.error('Erro ao atualizar favicon:', error);
    }
  };

  const updateConfig = async (newConfig: Partial<SystemConfig>) => {
    try {
      console.log('Atualizando configurações:', newConfig);
      
      // Salvar cada configuração
      for (const [key, value] of Object.entries(newConfig)) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({ 
            key, 
            value 
          }, { 
            onConflict: 'key' 
          });

        if (error) {
          console.error(`Erro ao salvar ${key}:`, error);
          throw error;
        }
      }

      // Atualizar estado local
      setConfig(prev => ({ ...prev, ...newConfig }));

      // Atualizar favicon se o logo foi alterado
      if (newConfig.site_logo?.url) {
        updateFavicon(newConfig.site_logo.url);
      }
      
      console.log('Configurações atualizadas com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  };

  return { config, loading, updateConfig };
};
