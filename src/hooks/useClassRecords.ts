
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ClassRecord {
  id: string;
  worship_date: string;
  class: string;
  teacher_1?: string;
  teacher_2?: string;
  lesson_id?: string;
  lesson_title?: string;
  total_members: number;
  total_visitors: number;
  created_at: string;
  updated_at: string;
}

export interface ChildAttendance {
  id: string;
  class_record_id: string;
  child_id: string;
  child_name?: string;
  present: boolean;
  type: string;
}

export const useClassRecords = () => {
  const [records, setRecords] = useState<ClassRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('class_records')
        .select(`
          *,
          lessons!lesson_id(title)
        `)
        .order('worship_date', { ascending: false });

      if (error) throw error;

      const recordsWithLessons = data?.map(record => ({
        ...record,
        lesson_title: record.lessons?.title || 'Não informado'
      })) || [];

      setRecords(recordsWithLessons);
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar registros de aula",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveClassRecord = async (
    recordData: Omit<ClassRecord, 'id' | 'created_at' | 'updated_at' | 'lesson_title'>,
    attendances: Omit<ChildAttendance, 'id' | 'class_record_id'>[]
  ) => {
    try {
      // Criar registro da aula
      const { data: classRecord, error: recordError } = await supabase
        .from('class_records')
        .insert([recordData])
        .select()
        .single();

      if (recordError) throw recordError;

      // Salvar presenças
      const attendanceData = attendances.map(attendance => ({
        ...attendance,
        class_record_id: classRecord.id
      }));

      const { error: attendanceError } = await supabase
        .from('child_attendance')
        .insert(attendanceData);

      if (attendanceError) throw attendanceError;

      toast({
        title: "Sucesso",
        description: "Aula registrada com sucesso!"
      });

      await fetchRecords();
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar registro da aula",
        variant: "destructive"
      });
    }
  };

  const getAttendanceByRecord = async (recordId: string): Promise<ChildAttendance[]> => {
    try {
      const { data, error } = await supabase
        .from('child_attendance')
        .select(`
          *,
          children!child_id(name)
        `)
        .eq('class_record_id', recordId);

      if (error) throw error;

      return data?.map(att => ({
        ...att,
        child_name: att.children?.name || 'Não informado'
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar presenças:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return {
    records,
    loading,
    saveClassRecord,
    getAttendanceByRecord,
    refetch: fetchRecords
  };
};
