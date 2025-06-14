
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
];

export const EditCellDialog = ({ cell, isOpen, onOpenChange }: EditCellDialogProps) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [meetingDay, setMeetingDay] = useState<number | null>(null);
  const [meetingTime, setMeetingTime] = useState('');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const { updateCell } = useCells();
  const { toast } = useToast();

  useEffect(() => {
    if (cell) {
      setName(cell.name);
      setAddress(cell.address);
      setMeetingDay(cell.meeting_day);
      setMeetingTime(cell.meeting_time);
      setActive(cell.active);
    }
  }, [cell]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !address || meetingDay === null || !meetingTime) {
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
        name,
        address,
        meeting_day: meetingDay,
        meeting_time: meetingTime,
        active
      });

      toast({
        title: "Sucesso",
        description: "Célula atualizada com sucesso!",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar célula. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Célula</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nome da Célula *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Célula Centro"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="edit-address">Endereço *</Label>
            <Input
              id="edit-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua, número, bairro"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-meeting-day">Dia da Reunião *</Label>
            <Select onValueChange={(value) => setMeetingDay(parseInt(value))} value={meetingDay?.toString()}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dia da semana" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-meeting-time">Horário da Reunião *</Label>
            <Input
              id="edit-meeting-time"
              type="time"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="edit-active"
              checked={active}
              onCheckedChange={setActive}
            />
            <Label htmlFor="edit-active">Célula ativa</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
