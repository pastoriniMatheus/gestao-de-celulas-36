import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Cell } from "@/types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  });
  const [leaders, setLeaders] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data, error } = await supabase.from("users").select("id, name");
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
        .select("id, name");
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

    fetchLeaders();
    fetchNeighborhoods();
  }, []);

  useEffect(() => {
    if (cell) {
      setFormState({
        name: cell.name,
        address: cell.address,
        leader_id: cell.leader_id,
        neighborhood_id: cell.neighborhood_id,
        active: cell.active,
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
    if (!formState.leader_id) {
      toast({ title: "Selecione o líder da célula." });
      return;
    }
    if (!formState.neighborhood_id) {
      toast({ title: "Selecione o bairro da célula." });
      return;
    }

    const { data, error } = await supabase
      .from("cells")
      .update(formState)
      .eq("id", cell.id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao atualizar a célula.",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Célula atualizada com sucesso!",
      });
      onCellUpdated(data);
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Editar Célula</AlertDialogTitle>
          <AlertDialogDescription>
            Atualize os dados da célula.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formState.name || ""}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              type="text"
              id="address"
              name="address"
              value={formState.address || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label className="block font-medium">Líder da Célula *</Label>
            <select
              required
              value={formState.leader_id || ""}
              onChange={(e) =>
                setFormState((f) => ({ ...f, leader_id: e.target.value }))
              }
              className="input"
            >
              <option value="" disabled>
                Selecione um líder
              </option>
              {leaders.map((l: any) => (
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
              value={formState.neighborhood_id || ""}
              onChange={(e) =>
                setFormState((f) => ({ ...f, neighborhood_id: e.target.value }))
              }
              className="input"
            >
              <option value="" disabled>
                Selecione um bairro
              </option>
              {neighborhoods.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="checkbox"
              id="active"
              name="active"
              checked={formState.active || false}
              onChange={handleChange}
            />
            <Label htmlFor="active">Ativo</Label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction type="submit">Salvar</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
