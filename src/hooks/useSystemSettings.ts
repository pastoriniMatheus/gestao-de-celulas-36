
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
          settingsMap[setting.key as keyof SystemSettings] = setting.value;
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
