
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
import { useContacts } from '@/hooks/useContacts';
import { useMinistries } from '@/hooks/useMinistries';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EditContactDialogProps {
  contact: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedContact: any) => void;
}

export const EditContactDialog = ({ contact, isOpen, onClose, onUpdate }: EditContactDialogProps) => {
  const { cells } = useCells();
  const { cities } = useCities();
  const { updateContact } = useContacts();
  const { ministries } = useMinistries();
  const { toast } = useToast();

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
    name: '',
    whatsapp: '',
    neighborhood: '',
    city_id: '',
    cell_id: '',
    ministry_id: '',
    status: 'pending',
    encounter_with_god: false,
    baptized: false,
    pipeline_stage_id: '',
    age: null as number | null,
    birth_date: '',
    referred_by: '',
    photo_url: '',
    founder: false,
    leader_id: '',
  });

  useEffect(() => {
    if (contact && isOpen) {
      console.log('Carregando dados do contato para edição:', contact);
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
        birth_date: contact.birth_date || '',
        referred_by: contact.referred_by || '',
        photo_url: contact.photo_url || '',
        founder: contact.founder || false,
        leader_id: contact.leader_id || '',
      });
    }
  }, [contact, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Enviando dados do formulário:', formData);
      
      const updatedContact = await updateContact(contact.id, formData);
      
      if (onUpdate) {
        onUpdate(updatedContact);
      }
      
      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso!",
      });
      
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar contato:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar contato!",
        variant: "destructive"
      });
    }
  };

  if (!isOpen || !contact) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Contato</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-contact-name">Nome</Label>
              <Input
                id="edit-contact-name"
                name="contact-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-contact-whatsapp">WhatsApp</Label>
              <Input
                id="edit-contact-whatsapp"
                name="contact-whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-contact-neighborhood">Bairro</Label>
              <Input
                id="edit-contact-neighborhood"
                name="contact-neighborhood"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-contact-city">Cidade</Label>
              <Select value={formData.city_id || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, city_id: value === 'none' ? '' : value }))}>
                <SelectTrigger id="edit-contact-city">
                  <SelectValue placeholder="Selecione uma cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma cidade</SelectItem>
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
              <Label htmlFor="edit-contact-cell">Célula</Label>
              <Select value={formData.cell_id || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, cell_id: value === 'none' ? '' : value }))}>
                <SelectTrigger id="edit-contact-cell">
                  <SelectValue placeholder="Selecione uma célula" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma célula</SelectItem>
                  {cells.map(cell => (
                    <SelectItem key={cell.id} value={cell.id}>
                      {cell.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-contact-ministry">Ministério</Label>
              <Select value={formData.ministry_id || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, ministry_id: value === 'none' ? '' : value }))}>
                <SelectTrigger id="edit-contact-ministry">
                  <SelectValue placeholder="Selecione um ministério" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum ministério</SelectItem>
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
              <Label htmlFor="edit-contact-pipeline">Etapa do Pipeline</Label>
              <Select value={formData.pipeline_stage_id || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, pipeline_stage_id: value === 'none' ? '' : value }))}>
                <SelectTrigger id="edit-contact-pipeline">
                  <SelectValue placeholder="Selecione uma etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma etapa</SelectItem>
                  {pipelineStages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-contact-referred">Indicado Por</Label>
              <Input
                id="edit-contact-referred"
                name="contact-referred"
                value={formData.referred_by || ''}
                onChange={(e) => setFormData({ ...formData, referred_by: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-contact-age">Idade</Label>
              <Input
                id="edit-contact-age"
                name="contact-age"
                type="number"
                value={formData.age || ''}
                onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>

            <div>
              <Label htmlFor="edit-contact-birth">Data de Nascimento</Label>
               <Input
                id="edit-contact-birth"
                name="contact-birth"
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-contact-encounter"
                checked={formData.encounter_with_god || false}
                onCheckedChange={(checked) => setFormData({ ...formData, encounter_with_god: checked })}
              />
              <Label htmlFor="edit-contact-encounter">Encontro com Deus</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-contact-baptized"
                checked={formData.baptized || false}
                onCheckedChange={(checked) => setFormData({ ...formData, baptized: checked })}
              />
              <Label htmlFor="edit-contact-baptized">Batizado</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit">Salvar Alterações</Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
