
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Home, MapPin, Calendar, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthProvider';

export const CellsManager = () => {
  const [cells, setCells] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    meeting_day: 1,
    meeting_time: '19:00',
    leader_id: '',
    active: true
  });
  
  const { toast } = useToast();
  const { userProfile } = useAuth();

  // Verificar permissões
  const canManage = userProfile?.role === 'admin' || userProfile?.role === 'leader';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchCells(), fetchLeaders()]);
  };

  const fetchCells = async () => {
    try {
      console.log('Buscando células...');
      
      const { data, error } = await supabase
        .from('cells')
        .select(`
          *,
          profiles!cells_leader_id_fkey (
            id,
            name,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar células:', error);
        toast({
          title: "Erro ao carregar células",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Células encontradas:', data);
      setCells(data || []);
    } catch (error) {
      console.error('Erro na consulta de células:', error);
      toast({
        title: "Erro ao carregar células",
        description: "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  const fetchLeaders = async () => {
    try {
      console.log('Buscando líderes...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'leader'])
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Erro ao buscar líderes:', error);
        toast({
          title: "Erro ao carregar líderes",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Líderes encontrados:', data);
      setLeaders(data || []);
    } catch (error) {
      console.error('Erro na consulta de líderes:', error);
      toast({
        title: "Erro ao carregar líderes",
        description: "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const cellData = {
        name: formData.name,
        address: formData.address,
        meeting_day: formData.meeting_day,
        meeting_time: formData.meeting_time,
        leader_id: formData.leader_id || null,
        active: formData.active
      };

      if (editingCell) {
        const { error } = await supabase
          .from('cells')
          .update(cellData)
          .eq('id', editingCell.id);

        if (error) throw error;

        toast({
          title: "Célula atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('cells')
          .insert([cellData]);

        if (error) throw error;

        toast({
          title: "Célula criada com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingCell(null);
      setFormData({
        name: '',
        address: '',
        meeting_day: 1,
        meeting_time: '19:00',
        leader_id: '',
        active: true
      });
      fetchCells();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar célula",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (cell: any) => {
    setEditingCell(cell);
    setFormData({
      name: cell.name,
      address: cell.address,
      meeting_day: cell.meeting_day,
      meeting_time: cell.meeting_time,
      leader_id: cell.leader_id || '',
      active: cell.active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (cellId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta célula?')) return;

    try {
      const { error } = await supabase
        .from('cells')
        .delete()
        .eq('id', cellId);

      if (error) throw error;

      toast({
        title: "Célula excluída com sucesso!",
      });
      
      fetchCells();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir célula",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getDayName = (day: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[day] || `Dia ${day}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando células...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                Gerenciamento de Células
              </CardTitle>
              <CardDescription>
                Gerencie as células da igreja
              </CardDescription>
            </div>
            {canManage && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingCell(null);
                    setFormData({
                      name: '',
                      address: '',
                      meeting_day: 1,
                      meeting_time: '19:00',
                      leader_id: '',
                      active: true
                    });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Célula
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
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
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="meeting_day">Dia da Reunião</Label>
                      <Select value={formData.meeting_day.toString()} onValueChange={(value) => setFormData({ ...formData, meeting_day: parseInt(value) })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Domingo</SelectItem>
                          <SelectItem value="1">Segunda-feira</SelectItem>
                          <SelectItem value="2">Terça-feira</SelectItem>
                          <SelectItem value="3">Quarta-feira</SelectItem>
                          <SelectItem value="4">Quinta-feira</SelectItem>
                          <SelectItem value="5">Sexta-feira</SelectItem>
                          <SelectItem value="6">Sábado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="meeting_time">Horário</Label>
                      <Input
                        id="meeting_time"
                        type="time"
                        value={formData.meeting_time}
                        onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="leader_id">Líder</Label>
                      <Select value={formData.leader_id} onValueChange={(value) => setFormData({ ...formData, leader_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um líder" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sem líder</SelectItem>
                          {leaders.map((leader) => (
                            <SelectItem key={leader.id} value={leader.id}>
                              {leader.name} ({leader.role === 'admin' ? 'Admin' : 'Líder'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="active"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      />
                      <Label htmlFor="active">Ativa</Label>
                    </div>
                    <Button type="submit" className="w-full">
                      {editingCell ? 'Atualizar' : 'Criar'} Célula
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {cells.length === 0 ? (
            <div className="text-center py-8">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma célula encontrada.</p>
              {canManage && (
                <p className="text-sm text-gray-400 mt-2">
                  Clique em "Nova Célula" para começar.
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Reunião</TableHead>
                  <TableHead>Líder</TableHead>
                  <TableHead>Status</TableHead>
                  {canManage && <TableHead>Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {cells.map((cell) => (
                  <TableRow key={cell.id}>
                    <TableCell className="font-medium">{cell.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{cell.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{getDayName(cell.meeting_day)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{cell.meeting_time}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cell.profiles ? (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{cell.profiles.name}</span>
                          <Badge variant={cell.profiles.role === 'admin' ? 'destructive' : 'default'} className="text-xs">
                            {cell.profiles.role === 'admin' ? 'Admin' : 'Líder'}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Sem líder</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cell.active ? 'default' : 'secondary'}>
                        {cell.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(cell)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(cell.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
