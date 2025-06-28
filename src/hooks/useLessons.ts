
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Lesson {
  id: string;
  title: string;
  category: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useLessons = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('title');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Erro ao buscar lições:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lições",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addLesson = async (lessonData: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .insert([lessonData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Lição cadastrada com sucesso!"
      });

      await fetchLessons();
    } catch (error) {
      console.error('Erro ao cadastrar lição:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar lição",
        variant: "destructive"
      });
    }
  };

  const updateLesson = async (id: string, lessonData: Partial<Lesson>) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update(lessonData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Lição atualizada com sucesso!"
      });

      await fetchLessons();
    } catch (error) {
      console.error('Erro ao atualizar lição:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar lição",
        variant: "destructive"
      });
    }
  };

  const deleteLesson = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Lição removida com sucesso!"
      });

      await fetchLessons();
    } catch (error) {
      console.error('Erro ao deletar lição:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover lição",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  return {
    lessons,
    loading,
    addLesson,
    updateLesson,
    deleteLesson,
    refetch: fetchLessons
  };
};
