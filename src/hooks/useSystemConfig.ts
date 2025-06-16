
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
    form_title: { text: 'Formulário de Contato' },
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
        }
      } catch (error) {
        console.error('Erro crítico ao carregar configurações:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return { config, loading };
};
