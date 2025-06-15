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
import { PlusIcon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client";

interface AddCellDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCellAdded: () => void;
}

export const AddCellDialog = ({ isOpen, onClose, onCellAdded }) => {
  const [formState, setFormState] = useState({
    name: "",
    address: "",
    leader_id: "",
    neighborhood_id: "",
  });
  const [leaders, setLeaders] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'leader');

      if (error) {
        toast({
          title: "Erro ao buscar líderes.",
          description: "Por favor, tente novamente.",
          variant: "destructive",
        })
      } else {
        setLeaders(data || []);
      }
    };

    const fetchNeighborhoods = async () => {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('id, name');

      if (error) {
        toast({
          title: "Erro ao buscar bairros.",
          description: "Por favor, tente novamente.",
          variant: "destructive",
        })
      } else {
        setNeighborhoods(data || []);
      }
    };

    if (isOpen) {
      setLoading(true);
      Promise.all([fetchLeaders(), fetchNeighborhoods()])
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validação simples: líder e bairro obrigatórios
    if (!formState.leader_id) {
      toast({ title: "Selecione o líder da célula." });
      return;
    }
    if (!formState.neighborhood_id) {
      toast({ title: "Selecione o bairro da célula." });
      return;
    }

    const { data, error } = await supabase
      .from('cells')
      .insert([
        {
          name: formState.name,
          address: formState.address,
          leader_id: formState.leader_id,
          neighborhood_id: formState.neighborhood_id,
        },
      ])
      .select()

    if (error) {
      toast({
        title: "Erro ao criar célula.",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Célula criada com sucesso!",
      })
      onCellAdded();
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          Adicionar Célula
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Adicionar Nova Célula</AlertDialogTitle>
          <AlertDialogDescription>
            Preencha os campos abaixo para adicionar uma nova célula.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Célula</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formState.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                type="text"
                id="address"
                name="address"
                value={formState.address}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block font-medium">Líder da Célula *</label>
              <select
                required
                value={formState.leader_id || ""}
                onChange={e => setFormState(f => ({ ...f, leader_id: e.target.value }))}
                className="input"
              >
                <option value="" disabled>Selecione um líder</option>
                {leaders.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium">Bairro *</label>
              <select
                required
                value={formState.neighborhood_id || ""}
                onChange={e => setFormState(f => ({ ...f, neighborhood_id: e.target.value }))}
                className="input"
              >
                <option value="" disabled>Selecione um bairro</option>
                {neighborhoods.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction type="submit">Adicionar</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
};
