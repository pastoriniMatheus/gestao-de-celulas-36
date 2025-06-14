
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddCityDialogProps {
  onCityAdded: () => void;
}

export const AddCityDialog = ({ onCityAdded }: AddCityDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cityName, setCityName] = useState('');
  const [stateName, setStateName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cityName.trim() || !stateName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('cities')
        .insert({
          name: cityName.trim(),
          state: stateName.trim(),
          active: true
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cidade adicionada com sucesso!"
      });

      setCityName('');
      setStateName('');
      setIsOpen(false);
      onCityAdded();
    } catch (error) {
      console.error('Erro ao adicionar cidade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a cidade",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Cidade
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Nova Cidade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cityName">Nome da Cidade</Label>
            <Input
              id="cityName"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="Digite o nome da cidade"
              required
            />
          </div>
          <div>
            <Label htmlFor="stateName">Estado</Label>
            <Input
              id="stateName"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              placeholder="Digite o estado (ex: SP, RJ)"
              required
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
