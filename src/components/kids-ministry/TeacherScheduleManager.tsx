
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { useTeacherSchedules, TeacherSchedule } from '@/hooks/useTeacherSchedules';
import { useLessons } from '@/hooks/useLessons';
import { format } from 'date-fns';

const CLASS_OPTIONS = ['Berçário', 'Jardim', 'Pré-Adolescentes', 'Adolescentes'];

export const TeacherScheduleManager = () => {
  const { schedules, loading, addSchedule, updateSchedule, deleteSchedule } = useTeacherSchedules();
  const { lessons } = useLessons();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TeacherSchedule | null>(null);
  const [formData, setFormData] = useState({
    worship_date: '',
    class: '',
    teacher_1: '',
    teacher_2: '',
    lesson_id: '',
    observations: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      lesson_id: formData.lesson_id || null
    };
    
    if (editingSchedule) {
      await updateSchedule(editingSchedule.id, submitData);
    } else {
      await addSchedule(submitData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (schedule: TeacherSchedule) => {
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

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover esta escala?')) {
      await deleteSchedule(id);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2">Carregando...</span>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold">Escala de Professoras</h2>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
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
                <Label htmlFor="worship_date">Data do Culto *</Label>
                <Input
                  id="worship_date"
                  type="date"
                  value={formData.worship_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, worship_date: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="class">Turma *</Label>
                <Select 
                  value={formData.class} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}
                >
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

              <div>
                <Label htmlFor="teacher_1">Professora 1</Label>
                <Input
                  id="teacher_1"
                  value={formData.teacher_1}
                  onChange={(e) => setFormData(prev => ({ ...prev, teacher_1: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="teacher_2">Professora 2</Label>
                <Input
                  id="teacher_2"
                  value={formData.teacher_2}
                  onChange={(e) => setFormData(prev => ({ ...prev, teacher_2: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="lesson">Lição</Label>
                <Select 
                  value={formData.lesson_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, lesson_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a lição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Não informado</SelectItem>
                    {lessons.map(lesson => (
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
                  onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingSchedule ? 'Atualizar' : 'Cadastrar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Escalas Cadastradas ({schedules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Professora 1</TableHead>
                <TableHead>Professora 2</TableHead>
                <TableHead>Lição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>{format(new Date(schedule.worship_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{schedule.class}</TableCell>
                  <TableCell>{schedule.teacher_1 || '-'}</TableCell>
                  <TableCell>{schedule.teacher_2 || '-'}</TableCell>
                  <TableCell>{schedule.lesson_title}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(schedule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {schedules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Nenhuma escala cadastrada ainda
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
