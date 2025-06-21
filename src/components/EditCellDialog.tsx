
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
      
      // Buscar dados completos da célula com joins
      const fetchCellData = async () => {
        try {
          console.log('EditCellDialog: Buscando dados completos da célula:', cell.id);
          
          const { data, error } = await supabase
            .from('cells')
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
            .eq('id', cell.id)
            .single();

          if (error) {
            console.error('EditCellDialog: Erro ao buscar dados da célula:', error);
            return;
          }

          console.log('EditCellDialog: Dados completos da célula carregados:', data);

          const cityId = data.neighborhoods?.cities?.id || '';
          
          setFormState({
            name: data.name || '',
            address: data.address || '',
            leader_id: data.leader_id || '',
            neighborhood_id: data.neighborhood_id || '',
            active: data.active !== undefined ? data.active : true,
            meeting_day: data.meeting_day !== undefined ? data.meeting_day : null,
            meeting_time: data.meeting_time || '',
          });
          
          console.log('EditCellDialog: FormState inicializado:', {
            name: data.name,
            address: data.address,
            leader_id: data.leader_id,
            neighborhood_id: data.neighborhood_id,
            cityId: cityId
          });
          
          setSelectedCityId(cityId);
          
        } catch (error) {
          console.error('EditCellDialog: Erro inesperado ao buscar dados:', error);
        }
      };

      fetchCellData();
    }
  }, [isOpen, cell]);

  useEffect(() => {
    const fetchLeaders = async () => {
      if (!isOpen) return;
      
      try {
        console.log('EditCellDialog: Buscando líderes...');
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name")
          .in("role", ["admin", "leader"])
          .eq("active", true)
          .order("name");

        if (error) {
          console.error('EditCellDialog: Erro ao buscar líderes:', error);
          toast({
            title: "Erro ao buscar líderes.",
            description: error.message,
            variant: "destructive",
          });
          setLeaders([]);
        } else {
          console.log('EditCellDialog: Líderes encontrados:', data);
          setLeaders(data || []);
        }
      } catch (error) {
        console.error('EditCellDialog: Erro inesperado ao buscar líderes:', error);
        setLeaders([]);
      }
    };

    if (isOpen) {
      fetchLeaders();
    }
  }, [isOpen]);

  const handleChange = (field: string, value: any) => {
    console.log('EditCellDialog: Alterando campo:', field, 'para:', value);
    setFormState((prevState) => {
      const newState = {
        ...prevState,
        [field]: value,
      };
      console.log('EditCellDialog: Novo estado do form:', newState);
      return newState;
    });
  };

  const handleCityChange = (cityId: string) => {
    const newCityId = cityId === "none" ? "" : cityId;
    console.log('EditCellDialog: Alterando cidade para:', newCityId);
    setSelectedCityId(newCityId);
    handleChange('neighborhood_id', ''); // Limpar bairro quando cidade muda
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('EditCellDialog: Iniciando submissão com dados:', formState);
    console.log('EditCellDialog: ID da célula:', cell.id);
    
    // Validações
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
    
    if (!formState.meeting_time?.trim()) {
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

      console.log('EditCellDialog: Dados para atualização preparados:', updateData);
      console.log('EditCellDialog: Atualizando célula com ID:', cell.id);

      // Primeira tentativa: atualização direta
      const { data: updateResult, error: updateError } = await supabase
        .from("cells")
        .update(updateData)
        .eq("id", cell.id)
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
        .single();

      console.log('EditCellDialog: Resultado da atualização:', { updateResult, updateError });

      if (updateError) {
        console.error('EditCellDialog: Erro na primeira tentativa de atualização:', updateError);
        
        // Segunda tentativa: verificar se a célula existe
        const { data: cellExists, error: checkError } = await supabase
          .from("cells")
          .select("id, name")
          .eq("id", cell.id)
          .single();
          
        console.log('EditCellDialog: Verificação de existência:', { cellExists, checkError });
        
        if (checkError || !cellExists) {
          throw new Error(`Célula não encontrada: ${checkError?.message || 'ID inválido'}`);
        }
        
        // Terceira tentativa: atualização simples sem joins
        const { error: simpleUpdateError } = await supabase
          .from("cells")
          .update(updateData)
          .eq("id", cell.id);
          
        if (simpleUpdateError) {
          console.error('EditCellDialog: Erro na atualização simples:', simpleUpdateError);
          throw simpleUpdateError;
        }
        
        console.log('EditCellDialog: Atualização simples bem-sucedida, buscando dados atualizados...');
        
        // Buscar dados atualizados
        const { data: updatedData, error: fetchError } = await supabase
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
          throw fetchError;
        }
        
        console.log('EditCellDialog: Dados atualizados obtidos:', updatedData);
        
        // Transformar dados para o formato esperado
        const transformedData = {
          ...updatedData,
          leader_name: updatedData.profiles?.name || null,
          neighborhood_name: updatedData.neighborhoods?.name || null,
          city_id: updatedData.neighborhoods?.cities?.id || null,
          city_name: updatedData.neighborhoods?.cities?.name || null
        };
        
        toast({
          title: "Sucesso",
          description: "Célula atualizada com sucesso! - Sistema desenvolvido por Matheus Pastorini",
        });
        
        // Chamar callback para atualizar a lista
        onCellUpdated(transformedData);
        onClose();
        return;
      }

      console.log('EditCellDialog: Atualização bem-sucedida na primeira tentativa:', updateResult);
      
      // Transformar dados para o formato esperado
      const transformedData = {
        ...updateResult,
        leader_name: updateResult.profiles?.name || null,
        neighborhood_name: updateResult.neighborhoods?.name || null,
        city_id: updateResult.neighborhoods?.cities?.id || null,
        city_name: updateResult.neighborhoods?.cities?.name || null
      };
      
      console.log('EditCellDialog: Dados transformados:', transformedData);
      
      toast({
        title: "Sucesso",
        description: "Célula atualizada com sucesso! - Sistema desenvolvido por Matheus Pastorini",
      });
      
      // Chamar callback para atualizar a lista
      onCellUpdated(transformedData);
      onClose();
      
    } catch (error: any) {
      console.error('EditCellDialog: Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: `Erro ao salvar: ${error?.message || "Tente novamente"}`,
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
              onValueChange={handleCityChange}
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
