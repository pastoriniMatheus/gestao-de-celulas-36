
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Child {
  id: string;
  name: string;
  birth_date: string;
  class: string;
  type: string;
  parent_contact_id?: string;
  parent_name?: string;
  created_at: string;
  updated_at: string;
}

export const useChildren = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select(`
          *,
          contacts!parent_contact_id(name)
        `)
        .order('name');

      if (error) throw error;

      const childrenWithParents = data?.map(child => ({
        ...child,
        parent_name: child.contacts?.name || 'Não informado'
      })) || [];

      setChildren(childrenWithParents);
    } catch (error) {
      console.error('Erro ao buscar crianças:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de crianças",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addChild = async (childData: Omit<Child, 'id' | 'created_at' | 'updated_at' | 'parent_name'>) => {
    try {
      const { error } = await supabase
        .from('children')
        .insert([childData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Criança cadastrada com sucesso!"
      });

      await fetchChildren();
    } catch (error) {
      console.error('Erro ao cadastrar criança:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar criança",
        variant: "destructive"
      });
    }
  };

  const updateChild = async (id: string, childData: Partial<Child>) => {
    try {
      const { error } = await supabase
        .from('children')
        .update(childData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Criança atualizada com sucesso!"
      });

      await fetchChildren();
    } catch (error) {
      console.error('Erro ao atualizar criança:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar criança",
        variant: "destructive"
      });
    }
  };

  const deleteChild = async (id: string) => {
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Criança removida com sucesso!"
      });

      await fetchChildren();
    } catch (error) {
      console.error('Erro ao deletar criança:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover criança",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  return {
    children,
    loading,
    addChild,
    updateChild,
    deleteChild,
    refetch: fetchChildren
  };
};
