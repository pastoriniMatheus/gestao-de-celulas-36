
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
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Cell } from "@/hooks/useCells";

interface Leader {
  id: string;
  name: string;
}

interface Neighborhood {
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
  const [formState, setFormState] = useState<Partial<Cell>>({
    name: cell.name,
    address: cell.address,
    leader_id: cell.leader_id,
    neighborhood_id: cell.neighborhood_id,
    active: cell.active,
    meeting_day: cell.meeting_day,
    meeting_time: cell.meeting_time,
  });

  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("role", "leader")
        .eq("active", true);

      if (error) {
        toast({
          title: "Erro ao buscar líderes.",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setLeaders(data || []);
      }
    };

    const fetchNeighborhoods = async () => {
      const { data, error } = await supabase
        .from("neighborhoods")
        .select("id, name")
        .eq("active", true);

      if (error) {
        toast({
          title: "Erro ao buscar bairros.",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setNeighborhoods(data || []);
      }
    };

    if (isOpen) {
      fetchLeaders();
      fetchNeighborhoods();
    }
  }, [isOpen]);

  useEffect(() => {
    if (cell) {
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
  }, [cell]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
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
    
    if (!formState.leader_id) {
      toast({ 
        title: "Erro",
        description: "Selecione o líder da célula.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formState.neighborhood_id) {
      toast({ 
        title: "Erro",
        description: "Selecione o bairro da célula.",
        variant: "destructive"
      });
      return;
    }
    
    if (
      formState.meeting_day === undefined ||
      formState.meeting_day === null ||
      String(formState.meeting_day) === ""
    ) {
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
      console.log('EditCellDialog: Atualizando célula:', formState);
      
      const { data, error } = await supabase
        .from("cells")
        .update({
          name: formState.name,
          address: formState.address,
          leader_id: formState.leader_id,
          neighborhood_id: formState.neighborhood_id,
          active: formState.active,
          meeting_day: Number(formState.meeting_day),
          meeting_time: formState.meeting_time,
        })
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
              name="name"
              value={formState.name || ""}
              onChange={handleChange}
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
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label className="block font-medium">Líder da Célula *</Label>
            <select
              required
              name="leader_id"
              value={formState.leader_id || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 bg-white"
            >
              <option value="" disabled>
                Selecione um líder
              </option>
              {leaders.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="block font-medium">Bairro *</Label>
            <select
              required
              name="neighborhood_id"
              value={formState.neighborhood_id || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 bg-white"
            >
              <option value="" disabled>
                Selecione um bairro
              </option>
              {neighborhoods.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="meeting_day">Dia da reunião *</Label>
            <select
              id="meeting_day"
              name="meeting_day"
              value={
                formState.meeting_day !== undefined && formState.meeting_day !== null
                  ? String(formState.meeting_day)
                  : ""
              }
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 bg-white"
            >
              <option value="" disabled>
                Selecione o dia da semana
              </option>
              <option value="0">Domingo</option>
              <option value="1">Segunda-feira</option>
              <option value="2">Terça-feira</option>
              <option value="3">Quarta-feira</option>
              <option value="4">Quinta-feira</option>
              <option value="5">Sexta-feira</option>
              <option value="6">Sábado</option>
            </select>
          </div>
          <div>
            <Label htmlFor="meeting_time">Horário da reunião *</Label>
            <Input
              type="time"
              id="meeting_time"
              name="meeting_time"
              value={formState.meeting_time || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formState.active || false}
              onChange={handleChange}
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
