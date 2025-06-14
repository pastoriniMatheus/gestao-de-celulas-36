
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface Event {
  id: string;
  name: string;
  date: string;
  keyword: string;
  qr_code: string;
  qr_url: string;
  scan_count: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('Buscando eventos...');
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar eventos:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar eventos",
          variant: "destructive"
        });
        return;
      }

      console.log('Eventos encontrados:', data);
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'scan_count' | 'qr_code' | 'qr_url'>) => {
    try {
      console.log('Criando evento:', eventData);
      
      // Normalizar keyword
      const normalizedKeyword = eventData.keyword.toLowerCase().trim();
      
      // Verificar se keyword já existe
      const { data: existingEvent } = await supabase
        .from('events')
        .select('keyword')
        .eq('keyword', normalizedKeyword)
        .maybeSingle();

      if (existingEvent) {
        toast({
          title: "Erro",
          description: "Esta palavra-chave já existe. Escolha outra.",
          variant: "destructive"
        });
        throw new Error('Keyword já existe');
      }

      // Gerar URL baseada no domínio atual
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/form/${normalizedKeyword}`;
      
      // Gerar QR code data
      const qrCodeDataUrl = await QRCode.toDataURL(redirectUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      const { data, error } = await supabase
        .from('events')
        .insert([{ 
          ...eventData, 
          keyword: normalizedKeyword,
          qr_url: redirectUrl,
          qr_code: qrCodeDataUrl,
          scan_count: 0 
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar evento:', error);
        toast({
          title: "Erro",
          description: `Erro ao criar evento: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }

      console.log('Evento criado com sucesso:', data);
      
      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso!"
      });

      // Adicionar o novo evento no início da lista
      setEvents(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      // Se estiver atualizando keyword, regenerar QR code
      if (updates.keyword) {
        const normalizedKeyword = updates.keyword.toLowerCase().trim();
        const baseUrl = window.location.origin;
        const redirectUrl = `${baseUrl}/form/${normalizedKeyword}`;
        
        const qrCodeDataUrl = await QRCode.toDataURL(redirectUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        updates.keyword = normalizedKeyword;
        updates.qr_url = redirectUrl;
        updates.qr_code = qrCodeDataUrl;
      }

      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar evento:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso!"
      });

      // Atualizar o evento na lista local
      setEvents(prev => prev.map(event => event.id === id ? data : event));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  };

  const toggleEventStatus = async (id: string, active: boolean) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({ active })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar status do evento",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: `Evento ${active ? 'ativado' : 'desativado'} com sucesso!`
      });

      // Atualizar automaticamente
      setEvents(prev => prev.map(event => event.id === id ? data : event));
    } catch (error) {
      console.error('Erro crítico ao atualizar status:', error);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar evento:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso!"
      });

      // Remover o evento da lista local
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventStatus,
    fetchEvents
  };
};
