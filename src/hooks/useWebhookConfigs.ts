
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface WebhookConfig {
  id: string;
  name: string;
  webhook_url: string;
  event_type: 'birthday' | 'new_contact' | 'pipeline_change' | 'custom';
  active: boolean;
  headers: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export const useWebhookConfigs = () => {
  const [configs, setConfigs] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações de webhook",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addConfig = async (configData: Omit<WebhookConfig, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('webhook_configs')
        .insert([configData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração de webhook criada com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar configuração de webhook",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateConfig = async (id: string, updates: Partial<WebhookConfig>) => {
    try {
      const { error } = await supabase
        .from('webhook_configs')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração",
        variant: "destructive"
      });
    }
  };

  const deleteConfig = async (id: string) => {
    try {
      const { error } = await supabase
        .from('webhook_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração deletada com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao deletar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar configuração",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchConfigs();

    // Configurar real-time
    const channel = supabase
      .channel('webhook-configs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'webhook_configs'
        },
        () => {
          fetchConfigs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    configs,
    loading,
    addConfig,
    updateConfig,
    deleteConfig,
    refreshConfigs: fetchConfigs
  };
};
