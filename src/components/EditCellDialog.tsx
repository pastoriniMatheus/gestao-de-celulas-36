
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCities } from "@/hooks/useCities";
import { useNeighborhoods } from "@/hooks/useNeighborhoods";
import type { Cell } from "@/hooks/useCells";

interface Leader {
  id: string;
  name: string;
}

interface EditCellDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cell: Cell;
  onCellUpdated: (cell: Cell) => void;
}

export const EditCellDialog = ({
  isOpen,
  onClose,
  cell,
  onCellUpdated,
}: EditCellDialogProps) => {
  const { cities } = useCities();
  const [selectedCityId, setSelectedCityId] = useState('');
  const { neighborhoods } = useNeighborhoods(selectedCityId);
  
  const [formState, setFormState] = useState<Partial<Cell>>({});
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [saving, setSaving] = useState(false);

  // Inicializar formState quando o dialog abrir ou célula mudar
  useEffect(() => {
    if (isOpen && cell) {
      console.log('EditCellDialog: Inicializando form com célula:', cell);
      setFormState({
        name: cell.name,
        address: cell.address,
        leader_id: cell.leader_id,
        neighborhood_id: cell.neighborhood_id,
        active: cell.active,
        meeting_day: cell.meeting_day,
        meeting_time: cell.meeting_time,
      });
    }
  }, [isOpen, cell]);

  useEffect(() => {
    const fetchLeaders = async () => {
      if (!isOpen) return;
      
      console.log('EditCellDialog: Buscando líderes...');
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name")
        .in("role", ["admin", "leader"])
        .eq("active", true);

      if (error) {
        console.error('EditCellDialog: Erro ao buscar líderes:', error);
        toast({
          title: "Erro ao buscar líderes.",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('EditCellDialog: Líderes encontrados:', data);
        setLeaders(data || []);
      }
    };

    const fetchCellNeighborhoodCity = async () => {
      if (!isOpen || !cell?.neighborhood_id) return;
      
      console.log('EditCellDialog: Buscando cidade do bairro...');
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('city_id')
        .eq('id', cell.neighborhood_id)
        .single();
      
      if (!error && data) {
        console.log('EditCellDialog: Cidade encontrada:', data.city_id);
        setSelectedCityId(data.city_id);
      }
    };

    if (isOpen) {
      fetchLeaders();
      fetchCellNeighborhoodCity();
    }
  }, [isOpen, cell?.neighborhood_id]);

  const handleChange = (field: string, value: any) => {
    console.log('EditCellDialog: Alterando campo:', field, 'para:', value);
    setFormState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('EditCellDialog: Iniciando submissão com dados:', formState);
    
    if (!formState.name?.trim()) {
      toast({ 
        title: "Erro",
        description: "Nome da célula é obrigatório.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formState.address?.trim()) {
      toast({ 
        title: "Erro",
        description: "Endereço da célula é obrigatório.",
        variant: "destructive"
      });
      return;
    }
    
    if (formState.meeting_day === undefined || formState.meeting_day === null) {
      toast({ 
        title: "Erro",
        description: "Informe o dia da reunião.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formState.meeting_time) {
      toast({ 
        title: "Erro",
        description: "Informe o horário da reunião.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name: formState.name.trim(),
        address: formState.address.trim(),
        leader_id: formState.leader_id || null,
        neighborhood_id: formState.neighborhood_id || null,
        active: formState.active !== undefined ? formState.active : true,
        meeting_day: Number(formState.meeting_day),
        meeting_time: formState.meeting_time,
        updated_at: new Date().toISOString()
      };

      console.log('EditCellDialog: Enviando dados para atualização:', updateData);

      const { data, error } = await supabase
        .from("cells")
        .update(updateData)
        .eq("id", cell.id)
        .select()
        .single();

      if (error) {
        console.error('EditCellDialog: Erro ao atualizar célula:', error);
        toast({
          title: "Erro ao atualizar a célula.",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('EditCellDialog: Célula atualizada com sucesso:', data);
      
      toast({
        title: "Sucesso",
        description: "Célula atualizada com sucesso!",
      });
      
      // Chamar callback para atualizar a lista
      onCellUpdated(data);
      onClose();
      
    } catch (error: any) {
      console.error('EditCellDialog: Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: error?.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Editar Célula</AlertDialogTitle>
          <AlertDialogDescription>
            Atualize os dados da célula - Sistema desenvolvido por Matheus Pastorini.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formState.name || ""}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Endereço *</Label>
            <Input
              type="text"
              id="address"
              name="address"
              value={formState.address || ""}
              onChange={(e) => handleChange('address', e.target.value)}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Cidade</Label>
            <Select 
              value={selectedCityId || "none"} 
              onValueChange={(value) => {
                const cityId = value === "none" ? "" : value;
                setSelectedCityId(cityId);
                handleChange('neighborhood_id', '');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Selecione uma cidade</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name} - {city.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Bairro</Label>
            <Select 
              value={formState.neighborhood_id || "none"} 
              onValueChange={(value) => handleChange('neighborhood_id', value === "none" ? "" : value)}
              disabled={!selectedCityId}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedCityId ? "Selecione o bairro" : "Primeiro selecione uma cidade"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum bairro</SelectItem>
                {neighborhoods.map((neighborhood) => (
                  <SelectItem key={neighborhood.id} value={neighborhood.id}>
                    {neighborhood.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Líder da Célula</Label>
            <Select 
              value={formState.leader_id || "none"} 
              onValueChange={(value) => handleChange('leader_id', value === "none" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um líder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum líder</SelectItem>
                {leaders.map((leader) => (
                  <SelectItem key={leader.id} value={leader.id}>
                    {leader.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meeting_day">Dia da reunião *</Label>
            <Select 
              value={formState.meeting_day !== undefined && formState.meeting_day !== null ? String(formState.meeting_day) : "day_none"} 
              onValueChange={(value) => handleChange('meeting_day', value === "day_none" ? null : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dia da semana" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day_none">Selecione o dia</SelectItem>
                {weekDays.map((day, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meeting_time">Horário da reunião *</Label>
            <Input
              type="time"
              id="meeting_time"
              name="meeting_time"
              value={formState.meeting_time || ""}
              onChange={(e) => handleChange('meeting_time', e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formState.active !== undefined ? formState.active : true}
              onChange={(e) => handleChange('active', e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="active">Ativo</Label>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
