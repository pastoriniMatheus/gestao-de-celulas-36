
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useContactForm } from '@/hooks/useContactForm';
import { useContactDialogData } from '@/hooks/useContactDialogData';
import { BasicInfoFields } from './contact-form/BasicInfoFields';
import { LocationFields } from './contact-form/LocationFields';
import { ReferralAndCellFields } from './contact-form/ReferralAndCellFields';

interface AddContactDialogProps {
  onContactAdded: () => void;
}

export const AddContactDialog = ({ onContactAdded }: AddContactDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const { formData, updateFormData, resetForm } = useContactForm();
  const { 
    cells, 
    cities, 
    contacts, 
    profiles, 
    getFilteredNeighborhoods 
  } = useContactDialogData(isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.whatsapp.trim() || !formData.neighborhood.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          name: formData.name.trim(),
          whatsapp: formData.whatsapp.trim(),
          email: formData.email.trim() || null,
          city_id: formData.city_id || null,
          neighborhood: formData.neighborhood.trim(),
          cell_id: formData.cell_id || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contato adicionado com sucesso!"
      });

      resetForm();
      setIsOpen(false);
      onContactAdded();
    } catch (error) {
      console.error('Erro ao adicionar contato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o contato",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Contato
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Contato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BasicInfoFields 
              formData={formData} 
              onUpdateFormData={updateFormData} 
            />
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
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Salvar Contato'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
