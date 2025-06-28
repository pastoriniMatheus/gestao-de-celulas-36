
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ClipboardCheck } from 'lucide-react';
import { useChildren } from '@/hooks/useChildren';
import { useTeacherSchedules } from '@/hooks/useTeacherSchedules';
import { useClassRecords, ChildAttendance } from '@/hooks/useClassRecords';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const CLASS_OPTIONS = ['Berçário', 'Jardim', 'Pré-Adolescentes', 'Adolescentes'];

export const ClassRecordManager = () => {
  const { children } = useChildren();
  const { schedules } = useTeacherSchedules();
  const { saveClassRecord } = useClassRecords();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [classChildren, setClassChildren] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<{ [key: string]: { present: boolean; type: string } }>({});

  useEffect(() => {
    if (selectedDate && selectedClass) {
      // Buscar escala para a data e turma selecionadas
      const schedule = schedules.find(s => 
        s.worship_date === selectedDate && s.class === selectedClass
      );
      setSelectedSchedule(schedule);

      // Filtrar crianças da turma selecionada
      const filteredChildren = children.filter(child => child.class === selectedClass);
      setClassChildren(filteredChildren);

      // Inicializar presenças
      const initialAttendances: { [key: string]: { present: boolean; type: string } } = {};
      filteredChildren.forEach(child => {
        initialAttendances[child.id] = {
          present: false,
          type: child.type
        };
      });
      setAttendances(initialAttendances);
    }
  }, [selectedDate, selectedClass, schedules, children]);

  const handleAttendanceChange = (childId: string, field: 'present' | 'type', value: boolean | string) => {
    setAttendances(prev => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        [field]: value
      }
    }));
  };

  const handleSaveClass = async () => {
    if (!selectedDate || !selectedClass) {
      toast({
        title: "Erro",
        description: "Selecione data e turma",
        variant: "destructive"
      });
      return;
    }

    const presentChildren = Object.entries(attendances).filter(([_, data]) => data.present);
    const totalMembers = presentChildren.filter(([_, data]) => data.type === 'Membro').length;
    const totalVisitors = presentChildren.filter(([_, data]) => data.type === 'Visitante').length;

    const classRecord = {
      worship_date: selectedDate,
      class: selectedClass,
      teacher_1: selectedSchedule?.teacher_1 || null,
      teacher_2: selectedSchedule?.teacher_2 || null,
      lesson_id: selectedSchedule?.lesson_id || null,
      total_members: totalMembers,
      total_visitors: totalVisitors
    };

    const attendanceRecords: Omit<ChildAttendance, 'id' | 'class_record_id'>[] = Object.entries(attendances).map(([childId, data]) => ({
      child_id: childId,
      present: data.present,
      type: data.type
    }));

    await saveClassRecord(classRecord, attendanceRecords);
    
    // Reset form
    setSelectedDate('');
    setSelectedClass('');
    setSelectedSchedule(null);
    setClassChildren([]);
    setAttendances({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-6 w-6 text-orange-600" />
        <h2 className="text-2xl font-bold">Registro de Aula</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Aula</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="class">Turma *</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a turma" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedSchedule && (
            <Card className="bg-blue-50">
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">Informações da Escala</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p><strong>Professora 1:</strong> {selectedSchedule.teacher_1 || 'Não informado'}</p>
                  <p><strong>Professora 2:</strong> {selectedSchedule.teacher_2 || 'Não informado'}</p>
                  <p><strong>Lição:</strong> {selectedSchedule.lesson_title}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {classChildren.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Presença - {selectedClass}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {classChildren.map((child) => (
                <div key={child.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={attendances[child.id]?.present || false}
                      onCheckedChange={(checked) => 
                        handleAttendanceChange(child.id, 'present', checked as boolean)
                      }
                    />
                    <div>
                      <p className="font-medium">{child.name}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(child.birth_date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <Select
                    value={attendances[child.id]?.type || child.type}
                    onValueChange={(value) => handleAttendanceChange(child.id, 'type', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Membro">Membro</SelectItem>
                      <SelectItem value="Visitante">Visitante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600">
                  Presentes: {Object.values(attendances).filter(a => a.present).length} / {classChildren.length}
                </div>
                <Button onClick={handleSaveClass} className="px-8">
                  Salvar Aula
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedDate && selectedClass && classChildren.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              Nenhuma criança encontrada para a turma {selectedClass}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
