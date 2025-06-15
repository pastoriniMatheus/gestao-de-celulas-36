
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContacts } from '@/hooks/useContacts';
import { useContactForm } from '@/hooks/useContactForm';
import { useContactDialogData } from '@/hooks/useContactDialogData';
import { BasicInfoFields } from './contact-form/BasicInfoFields';
import { LocationFields } from './contact-form/LocationFields';
import { ReferralAndCellFields } from './contact-form/ReferralAndCellFields';

import { EncounterWithGodField } from './contact-form/EncounterWithGodField';
import { NeighborhoodSelectField } from './contact-form/NeighborhoodSelectField';

export const AddContactDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { addContact } = useContacts();
  const { toast } = useToast();
  const { formData, updateFormData, resetForm } = useContactForm();
  const { 
    cells, 
    cities, 
    contacts, 
    profiles, 
    neighborhoods, // Importante para montar o Select de bairros
    getFilteredNeighborhoods 
  } = useContactDialogData(isOpen);

  // Busca bairros filtrados pela cidade, se algum selecionado ou todos
  const neighborhoodsToShow = formData.city_id ? neighborhoods.filter(n => n.city_id === formData.city_id) : neighborhoods;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.whatsapp || !formData.neighborhood) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios (Nome, WhatsApp e Bairro).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const contactToAdd = {
        name: formData.name,
        whatsapp: formData.whatsapp,
        neighborhood: formData.neighborhood,
        city_id: formData.city_id || null,
        cell_id: formData.cell_id === 'none' ? null : formData.cell_id || null,
        status: 'pending', // GARANTINDO que sempre seja 'pending'
        age: formData.age || null,
        encounter_with_god: formData.encounter_with_god ?? false,
      };

      await addContact(contactToAdd);

      toast({
        title: "Sucesso",
        description: "Contato adicionado com sucesso com status pendente!",
      });

      resetForm();
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Erro ao criar contato. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Contato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Contato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos básicos */}
          <BasicInfoFields 
            formData={formData} 
            onUpdateFormData={updateFormData} 
          />

          {/* Checkbox Encontro com Deus */}
          <EncounterWithGodField
            checked={formData.encounter_with_god}
            onChange={checked => updateFormData({ encounter_with_god: checked })}
          />

          {/* Seleção de Bairro pelo select */}
          <NeighborhoodSelectField
            neighborhood={formData.neighborhood}
            onChange={neigh => updateFormData({ neighborhood: neigh })}
            neighborhoods={neighborhoodsToShow}
          />

          {/* Restante dos campos já existentes */}
          <LocationFields 
            formData={formData} 
            onUpdateFormData={updateFormData}
            cities={cities}
            getFilteredNeighborhoods={getFilteredNeighborhoods}
          />
          
          <ReferralAndCellFields 
            formData={formData} 
            onUpdateFormData={updateFormData}
            cells={cells}
            contacts={contacts}
            profiles={profiles}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Contato'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
