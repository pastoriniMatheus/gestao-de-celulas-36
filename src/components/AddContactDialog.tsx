
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Cell {
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
  state: string;
}

interface Neighborhood {
  id: string;
  name: string;
  city_id: string;
}

interface Contact {
  id: string;
  name: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
}

interface AddContactDialogProps {
  onContactAdded: () => void;
}

export const AddContactDialog = ({ onContactAdded }: AddContactDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cells, setCells] = useState<Cell[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    city_id: '',
    neighborhood: '',
    referred_by: '',
    cell_id: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [cellsData, citiesData, neighborhoodsData, contactsData, profilesData] = await Promise.all([
        supabase.from('cells').select('id, name').eq('active', true).order('name'),
        supabase.from('cities').select('id, name, state').eq('active', true).order('name'),
        supabase.from('neighborhoods').select('id, name, city_id').eq('active', true).order('name'),
        supabase.from('contacts').select('id, name').order('name'),
        supabase.from('profiles').select('id, name, email').eq('active', true).order('name')
      ]);

      setCells(cellsData.data || []);
      setCities(citiesData.data || []);
      setNeighborhoods(neighborhoodsData.data || []);
      setContacts(contactsData.data || []);
      setProfiles(profilesData.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const getFilteredNeighborhoods = () => {
    if (!formData.city_id) return [];
    return neighborhoods.filter(n => n.city_id === formData.city_id);
  };

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

      setFormData({
        name: '',
        whatsapp: '',
        email: '',
        city_id: '',
        neighborhood: '',
        referred_by: '',
        cell_id: ''
      });
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
            <div>
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Digite o nome completo"
                required
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp *</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Select value={formData.city_id} onValueChange={(value) => setFormData({ ...formData, city_id: value, neighborhood: '' })}>
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
              <Label htmlFor="neighborhood">Bairro *</Label>
              {formData.city_id ? (
                <Select value={formData.neighborhood} onValueChange={(value) => setFormData({ ...formData, neighborhood: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o bairro" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredNeighborhoods().map((neighborhood) => (
                      <SelectItem key={neighborhood.id} value={neighborhood.name}>
                        {neighborhood.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  placeholder="Digite o nome do bairro"
                  required
                />
              )}
            </div>
            <div>
              <Label htmlFor="referred_by">Quem Indicou</Label>
              <Select value={formData.referred_by} onValueChange={(value) => setFormData({ ...formData, referred_by: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione quem indicou (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {profiles.map((profile) => (
                    <SelectItem key={`profile-${profile.id}`} value={profile.id}>
                      {profile.name} (Usuário)
                    </SelectItem>
                  ))}
                  {contacts.map((contact) => (
                    <SelectItem key={`contact-${contact.id}`} value={contact.id}>
                      {contact.name} (Contato)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cell">Célula</Label>
              <Select value={formData.cell_id} onValueChange={(value) => setFormData({ ...formData, cell_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a célula (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {cells.map((cell) => (
                    <SelectItem key={cell.id} value={cell.id}>
                      {cell.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
