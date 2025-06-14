
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Edit } from 'lucide-react';
import { useCells } from '@/hooks/useCells';
import { useToast } from '@/hooks/use-toast';

interface Cell {
  id: string;
  name: string;
  address: string;
  meeting_day: number;
  meeting_time: string;
  leader_id?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface EditCellDialogProps {
  cell: Cell;
}

export const EditCellDialog = ({ cell }: EditCellDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: cell.name,
    address: cell.address,
    meeting_day: cell.meeting_day.toString(),
    meeting_time: cell.meeting_time,
    leader_id: cell.leader_id || 'no-leader',
    active: cell.active
  });
  
  const { updateCell } = useCells();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.meeting_day || !formData.meeting_time) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await updateCell(cell.id, {
        name: formData.name,
        address: formData.address,
        meeting_day: parseInt(formData.meeting_day),
        meeting_time: formData.meeting_time,
        leader_id: formData.leader_id === 'no-leader' ? undefined : formData.leader_id,
        active: formData.active
      });

      toast({
        title: "Sucesso",
        description: "Célula atualizada com sucesso!",
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar célula:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar célula. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const weekDays = [
    { value: '0', label: 'Domingo' },
    { value: '1', label: 'Segunda-feira' },
    { value: '2', label: 'Terça-feira' },
    { value: '3', label: 'Quarta-feira' },
    { value: '4', label: 'Quinta-feira' },
    { value: '5', label: 'Sexta-feira' },
    { value: '6', label: 'Sábado' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Célula</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Célula *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Célula Esperança"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="address">Endereço *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Endereço completo"
              required
            />
          </div>

          <div>
            <Label htmlFor="meeting_day">Dia da Reunião *</Label>
            <Select 
              value={formData.meeting_day} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, meeting_day: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dia da semana" />
              </SelectTrigger>
              <SelectContent>
                {weekDays.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="meeting_time">Horário da Reunião *</Label>
            <Input
              id="meeting_time"
              type="time"
              value={formData.meeting_time}
              onChange={(e) => setFormData(prev => ({ ...prev, meeting_time: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="leader_id">Líder (Opcional)</Label>
            <Select 
              value={formData.leader_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, leader_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um líder (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-leader">Nenhum líder</SelectItem>
                {/* Note: You would need to add leaders data here when available */}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
            />
            <Label htmlFor="active">Célula ativa</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
