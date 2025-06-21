
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CellFilters } from '@/components/CellsFilter';

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
  const [filteredCells, setFilteredCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchCells = async () => {
    try {
      setLoading(true);
      console.log('useCells: Iniciando busca de células...');
      
      const { data, error } = await supabase
        .from('cells')
        .select('*')
        .order('name');

      console.log('useCells: Resposta do Supabase:', { data, error });

      if (error) {
        console.error('useCells: Erro ao buscar células:', error);
        if (mountedRef.current) {
          toast({
            title: "Erro",
            description: `Erro ao carregar células: ${error.message}`,
            variant: "destructive"
          });
        }
        return;
      }

      console.log('useCells: Células encontradas:', data?.length || 0);
      
      if (mountedRef.current) {
        setCells(data || []);
        setFilteredCells(data || []);
      }
    } catch (error) {
      console.error('useCells: Erro inesperado:', error);
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

  const applyFilters = (filters: CellFilters) => {
    let filtered = [...cells];

    if (filters.search) {
      filtered = filtered.filter(cell =>
        cell.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Note: Para filtros de cidade, bairro e líder, seria necessário fazer joins com outras tabelas
    // Por enquanto, vou implementar um filtro básico baseado no endereço
    if (filters.city) {
      filtered = filtered.filter(cell =>
        cell.address.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.neighborhood) {
      filtered = filtered.filter(cell =>
        cell.address.toLowerCase().includes(filters.neighborhood.toLowerCase())
      );
    }

    setFilteredCells(filtered);
  };

  const addCell = async (cellData: Omit<Cell, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('useCells: Criando nova célula:', cellData);
      
      const { data, error } = await supabase
        .from('cells')
        .insert([cellData])
        .select()
        .single();

      if (error) {
        console.error('useCells: Erro ao criar célula:', error);
        throw error;
      }

      console.log('useCells: Célula criada com sucesso:', data);
      
      if (mountedRef.current) {
        setCells(prev => [...prev, data]);
        setFilteredCells(prev => [...prev, data]);
      }
      
      toast({
        title: "Sucesso",
        description: "Célula criada com sucesso! - Sistema Matheus Pastorini"
      });
      
      return data;
    } catch (error) {
      console.error('useCells: Erro ao criar célula:', error);
      throw error;
    }
  };

  const updateCell = async (id: string, updates: Partial<Cell>) => {
    try {
      console.log('useCells: Atualizando célula:', { id, updates });
      
      const { data, error } = await supabase
        .from('cells')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useCells: Erro ao atualizar célula:', error);
        throw error;
      }

      console.log('useCells: Célula atualizada com sucesso:', data);
      
      if (mountedRef.current) {
        setCells(prev => prev.map(cell => cell.id === id ? data : cell));
        setFilteredCells(prev => prev.map(cell => cell.id === id ? data : cell));
      }
      
      toast({
        title: "Sucesso",
        description: "Célula atualizada com sucesso! - Sistema Matheus Pastorini"
      });
      
      return data;
    } catch (error) {
      console.error('useCells: Erro ao atualizar célula:', error);
      throw error;
    }
  };

  const deleteCell = async (id: string) => {
    try {
      console.log('useCells: Deletando célula:', id);
      
      const { error } = await supabase
        .from('cells')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('useCells: Erro ao deletar célula:', error);
        throw error;
      }

      console.log('useCells: Célula deletada com sucesso');
      
      if (mountedRef.current) {
        setCells(prev => prev.filter(cell => cell.id !== id));
        setFilteredCells(prev => prev.filter(cell => cell.id !== id));
      }
      
      toast({
        title: "Sucesso",
        description: "Célula deletada com sucesso! - Sistema Matheus Pastorini"
      });
    } catch (error) {
      console.error('useCells: Erro ao deletar célula:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('useCells: Hook inicializando...');
    mountedRef.current = true;
    fetchCells();

    return () => {
      console.log('useCells: Limpando hook...');
      mountedRef.current = false;
    };
  }, []);

  return {
    cells: filteredCells,
    loading,
    fetchCells,
    addCell,
    updateCell,
    deleteCell,
    applyFilters
  };
};
