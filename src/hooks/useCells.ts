
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
  const mountedRef = useRef(true);
  const channelRef = useRef<any>(null);
  const subscriptionActiveRef = useRef(false);

  const fetchCells = async () => {
    try {
      setLoading(true);
      console.log('useCells: Fetching cells...');
      
      const { data, error } = await supabase
        .from('cells')
        .select('*')
        .order('name');

      console.log('useCells: Supabase response:', { data, error });

      if (error) {
        console.error('useCells: Error fetching cells:', error);
        toast({
          title: "Erro",
          description: `Erro ao carregar células: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('useCells: Cells found:', data?.length || 0);
      
      if (mountedRef.current) {
        setCells(data || []);
      }
    } catch (error) {
      console.error('useCells: Unexpected error:', error);
      if (mountedRef.current) {
        toast({
          title: "Erro",
          description: "Erro inesperado ao carregar células",
          variant: "destructive"
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const addCell = async (cellData: Omit<Cell, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('useCells: Creating new cell:', cellData);
      
      const { data, error } = await supabase
        .from('cells')
        .insert([cellData])
        .select()
        .single();

      if (error) {
        console.error('useCells: Error creating cell:', error);
        throw error;
      }

      console.log('useCells: Cell created successfully:', data);
      
      if (mountedRef.current) {
        setCells(prev => [...prev, data]);
      }
      
      toast({
        title: "Sucesso",
        description: "Célula criada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('useCells: Error creating cell:', error);
      throw error;
    }
  };

  const updateCell = async (id: string, updates: Partial<Cell>) => {
    try {
      console.log('useCells: Updating cell:', { id, updates });
      
      const { data, error } = await supabase
        .from('cells')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useCells: Error updating cell:', error);
        throw error;
      }

      console.log('useCells: Cell updated successfully:', data);
      
      if (mountedRef.current) {
        setCells(prev => prev.map(cell => cell.id === id ? data : cell));
      }
      
      toast({
        title: "Sucesso",
        description: "Célula atualizada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('useCells: Error updating cell:', error);
      throw error;
    }
  };

  const deleteCell = async (id: string) => {
    try {
      console.log('useCells: Deleting cell:', id);
      
      const { error } = await supabase
        .from('cells')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('useCells: Error deleting cell:', error);
        throw error;
      }

      console.log('useCells: Cell deleted successfully');
      
      if (mountedRef.current) {
        setCells(prev => prev.filter(cell => cell.id !== id));
      }
      
      toast({
        title: "Sucesso",
        description: "Célula deletada com sucesso!"
      });
    } catch (error) {
      console.error('useCells: Error deleting cell:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('useCells: Hook initializing...');
    mountedRef.current = true;
    
    // Fetch initial data
    fetchCells();

    // Setup realtime subscription only if not already active
    const setupSubscription = () => {
      if (subscriptionActiveRef.current) {
        console.log('useCells: Subscription already active, skipping...');
        return;
      }

      try {
        // Clean up any existing channel
        if (channelRef.current) {
          console.log('useCells: Cleaning up existing channel...');
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        // Create unique channel name
        const uniqueId = Math.random().toString(36).substr(2, 9);
        const channelName = `cells-list-${Date.now()}-${uniqueId}`;
        console.log('useCells: Creating channel:', channelName);
        
        const channel = supabase.channel(channelName);
        channelRef.current = channel;

        // Subscribe to changes
        channel
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'cells' },
            (payload) => {
              if (!mountedRef.current) return;
              
              console.log('useCells: Realtime update received:', payload);
              // Refetch data to ensure consistency
              fetchCells();
            }
          )
          .subscribe((status) => {
            console.log('useCells: Subscription status:', status);
            if (status === 'SUBSCRIBED') {
              subscriptionActiveRef.current = true;
            } else if (status === 'CHANNEL_ERROR') {
              subscriptionActiveRef.current = false;
              console.error('useCells: Channel error');
            }
          });

      } catch (error) {
        console.error('useCells: Error setting up subscription:', error);
        subscriptionActiveRef.current = false;
      }
    };

    // Delay subscription setup to avoid conflicts
    const timeoutId = setTimeout(setupSubscription, 200);

    return () => {
      console.log('useCells: Cleaning up hook...');
      clearTimeout(timeoutId);
      mountedRef.current = false;
      subscriptionActiveRef.current = false;
      
      if (channelRef.current) {
        console.log('useCells: Removing channel on cleanup...');
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.warn('useCells: Error removing channel:', error);
        }
        channelRef.current = null;
      }
    };
  }, []); // Empty dependency array to run only once

  return {
    cells,
    loading,
    fetchCells,
    addCell,
    updateCell,
    deleteCell
  };
};
