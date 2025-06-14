
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface City {
  id: string;
  name: string;
  state: string;
}

interface AddNeighborhoodDialogProps {
  cities: City[];
  onNeighborhoodAdded: () => void;
}

export const AddNeighborhoodDialog = ({ cities, onNeighborhoodAdded }: AddNeighborhoodDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [neighborhoodName, setNeighborhoodName] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!neighborhoodName.trim() || !selectedCityId) {
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
        .from('neighborhoods')
        .insert({
          name: neighborhoodName.trim(),
          city_id: selectedCityId,
          active: true
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Bairro adicionado com sucesso!"
      });

      setNeighborhoodName('');
      setSelectedCityId('');
      setIsOpen(false);
      onNeighborhoodAdded();
    } catch (error) {
      console.error('Erro ao adicionar bairro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o bairro",
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
          Adicionar Bairro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Bairro</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="citySelect">Cidade</Label>
            <Select value={selectedCityId} onValueChange={setSelectedCityId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name} - {city.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="neighborhoodName">Nome do Bairro</Label>
            <Input
              id="neighborhoodName"
              value={neighborhoodName}
              onChange={(e) => setNeighborhoodName(e.target.value)}
              placeholder="Digite o nome do bairro"
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
