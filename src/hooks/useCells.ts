
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Cell {
  id: string;
  name: string;
  address: string;
  meeting_day: number;
  meeting_time: string;
  leader_id: string | null;
  neighborhood_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCells = () => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const mountedRef = useRef(true);

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

      if (mountedRef.current) {
        setCells(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar células:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
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
      if (mountedRef.current) {
        setCells(prev => [...prev, data]);
      }
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
      if (mountedRef.current) {
        setCells(prev => prev.map(cell => cell.id === id ? data : cell));
      }
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
      if (mountedRef.current) {
        setCells(prev => prev.filter(cell => cell.id !== id));
      }
    } catch (error) {
      console.error('Erro ao deletar célula:', error);
      throw error;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchCells();

    // Setup realtime subscription only if no existing channel
    const setupSubscription = () => {
      try {
        // Only create subscription if none exists
        if (channelRef.current) {
          return;
        }

        // Create new channel with unique name
        const channelName = `cells-${Date.now()}-${Math.random()}`;
        const channel = supabase.channel(channelName);
        channelRef.current = channel;

        // Subscribe to changes
        channel
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'cells' },
            (payload) => {
              if (!mountedRef.current) return;
              
              console.log('Cells realtime update:', payload);
              fetchCells(); // Refresh data when changes occur
            }
          )
          .subscribe((status) => {
            console.log('Cells subscription status:', status);
          });

      } catch (error) {
        console.error('Error setting up cells subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      mountedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  return {
    cells,
    loading,
    fetchCells,
    addCell,
    updateCell,
    deleteCell
  };
};
