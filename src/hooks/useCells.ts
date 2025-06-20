
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
  const subscriptionSetupRef = useRef(false);
  const hookIdRef = useRef(Math.random().toString(36).substr(2, 9));

  const fetchCells = async () => {
    try {
      setLoading(true);
      console.log(`useCells [${hookIdRef.current}]: Iniciando busca de células...`);
      
      const { data, error } = await supabase
        .from('cells')
        .select('*')
        .order('name');

      console.log(`useCells [${hookIdRef.current}]: Resposta do Supabase:`, { data, error });

      if (error) {
        console.error(`useCells [${hookIdRef.current}]: Erro ao buscar células:`, error);
        toast({
          title: "Erro",
          description: `Erro ao carregar células: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log(`useCells [${hookIdRef.current}]: Células encontradas:`, data?.length || 0, data);
      
      if (mountedRef.current) {
        setCells(data || []);
      }
    } catch (error) {
      console.error(`useCells [${hookIdRef.current}]: Erro inesperado ao buscar células:`, error);
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
      console.log(`useCells [${hookIdRef.current}]: Criando nova célula:`, cellData);
      
      const { data, error } = await supabase
        .from('cells')
        .insert([cellData])
        .select()
        .single();

      if (error) {
        console.error(`useCells [${hookIdRef.current}]: Erro ao criar célula:`, error);
        throw error;
      }

      console.log(`useCells [${hookIdRef.current}]: Célula criada com sucesso:`, data);
      
      if (mountedRef.current) {
        setCells(prev => [...prev, data]);
      }
      
      toast({
        title: "Sucesso",
        description: "Célula criada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error(`useCells [${hookIdRef.current}]: Erro ao criar célula:`, error);
      throw error;
    }
  };

  const updateCell = async (id: string, updates: Partial<Cell>) => {
    try {
      console.log(`useCells [${hookIdRef.current}]: Atualizando célula:`, { id, updates });
      
      const { data, error } = await supabase
        .from('cells')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`useCells [${hookIdRef.current}]: Erro ao atualizar célula:`, error);
        throw error;
      }

      console.log(`useCells [${hookIdRef.current}]: Célula atualizada com sucesso:`, data);
      
      if (mountedRef.current) {
        setCells(prev => prev.map(cell => cell.id === id ? data : cell));
      }
      
      toast({
        title: "Sucesso",
        description: "Célula atualizada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error(`useCells [${hookIdRef.current}]: Erro ao atualizar célula:`, error);
      throw error;
    }
  };

  const deleteCell = async (id: string) => {
    try {
      console.log(`useCells [${hookIdRef.current}]: Deletando célula:`, id);
      
      const { error } = await supabase
        .from('cells')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`useCells [${hookIdRef.current}]: Erro ao deletar célula:`, error);
        throw error;
      }

      console.log(`useCells [${hookIdRef.current}]: Célula deletada com sucesso`);
      
      if (mountedRef.current) {
        setCells(prev => prev.filter(cell => cell.id !== id));
      }
      
      toast({
        title: "Sucesso",
        description: "Célula deletada com sucesso!"
      });
    } catch (error) {
      console.error(`useCells [${hookIdRef.current}]: Erro ao deletar célula:`, error);
      throw error;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    console.log(`useCells [${hookIdRef.current}]: Inicializando hook...`);
    
    // Fetch initial data
    fetchCells();

    // Setup subscription only once with proper cleanup
    const setupSubscription = () => {
      if (subscriptionSetupRef.current) {
        console.log(`useCells [${hookIdRef.current}]: Subscription already setup, skipping...`);
        return;
      }

      try {
        // Clean up existing channel first
        if (channelRef.current) {
          console.log(`useCells [${hookIdRef.current}]: Limpando canal anterior...`);
          try {
            supabase.removeChannel(channelRef.current);
          } catch (cleanupError) {
            console.warn(`useCells [${hookIdRef.current}]: Erro ao limpar canal anterior:`, cleanupError);
          }
          channelRef.current = null;
        }

        const channelName = `cells-realtime-${hookIdRef.current}-${Date.now()}`;
        console.log(`useCells [${hookIdRef.current}]: Criando canal:`, channelName);
        
        const channel = supabase.channel(channelName);
        channelRef.current = channel;

        channel
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'cells' },
            (payload) => {
              if (!mountedRef.current) return;
              
              console.log(`useCells [${hookIdRef.current}]: Atualização em tempo real:`, payload);
              // Fetch fresh data instead of trying to update state directly
              fetchCells();
            }
          )
          .subscribe((status) => {
            console.log(`useCells [${hookIdRef.current}]: Status da inscrição:`, status);
            if (status === 'SUBSCRIBED') {
              subscriptionSetupRef.current = true;
            } else if (status === 'CHANNEL_ERROR') {
              console.error(`useCells [${hookIdRef.current}]: Erro no canal, tentando reconectar...`);
              subscriptionSetupRef.current = false;
              // Don't automatically retry to avoid infinite loops
            }
          });

      } catch (error) {
        console.error(`useCells [${hookIdRef.current}]: Erro ao configurar inscrição:`, error);
        subscriptionSetupRef.current = false;
      }
    };

    // Delay subscription setup to avoid race conditions
    const timeoutId = setTimeout(setupSubscription, 100);

    return () => {
      console.log(`useCells [${hookIdRef.current}]: Limpando hook...`);
      clearTimeout(timeoutId);
      mountedRef.current = false;
      subscriptionSetupRef.current = false;
      
      if (channelRef.current) {
        console.log(`useCells [${hookIdRef.current}]: Removendo canal...`);
        try {
          supabase.removeChannel(channelRef.current);
        } catch (cleanupError) {
          console.warn(`useCells [${hookIdRef.current}]: Erro ao remover canal:`, cleanupError);
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
