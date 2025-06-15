
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
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Leader {
  id: string;
  name: string;
}

interface Neighborhood {
  id: string;
  name: string;
}

interface AddCellDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCellAdded: () => void;
}

export const AddCellDialog = ({
  isOpen,
  onClose,
  onCellAdded,
}: AddCellDialogProps) => {
  const [formState, setFormState] = useState({
    name: "",
    address: "",
    leader_id: "",
    neighborhood_id: "",
    meeting_day: "",
    meeting_time: "",
  });
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      // Buscar os líderes na tabela profiles onde role='leader'
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'leader')
        .eq('active', true);

      if (error) {
        toast({
          title: "Erro ao buscar líderes.",
          description: "Por favor, tente novamente.",
          variant: "destructive",
        });
      } else {
        setLeaders(data || []);
      }
    };

    const fetchNeighborhoods = async () => {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('id, name')
        .eq('active', true);

      if (error) {
        toast({
          title: "Erro ao buscar bairros.",
          description: "Por favor, tente novamente.",
          variant: "destructive",
        });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.leader_id) {
      toast({ title: "Selecione o líder da célula." });
      return;
    }
    if (!formState.neighborhood_id) {
      toast({ title: "Selecione o bairro da célula." });
      return;
    }
    if (!formState.meeting_day) {
      toast({ title: "Selecione o dia da reunião." });
      return;
    }
    if (!formState.meeting_time) {
      toast({ title: "Informe o horário da reunião." });
      return;
    }
    // meeting_day deve ser number, meeting_time string formato "19:00"
    const meeting_day = parseInt(formState.meeting_day);

    const { data, error } = await supabase
      .from('cells')
      .insert([
        {
          name: formState.name,
          address: formState.address,
          leader_id: formState.leader_id,
          neighborhood_id: formState.neighborhood_id,
          meeting_day: meeting_day,
          meeting_time: formState.meeting_time,
        },
      ])
      .select();

    if (error) {
      toast({
        title: "Erro ao criar célula.",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Célula criada com sucesso!",
      });
      onCellAdded();
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
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
                name="leader_id"
                value={formState.leader_id}
                onChange={handleChange}
                className="input w-full border rounded px-2 py-2 bg-white"
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
              <label className="block font-medium">Bairro *</label>
              <select
                required
                name="neighborhood_id"
                value={formState.neighborhood_id}
                onChange={handleChange}
                className="input w-full border rounded px-2 py-2 bg-white"
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
                value={formState.meeting_day}
                onChange={handleChange}
                required
                className="input w-full border rounded px-2 py-2 bg-white"
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
                value={formState.meeting_time}
                onChange={handleChange}
                required
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction type="submit">Adicionar</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};
