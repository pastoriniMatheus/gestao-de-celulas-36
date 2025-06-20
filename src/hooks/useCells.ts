
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
    fetchCells();

    return () => {
      console.log('useCells: Cleaning up hook...');
      mountedRef.current = false;
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
