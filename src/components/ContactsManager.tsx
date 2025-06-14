
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Phone } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  neighborhood: string;
  age: number;
  whatsapp: string;
  status: 'pending' | 'participating';
  cellName?: string;
}

interface Cell {
  id: string;
  name: string;
  leader: string;
}

export const ContactsManager = () => {
  const [contacts] = useState<Contact[]>([
    { id: '1', name: 'Maria Silva', neighborhood: 'Centro', age: 34, whatsapp: '(11) 99999-9999', status: 'participating', cellName: 'Célula Esperança' },
    { id: '2', name: 'João Santos', neighborhood: 'Jardim Europa', age: 28, whatsapp: '(11) 88888-8888', status: 'pending' },
    { id: '3', name: 'Ana Costa', neighborhood: 'Centro', age: 42, whatsapp: '(11) 77777-7777', status: 'participating', cellName: 'Célula Fé' },
    { id: '4', name: 'Pedro Lima', neighborhood: 'Vila Nova', age: 31, whatsapp: '(11) 66666-6666', status: 'pending' },
    { id: '5', name: 'Sofia Oliveira', neighborhood: 'Jardim Europa', age: 26, whatsapp: '(11) 55555-5555', status: 'participating', cellName: 'Célula Esperança' },
  ]);

  const [cells] = useState<Cell[]>([
    { id: '1', name: 'Célula Esperança', leader: 'Pastor João' },
    { id: '2', name: 'Célula Fé', leader: 'Líder Maria' },
    { id: '3', name: 'Célula Amor', leader: 'Líder Pedro' },
  ]);

  const neighborhoods = [...new Set(contacts.map(contact => contact.neighborhood))];

  const groupContactsByNeighborhood = () => {
    return neighborhoods.map(neighborhood => ({
      neighborhood,
      contacts: contacts.filter(contact => contact.neighborhood === neighborhood)
    }));
  };

  const handleAssignToCell = (contactId: string, cellName: string) => {
    console.log(`Atribuindo contato ${contactId} à célula ${cellName}`);
    // Aqui implementaríamos a lógica de atribuição
  };

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
                    <p>Idade: {contact.age} anos</p>
                    <div className="flex items-center gap-1">
                      <Phone size={12} />
                      <span>{contact.whatsapp}</span>
                    </div>
                    {contact.cellName && (
                      <p className="text-blue-600 font-medium">
                        Célula: {contact.cellName}
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
                            <SelectItem key={cell.id} value={cell.name}>
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
