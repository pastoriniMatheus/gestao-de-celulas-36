
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

  const addEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'scan_count'>) => {
    try {
      console.log('Criando evento:', eventData);
      
      const { data, error } = await supabase
        .from('events')
        .insert([{ ...eventData, scan_count: 0 }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar evento:', error);
        if (error.code === '23505') {
          toast({
            title: "Erro",
            description: "Esta palavra-chave já existe. Escolha outra.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro",
            description: `Erro ao criar evento: ${error.message}`,
            variant: "destructive"
          });
        }
        throw error;
      }

      console.log('Evento criado com sucesso:', data);
      
      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso!"
      });

      // Atualizar a lista automaticamente
      await fetchEvents();
      return data;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
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

      // Atualizar a lista automaticamente
      await fetchEvents();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
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

      // Atualizar a lista automaticamente
      await fetchEvents();
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
    fetchEvents
  };
};
