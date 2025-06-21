
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
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    leader_id: '',
    neighborhood_id: '',
    active: true,
    meeting_day: 0,
    meeting_time: '',
  });
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [saving, setSaving] = useState(false);

  // Inicializar dados do formulário
  useEffect(() => {
    if (isOpen && cell) {
      console.log('EditCellDialog: Inicializando formulário com célula:', cell);
      
      setFormData({
        name: cell.name || '',
        address: cell.address || '',
        leader_id: cell.leader_id || '',
        neighborhood_id: cell.neighborhood_id || '',
        active: cell.active !== undefined ? cell.active : true,
        meeting_day: cell.meeting_day !== undefined ? cell.meeting_day : 0,
        meeting_time: cell.meeting_time || '',
      });
      
      // Definir cidade selecionada
      if (cell.city_id) {
        setSelectedCityId(cell.city_id);
      }
    }
  }, [isOpen, cell]);

  // Buscar líderes
  useEffect(() => {
    const fetchLeaders = async () => {
      if (!isOpen) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name")
          .in("role", ["admin", "leader"])
          .eq("active", true)
          .order("name");

        if (error) {
          console.error('Erro ao buscar líderes:', error);
          setLeaders([]);
        } else {
          setLeaders(data || []);
        }
      } catch (error) {
        console.error('Erro inesperado ao buscar líderes:', error);
        setLeaders([]);
      }
    };

    fetchLeaders();
  }, [isOpen]);

  const handleInputChange = (field: string, value: any) => {
    console.log(`Alterando ${field} para:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    // Limpar bairro quando cidade muda
    setFormData(prev => ({
      ...prev,
      neighborhood_id: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('EditCellDialog: Iniciando salvamento com dados:', formData);
    
    // Validações básicas
    if (!formData.name?.trim()) {
      toast({ 
        title: "Erro",
        description: "Nome da célula é obrigatório.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.address?.trim()) {
      toast({ 
        title: "Erro",
        description: "Endereço da célula é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Preparar dados para atualização
      const updateData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        leader_id: formData.leader_id || null,
        neighborhood_id: formData.neighborhood_id || null,
        active: formData.active,
        meeting_day: Number(formData.meeting_day),
        meeting_time: formData.meeting_time,
        updated_at: new Date().toISOString()
      };

      console.log('EditCellDialog: Atualizando célula ID:', cell.id);
      console.log('EditCellDialog: Dados de atualização:', updateData);

      // Realizar atualização
      const { error: updateError } = await supabase
        .from("cells")
        .update(updateData)
        .eq("id", cell.id);

      if (updateError) {
        console.error('EditCellDialog: Erro na atualização:', updateError);
        throw updateError;
      }

      console.log('EditCellDialog: Atualização realizada com sucesso');

      // Buscar dados atualizados com joins
      const { data: updatedCell, error: fetchError } = await supabase
        .from("cells")
        .select(`
          *,
          neighborhoods!cells_neighborhood_id_fkey (
            id,
            name,
            city_id,
            cities!neighborhoods_city_id_fkey (
              id,
              name,
              state
            )
          ),
          profiles!cells_leader_id_fkey (
            id,
            name
          )
        `)
        .eq("id", cell.id)
        .single();

      if (fetchError) {
        console.error('EditCellDialog: Erro ao buscar dados atualizados:', fetchError);
        // Mesmo com erro na busca, a atualização foi feita
        toast({
          title: "Sucesso",
          description: "Célula atualizada com sucesso!",
        });
        onClose();
        return;
      }

      console.log('EditCellDialog: Dados atualizados obtidos:', updatedCell);

      // Transformar dados para o formato esperado
      const transformedData = {
        ...updatedCell,
        leader_name: updatedCell.profiles?.name || null,
        neighborhood_name: updatedCell.neighborhoods?.name || null,
        city_id: updatedCell.neighborhoods?.cities?.id || null,
        city_name: updatedCell.neighborhoods?.cities?.name || null
      };

      toast({
        title: "Sucesso",
        description: "Célula atualizada com sucesso!",
      });

      // Notificar componente pai sobre a atualização
      onCellUpdated(transformedData);
      onClose();
      
    } catch (error: any) {
      console.error('EditCellDialog: Erro inesperado:', error);
      toast({
        title: "Erro",
        description: `Erro ao salvar célula: ${error?.message || "Erro desconhecido"}`,
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
            Atualize os dados da célula.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="address">Endereço *</Label>
            <Input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Cidade</Label>
            <Select 
              value={selectedCityId} 
              onValueChange={handleCityChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma cidade</SelectItem>
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
              value={formData.neighborhood_id} 
              onValueChange={(value) => handleInputChange('neighborhood_id', value)}
              disabled={!selectedCityId}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedCityId ? "Selecione o bairro" : "Primeiro selecione uma cidade"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum bairro</SelectItem>
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
              value={formData.leader_id} 
              onValueChange={(value) => handleInputChange('leader_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um líder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum líder</SelectItem>
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
              value={String(formData.meeting_day)} 
              onValueChange={(value) => handleInputChange('meeting_day', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dia da semana" />
              </SelectTrigger>
              <SelectContent>
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
              value={formData.meeting_time}
              onChange={(e) => handleInputChange('meeting_time', e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleInputChange('active', e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="active">Ativo</Label>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving} type="button">Cancelar</AlertDialogCancel>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
