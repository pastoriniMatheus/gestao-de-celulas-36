
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MapPin, Phone } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useCells } from '@/hooks/useCells';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const PendingContactsManager = () => {
  const { contacts, fetchContacts } = useContacts();
  const { cells, loading: cellsLoading } = useCells();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);

  // Filtrar contatos pendentes (sem célula atribuída)
  const pendingContacts = contacts.filter(contact => 
    contact.status === 'pending' && !contact.cell_id
  );

  // Filtrar apenas células ativas
  const activeCells = cells.filter(cell => cell.active);

  const handleAssignCell = async (contactId: string, cellId: string) => {
    if (!cellId || cellId === 'no-cell') return;

    setUpdating(contactId);
    try {
      console.log('Atribuindo célula:', { contactId, cellId });
      
      const { error } = await supabase
        .from('contacts')
        .update({ 
          cell_id: cellId,
          status: 'assigned' 
        })
        .eq('id', contactId);

      if (error) {
        console.error('Erro ao atribuir célula:', error);
        toast({
          title: "Erro",
          description: `Erro ao atribuir célula: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Contato atribuído à célula com sucesso!"
      });

      // Atualizar lista de contatos automaticamente
      await fetchContacts();
    } catch (error: any) {
      console.error('Erro ao atribuir célula:', error);
      toast({
        title: "Erro",
        description: `Erro inesperado: ${error?.message || 'Tente novamente'}`,
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Agrupar células por cidade/região
  const groupedCells = activeCells.reduce((acc, cell) => {
    const location = cell.address.split(',')[0] || 'Outras';
    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(cell);
    return acc;
  }, {} as Record<string, typeof activeCells>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            Contatos Pendentes
          </CardTitle>
          <CardDescription>
            Contatos aguardando atribuição de célula ({pendingContacts.length} pendentes)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingContacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum contato pendente no momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingContacts.map((contact) => (
                <Card key={contact.id} className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{contact.name}</h3>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            Pendente
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                          {contact.whatsapp && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{contact.whatsapp}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{contact.neighborhood}</span>
                          </div>
                          {contact.age && (
                            <span className="text-xs">Idade: {contact.age} anos</span>
                          )}
                          <span className="text-xs text-gray-500">
                            Cadastrado em: {formatDate(contact.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <label className="text-sm font-medium">Atribuir à Célula:</label>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={(value) => handleAssignCell(contact.id, value)}
                            disabled={updating === contact.id || cellsLoading}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecione uma célula" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no-cell">Nenhuma</SelectItem>
                              {Object.entries(groupedCells).map(([location, locationCells]) => (
                                <div key={location}>
                                  <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100">
                                    {location}
                                  </div>
                                  {locationCells.map((cell) => (
                                    <SelectItem key={cell.id} value={cell.id}>
                                      <span className="ml-2">{cell.name}</span>
                                    </SelectItem>
                                  ))}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {updating === contact.id && (
                          <p className="text-xs text-blue-600">Atualizando...</p>
                        )}
                        {activeCells.length === 0 && (
                          <p className="text-xs text-red-600">
                            Nenhuma célula ativa cadastrada
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
