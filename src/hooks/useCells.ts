
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Cell {
  id: string;
  name: string;
  address: string;
  meeting_day: number;
  meeting_time: string;
  leader_id?: string;
  neighborhood_id?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCells = () => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCells = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cells')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao buscar células:', error);
        return;
      }

      setCells(data || []);
    } catch (error) {
      console.error('Erro ao buscar células:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCell = async (cellData: Omit<Cell, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('cells')
        .insert([cellData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar célula:', error);
        throw error;
      }

      // Atualizar estado local imediatamente
      setCells(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Erro ao criar célula:', error);
      throw error;
    }
  };

  const updateCell = async (id: string, updates: Partial<Cell>) => {
    try {
      const { data, error } = await supabase
        .from('cells')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar célula:', error);
        throw error;
      }

      // Atualizar estado local imediatamente
      setCells(prev => prev.map(cell => cell.id === id ? data : cell));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar célula:', error);
      throw error;
    }
  };

  const deleteCell = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cells')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar célula:', error);
        throw error;
      }

      // Atualizar estado local imediatamente
      setCells(prev => prev.filter(cell => cell.id !== id));
    } catch (error) {
      console.error('Erro ao deletar célula:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCells();

    // Create a unique channel name to prevent conflicts
    const channelName = `cells-realtime-changes-${Date.now()}-${Math.random()}`;
    console.log('Creating cells channel:', channelName);

    // Configurar real-time updates melhorado
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cells'
        },
        (payload) => {
          console.log('Célula alterada em tempo real:', payload);
          
          if (payload.eventType === 'INSERT') {
            setCells(prev => [...prev, payload.new as Cell]);
          } else if (payload.eventType === 'UPDATE') {
            setCells(prev => prev.map(cell => 
              cell.id === payload.new.id ? payload.new as Cell : cell
            ));
          } else if (payload.eventType === 'DELETE') {
            setCells(prev => prev.filter(cell => cell.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Cells channel subscription status:', status);
      });

    return () => {
      console.log('Cleaning up cells channel...');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    cells,
    loading,
    addCell,
    updateCell,
    deleteCell,
    fetchCells
  };
};
