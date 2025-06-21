
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemSettings {
  logo_url?: string;
  church_name?: string;
  primary_color?: string;
}

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('key, value');

        if (error) throw error;

        const settingsMap: SystemSettings = {};
        data?.forEach(setting => {
          // Handle Json type properly by extracting string values
          const value = setting.value;
          if (typeof value === 'object' && value !== null) {
            // Se é um objeto, tentar pegar a propriedade 'url' primeiro (para imagens)
            settingsMap[setting.key as keyof SystemSettings] = (value as any).url || (value as any).text || String(value);
          } else {
            settingsMap[setting.key as keyof SystemSettings] = String(value);
          }
        });

        console.log('Configurações carregadas:', settingsMap);
        setSettings(settingsMap);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading };
};
