
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  name: string;
  neighborhood: string;
  age: number | null;
  whatsapp: string | null;
  status: string;
  cell_id: string | null;
  cell?: {
    name: string;
  };
}

interface Cell {
  id: string;
  name: string;
  leader_id: string;
  profiles?: {
    name: string;
  };
}

export const ContactsManager = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
    fetchCells();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          cells (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setContacts(data || []);
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os contatos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCells = async () => {
    try {
      const { data, error } = await supabase
        .from('cells')
        .select(`
          *,
          profiles (
            name
          )
        `)
        .eq('active', true)
        .order('name');

      if (error) throw error;

      setCells(data || []);
    } catch (error) {
      console.error('Erro ao buscar células:', error);
    }
  };

  const neighborhoods = [...new Set(contacts.map(contact => contact.neighborhood))];

  const groupContactsByNeighborhood = () => {
    return neighborhoods.map(neighborhood => ({
      neighborhood,
      contacts: contacts.filter(contact => contact.neighborhood === neighborhood)
    }));
  };

  const handleAssignToCell = async (contactId: string, cellId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ 
          cell_id: cellId,
          status: 'participating'
        })
        .eq('id', contactId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contato atribuído à célula com sucesso"
      });
      
      fetchContacts();
    } catch (error) {
      console.error('Erro ao atribuir à célula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atribuir o contato à célula",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando contatos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Contatos</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Pendentes: {contacts.filter(c => c.status === 'pending').length}
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Participando: {contacts.filter(c => c.status === 'participating').length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {groupContactsByNeighborhood().map(({ neighborhood, contacts: neighborhoodContacts }) => (
          <Card key={neighborhood}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                {neighborhood}
                <Badge variant="secondary" className="ml-auto">
                  {neighborhoodContacts.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {neighborhoodContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-600" />
                      <span className="font-medium">{contact.name}</span>
                    </div>
                    <Badge 
                      variant={contact.status === 'participating' ? 'default' : 'secondary'}
                      className={contact.status === 'participating' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    >
                      {contact.status === 'participating' ? 'Participando' : 'Pendente'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    {contact.age && <p>Idade: {contact.age} anos</p>}
                    {contact.whatsapp && (
                      <div className="flex items-center gap-1">
                        <Phone size={12} />
                        <span>{contact.whatsapp}</span>
                      </div>
                    )}
                    {contact.cell && (
                      <p className="text-blue-600 font-medium">
                        Célula: {contact.cell.name}
                      </p>
                    )}
                  </div>

                  {contact.status === 'pending' && (
                    <div className="mt-3">
                      <Select onValueChange={(value) => handleAssignToCell(contact.id, value)}>
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue placeholder="Atribuir à célula" />
                        </SelectTrigger>
                        <SelectContent>
                          {cells.map((cell) => (
                            <SelectItem key={cell.id} value={cell.id}>
                              {cell.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
