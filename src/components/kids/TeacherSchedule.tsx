
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, Calendar, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function TeacherSchedule() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [formData, setFormData] = useState({
    worship_date: '',
    class: '',
    teacher_1: '',
    teacher_2: '',
    lesson_id: '',
    observations: ''
  });

  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['teacher_schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_schedules')
        .select(`
          *,
          lesson:lessons(title)
        `)
        .order('worship_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, category')
        .order('title');
      
      if (error) throw error;
      return data;
    }
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      const { data, error } = await supabase
        .from('teacher_schedules')
        .insert([scheduleData])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher_schedules'] });
      toast.success('Escala criada com sucesso!');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Erro ao criar escala: ' + error.message);
    }
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, ...scheduleData }: any) => {
      const { data, error } = await supabase
        .from('teacher_schedules')
        .update(scheduleData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher_schedules'] });
      toast.success('Escala atualizada com sucesso!');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Erro ao atualizar escala: ' + error.message);
    }
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('teacher_schedules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher_schedules'] });
      toast.success('Escala removida com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover escala: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      worship_date: '',
      class: '',
      teacher_1: '',
      teacher_2: '',
      lesson_id: '',
      observations: ''
    });
    setEditingSchedule(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSchedule) {
      updateScheduleMutation.mutate({ id: editingSchedule.id, ...formData });
    } else {
      createScheduleMutation.mutate(formData);
    }
  };

  const handleEdit = (schedule: any) => {
    setEditingSchedule(schedule);
    setFormData({
      worship_date: schedule.worship_date,
      class: schedule.class,
      teacher_1: schedule.teacher_1 || '',
      teacher_2: schedule.teacher_2 || '',
      lesson_id: schedule.lesson_id || '',
      observations: schedule.observations || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta escala?')) {
      deleteScheduleMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-blue-700">Escala de Professoras</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Escala
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? 'Editar Escala' : 'Nova Escala'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="worship_date">Data do Culto</Label>
                <Input
                  id="worship_date"
                  type="date"
                  value={formData.worship_date}
                  onChange={(e) => setFormData({ ...formData, worship_date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="class">Turma</Label>
                <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Berçário">Berçário</SelectItem>
                    <SelectItem value="Jardim">Jardim</SelectItem>
                    <SelectItem value="Pré-Adolescentes">Pré-Adolescentes</SelectItem>
                    <SelectItem value="Adolescentes">Adolescentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="teacher_1">Professora 1</Label>
                <Input
                  id="teacher_1"
                  value={formData.teacher_1}
                  onChange={(e) => setFormData({ ...formData, teacher_1: e.target.value })}
                  placeholder="Nome da primeira professora"
                />
              </div>
              
              <div>
                <Label htmlFor="teacher_2">Professora 2</Label>
                <Input
                  id="teacher_2"
                  value={formData.teacher_2}
                  onChange={(e) => setFormData({ ...formData, teacher_2: e.target.value })}
                  placeholder="Nome da segunda professora"
                />
              </div>
              
              <div>
                <Label htmlFor="lesson_id">Lição</Label>
                <Select value={formData.lesson_id} onValueChange={(value) => setFormData({ ...formData, lesson_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a lição" />
                  </SelectTrigger>
                  <SelectContent>
                    {lessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        {lesson.title} ({lesson.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  placeholder="Observações opcionais"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {editingSchedule ? 'Atualizar' : 'Criar'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Professora 1</TableHead>
                <TableHead>Professora 2</TableHead>
                <TableHead>Lição</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhuma escala cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(schedule.worship_date).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {schedule.class}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        {schedule.teacher_1 || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        {schedule.teacher_2 || '-'}
                      </div>
                    </TableCell>
                    <TableCell>{schedule.lesson?.title || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(schedule)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(schedule.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
