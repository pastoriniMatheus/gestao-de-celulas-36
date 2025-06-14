
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users2, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Cell {
  id: string;
  name: string;
  leader_id: string | null;
  address: string;
  meeting_day: number;
  meeting_time: string;
  active: boolean;
  profiles?: {
    name: string;
  };
  contacts?: Contact[];
}

interface Contact {
  id: string;
  name: string;
  whatsapp: string | null;
}

interface Profile {
  id: string;
  name: string;
  role: string;
}

const DAYS_OF_WEEK = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

export const CellsManager = () => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [leaders, setLeaders] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<Cell | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    leader_id: '',
    address: '',
    meeting_day: '',
    meeting_time: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCells();
    fetchLeaders();
  }, []);

  const fetchCells = async () => {
    try {
      const { data, error } = await supabase
        .from('cells')
        .select(`
          *,
          profiles (
            name
          ),
          contacts (
            id,
            name,
            whatsapp
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCells(data || []);
    } catch (error) {
      console.error('Erro ao buscar células:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as células",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaders = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role')
        .in('role', ['leader', 'admin'])
        .eq('active', true)
        .order('name');

      if (error) throw error;

      setLeaders(data || []);
    } catch (error) {
      console.error('Erro ao buscar líderes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const cellData = {
        name: formData.name,
        leader_id: formData.leader_id || null,
        address: formData.address,
        meeting_day: parseInt(formData.meeting_day),
        meeting_time: formData.meeting_time,
        active: true
      };

      if (editingCell) {
        const { error } = await supabase
          .from('cells')
          .update(cellData)
          .eq('id', editingCell.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Célula atualizada com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('cells')
          .insert(cellData);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Célula criada com sucesso"
        });
      }
      
      fetchCells();
      setFormData({ name: '', leader_id: '', address: '', meeting_day: '', meeting_time: '' });
      setEditingCell(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar célula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a célula",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (cell: Cell) => {
    setEditingCell(cell);
    setFormData({ 
      name: cell.name, 
      leader_id: cell.leader_id || '',
      address: cell.address,
      meeting_day: cell.meeting_day.toString(),
      meeting_time: cell.meeting_time
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cells')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Célula excluída com sucesso"
      });
      
      fetchCells();
    } catch (error) {
      console.error('Erro ao deletar célula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a célula",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando células...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Células</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Célula
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCell ? 'Editar Célula' : 'Nova Célula'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Célula</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Digite o nome da célula"
                  required
                />
              </div>
              <div>
                <Label htmlFor="leader">Líder</Label>
                <Select value={formData.leader_id} onValueChange={(value) => setFormData({ ...formData, leader_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um líder" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaders.map((leader) => (
                      <SelectItem key={leader.id} value={leader.id}>
                        {leader.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Endereço completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="meeting_day">Dia da Reunião</Label>
                <Select value={formData.meeting_day} onValueChange={(value) => setFormData({ ...formData, meeting_day: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="meeting_time">Horário da Reunião</Label>
                <Input
                  id="meeting_time"
                  type="time"
                  value={formData.meeting_time}
                  onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingCell ? 'Atualizar' : 'Criar'} Célula
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cells.map((cell) => (
          <Card key={cell.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{cell.name}</CardTitle>
                <Badge variant="secondary">
                  {cell.contacts?.length || 0} membros
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Líder:</p>
                <p className="text-sm text-gray-600">
                  {cell.profiles?.name || 'Não definido'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Reunião:</p>
                <p className="text-sm text-gray-600">
                  {DAYS_OF_WEEK[cell.meeting_day]}s às {cell.meeting_time}
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">{cell.address}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users2 size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Membros:</span>
                </div>
                {cell.contacts && cell.contacts.length > 0 ? (
                  <div className="space-y-2">
                    {cell.contacts.map((member) => (
                      <div key={member.id} className="p-2 bg-gray-50 rounded text-sm">
                        <p className="font-medium">{member.name}</p>
                        {member.whatsapp && (
                          <p className="text-gray-600">{member.whatsapp}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Nenhum membro cadastrado</p>
                )}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(cell)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(cell.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
