
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TeacherSchedule {
  id: string;
  worship_date: string;
  class: string;
  teacher_1?: string;
  teacher_2?: string;
  lesson_id?: string;
  lesson_title?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
}

export const useTeacherSchedules = () => {
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_schedules')
        .select(`
          *,
          lessons!lesson_id(title)
        `)
        .order('worship_date', { ascending: false });

      if (error) throw error;

      const schedulesWithLessons = data?.map(schedule => ({
        ...schedule,
        lesson_title: schedule.lessons?.title || 'Não informado'
      })) || [];

      setSchedules(schedulesWithLessons);
    } catch (error) {
      console.error('Erro ao buscar escalas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar escalas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = async (scheduleData: Omit<TeacherSchedule, 'id' | 'created_at' | 'updated_at' | 'lesson_title'>) => {
    try {
      const { error } = await supabase
        .from('teacher_schedules')
        .insert([scheduleData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Escala cadastrada com sucesso!"
      });

      await fetchSchedules();
    } catch (error) {
      console.error('Erro ao cadastrar escala:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar escala",
        variant: "destructive"
      });
    }
  };

  const updateSchedule = async (id: string, scheduleData: Partial<TeacherSchedule>) => {
    try {
      const { error } = await supabase
        .from('teacher_schedules')
        .update(scheduleData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Escala atualizada com sucesso!"
      });

      await fetchSchedules();
    } catch (error) {
      console.error('Erro ao atualizar escala:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar escala",
        variant: "destructive"
      });
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teacher_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Escala removida com sucesso!"
      });

      await fetchSchedules();
    } catch (error) {
      console.error('Erro ao deletar escala:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover escala",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return {
    schedules,
    loading,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    refetch: fetchSchedules
  };
};
