
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
            // If it's an object, try to get the text property or convert to string
            settingsMap[setting.key as keyof SystemSettings] = (value as any).text || (value as any).url || String(value);
          } else {
            settingsMap[setting.key as keyof SystemSettings] = String(value);
          }
        });

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
