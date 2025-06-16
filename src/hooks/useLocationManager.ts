
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface City {
  id: string;
  name: string;
  state: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Neighborhood {
  id: string;
  name: string;
  city_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useLocationManager = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [citiesData, neighborhoodsData] = await Promise.all([
        supabase.from('cities').select('*').order('name'),
        supabase.from('neighborhoods').select('*').order('name')
      ]);

      if (citiesData.error) throw citiesData.error;
      if (neighborhoodsData.error) throw neighborhoodsData.error;

      setCities(citiesData.data || []);
      setNeighborhoods(neighborhoodsData.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const forceDeleteCity = async (id: string) => {
    try {
      // Primeiro, deletar todos os bairros da cidade
      const { error: neighborhoodsError } = await supabase
        .from('neighborhoods')
        .delete()
        .eq('city_id', id);

      if (neighborhoodsError) {
        console.error('Erro ao deletar bairros:', neighborhoodsError);
      }

      // Remover referências em contatos
      const { error: contactsError } = await supabase
        .from('contacts')
        .update({ city_id: null })
        .eq('city_id', id);

      if (contactsError) {
        console.error('Erro ao atualizar contatos:', contactsError);
      }

      // Finalmente, deletar a cidade
      const { error: cityError } = await supabase
        .from('cities')
        .delete()
        .eq('id', id);

      if (cityError) {
        console.error('Erro ao deletar cidade:', cityError);
        throw cityError;
      }

      toast({
        title: "Sucesso",
        description: "Cidade e todos os dados relacionados foram removidos!"
      });

      fetchData();
    } catch (error) {
      console.error('Erro ao deletar cidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar cidade. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const forceDeleteNeighborhood = async (id: string, name: string) => {
    try {
      // Primeiro, atualizar contatos que usam este bairro
      const { error: contactsError } = await supabase
        .from('contacts')
        .update({ neighborhood: '' })
        .eq('neighborhood', name);

      if (contactsError) {
        console.error('Erro ao atualizar contatos:', contactsError);
      }

      // Remover referências de células
      const { error: cellsError } = await supabase
        .from('cells')
        .update({ neighborhood_id: null })
        .eq('neighborhood_id', id);

      if (cellsError) {
        console.error('Erro ao atualizar células:', cellsError);
      }

      // Finalmente, deletar o bairro
      const { error: neighborhoodError } = await supabase
        .from('neighborhoods')
        .delete()
        .eq('id', id);

      if (neighborhoodError) {
        console.error('Erro ao deletar bairro:', neighborhoodError);
        throw neighborhoodError;
      }

      toast({
        title: "Sucesso",
        description: "Bairro e todas as referências foram removidos!"
      });

      fetchData();
    } catch (error) {
      console.error('Erro ao deletar bairro:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar bairro. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const addCity = async (cityData: Omit<City, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .insert([cityData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cidade adicionada com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar cidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar cidade",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addNeighborhood = async (neighborhoodData: Omit<Neighborhood, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('neighborhoods')
        .insert([neighborhoodData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Bairro adicionado com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar bairro:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar bairro",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchData();

    // Real-time updates
    const channel = supabase
      .channel('location-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cities'
        },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'neighborhoods'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    cities,
    neighborhoods,
    loading,
    forceDeleteCity,
    forceDeleteNeighborhood,
    addCity,
    addNeighborhood,
    refreshData: fetchData
  };
};
