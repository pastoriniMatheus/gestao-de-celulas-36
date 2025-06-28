
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Material {
  id: string;
  file_name: string;
  category: string;
  file_url: string;
  file_type?: string;
  created_at: string;
  updated_at: string;
}

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar materiais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addMaterial = async (materialData: Omit<Material, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('materials')
        .insert([materialData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Material adicionado com sucesso!"
      });

      await fetchMaterials();
    } catch (error) {
      console.error('Erro ao adicionar material:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar material",
        variant: "destructive"
      });
    }
  };

  const updateMaterial = async (id: string, materialData: Partial<Material>) => {
    try {
      const { error } = await supabase
        .from('materials')
        .update(materialData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Material atualizado com sucesso!"
      });

      await fetchMaterials();
    } catch (error) {
      console.error('Erro ao atualizar material:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar material",
        variant: "destructive"
      });
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Material removido com sucesso!"
      });

      await fetchMaterials();
    } catch (error) {
      console.error('Erro ao deletar material:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover material",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  return {
    materials,
    loading,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    refetch: fetchMaterials
  };
};
