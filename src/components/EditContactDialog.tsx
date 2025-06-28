
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useCells } from '@/hooks/useCells';
import { useCities } from '@/hooks/useCities';
import { useNeighborhoods } from '@/hooks/useNeighborhoods';
import { useContacts } from '@/hooks/useContacts';
import { useMinistries } from '@/hooks/useMinistries';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from 'lucide-react';

interface EditContactDialogProps {
  contact: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedContact: any) => void;
}

export const EditContactDialog = ({ contact, isOpen, onClose, onUpdate }: EditContactDialogProps) => {
  const { cells } = useCells();
  const { cities } = useCities();
  const { neighborhoods } = useNeighborhoods();
  const { updateContact } = useContacts();
  const { ministries } = useMinistries();
  const { data: pipelineStages = [] } = useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('active', true)
        .order('position');
      
      if (error) throw error;
      return data;
    }
  });

  const [formData, setFormData] = useState({
    name: contact.name || '',
    whatsapp: contact.whatsapp || '',
    neighborhood: contact.neighborhood || '',
    city_id: contact.city_id || '',
    cell_id: contact.cell_id || '',
    ministry_id: contact.ministry_id || '',
    status: contact.status || 'pending',
    encounter_with_god: contact.encounter_with_god || false,
    baptized: contact.baptized || false,
    pipeline_stage_id: contact.pipeline_stage_id || '',
    age: contact.age || null,
    birth_date: contact.birth_date || null,
    referred_by: contact.referred_by || null,
    photo_url: contact.photo_url || null,
    founder: contact.founder || false,
    leader_id: contact.leader_id || null,
  });

  const { toast } = useToast();

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        whatsapp: contact.whatsapp || '',
        neighborhood: contact.neighborhood || '',
        city_id: contact.city_id || '',
        cell_id: contact.cell_id || '',
        ministry_id: contact.ministry_id || '',
        status: contact.status || 'pending',
        encounter_with_god: contact.encounter_with_god || false,
        baptized: contact.baptized || false,
        pipeline_stage_id: contact.pipeline_stage_id || '',
        age: contact.age || null,
        birth_date: contact.birth_date || null,
        referred_by: contact.referred_by || null,
        photo_url: contact.photo_url || null,
        founder: contact.founder || false,
        leader_id: contact.leader_id || null,
      });
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedContact = await updateContact(contact.id, formData);
      if (onUpdate) {
        onUpdate(updatedContact);
      }
      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso!",
      })
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar contato:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar contato!",
        variant: "destructive"
      })
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Contato</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="city_id">Cidade</Label>
              <Select value={formData.city_id || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, city_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cell_id">Célula</Label>
              <Select value={formData.cell_id || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, cell_id: value || null }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma célula" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma célula</SelectItem>
                  {cells.map(cell => (
                    <SelectItem key={cell.id} value={cell.id}>
                      {cell.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ministry_id">Ministério</Label>
              <Select value={formData.ministry_id || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, ministry_id: value || null }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um ministério" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum ministério</SelectItem>
                  {ministries.map(ministry => (
                    <SelectItem key={ministry.id} value={ministry.id}>
                      {ministry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pipeline_stage_id">Etapa do Pipeline</Label>
              <Select value={formData.pipeline_stage_id || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, pipeline_stage_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma etapa" />
                </SelectTrigger>
                <SelectContent>
                  {pipelineStages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="referred_by">Indicado Por</Label>
              <Input
                id="referred_by"
                value={formData.referred_by || ''}
                onChange={(e) => setFormData({ ...formData, referred_by: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={formData.age || ''}
                onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>

            <div>
              <Label htmlFor="birth_date">Data de Nascimento</Label>
               <Input
                id="birth_date"
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>
                <Switch
                  id="encounter_with_god"
                  checked={formData.encounter_with_god || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, encounter_with_god: checked })}
                />
                <span className="ml-2">Encontro com Deus</span>
              </Label>
            </div>

            <div>
              <Label>
                <Switch
                  id="baptized"
                  checked={formData.baptized || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, baptized: checked })}
                />
                <span className="ml-2">Batizado</span>
              </Label>
            </div>
          </div>

          <Button type="submit">Salvar Alterações</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
