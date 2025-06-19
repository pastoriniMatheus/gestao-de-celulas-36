
import { useState, useEffect, useRef } from 'react';
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
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
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

    // Cleanup function
    return () => {
      mountedRef.current = false;
      console.log('Cleaning up cells hook...');
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Error removing channel:', error);
        }
        channelRef.current = null;
      }
      isSubscribedRef.current = false;
    };
  }, []);

  // Separate useEffect for subscription to avoid recreation on every render
  useEffect(() => {
    if (isSubscribedRef.current || !mountedRef.current) return;

    const setupSubscription = async () => {
      try {
        // Clean up any existing channel first
        if (channelRef.current) {
          console.log('Cleaning up existing cells channel...');
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
          isSubscribedRef.current = false;
        }

        const channelName = `cells-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log('Creating cells subscription:', channelName);

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
              
              if (!mountedRef.current) return;

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
          );

        const subscriptionResult = await channel.subscribe();
        console.log('Cells subscription result:', subscriptionResult);
        
        if (subscriptionResult === 'SUBSCRIBED') {
          channelRef.current = channel;
          isSubscribedRef.current = true;
        }
      } catch (error) {
        console.error('Error setting up cells subscription:', error);
      }
    };

    setupSubscription();
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
