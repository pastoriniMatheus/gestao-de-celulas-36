import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MapPin, Phone, User, Home, Calendar } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useCells } from '@/hooks/useCells';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useMemo, useState as useReactState } from 'react';

// Buscar os líderes pelo id
const useCellLeaders = (cells) => {
  const leaderIds = useMemo(
    () =>
      Array.from(
        new Set(
          cells.filter((c) => c.leader_id).map((c) => c.leader_id)
        )
      ),
    [cells]
  );
  const [leaders, setLeaders] = useReactState<{ [id: string]: any }>({});
  useEffect(() => {
    const fetchLeaders = async () => {
      if (leaderIds.length === 0) return setLeaders({});
      const ids = leaderIds as string[];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', ids);
      if (!error && data) {
        const obj = {};
        data.forEach((profile) => (obj[profile.id] = profile));
        setLeaders(obj);
      }
    };
    fetchLeaders();
  }, [leaderIds]);
  return leaders;
};

export const PendingContactsManager = () => {
  const { contacts, fetchContacts } = useContacts();
  const { cells, loading: cellsLoading } = useCells();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);

  // Buscamos os líderes via hook
  const cellLeaders = useCellLeaders(cells);

  // Filtrar contatos pendentes (sem célula atribuída)
  const pendingContacts = contacts.filter(contact => 
    contact.status === 'pending' && !contact.cell_id
  );

  // Filtrar apenas células ativas
  const activeCells = cells.filter(cell => cell.active);

  // Buscar bairros das células por neighborhood_id, e nomes dos bairros
  const [neighborhoods, setNeighborhoods] = useReactState<{ [id: string]: string }>({});
  useEffect(() => {
    const fetchNeighborhoods = async () => {
      const ids = Array.from(new Set(activeCells.map(cell => cell.neighborhood_id).filter(Boolean)));
      if (ids.length === 0) return setNeighborhoods({});
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('id, name')
        .in('id', ids);
      if (!error && data) {
        const obj = {};
        data.forEach(n => { obj[n.id] = n.name; });
        setNeighborhoods(obj);
      }
    };
    fetchNeighborhoods();
  }, [activeCells.map(c => c.neighborhood_id).join(',')]);

  // Agrupar células por bairro
  const groupedCellsByNeighborhood: Record<string, typeof activeCells> = useMemo(() => {
    const groups: Record<string, typeof activeCells> = {};
    for (const cell of activeCells) {
      const neighborhoodLabel = cell.neighborhood_id
        ? (neighborhoods[cell.neighborhood_id] ?? 'Outro')
        : 'Outro';
      if (!groups[neighborhoodLabel]) {
        groups[neighborhoodLabel] = [];
      }
      groups[neighborhoodLabel].push(cell);
    }
    return groups;
  }, [activeCells, neighborhoods]);

  const handleAssignCell = async (contactId: string, cellId: string) => {
    if (!cellId || cellId === 'no-cell') return;

    setUpdating(contactId);
    try {
      console.log('PendingContactsManager: Atribuindo contato à célula:', { contactId, cellId });
      
      const { error } = await supabase
        .from('contacts')
        .update({ 
          cell_id: cellId,
          status: 'member' // Mudança de 'assigned' para 'member'
        })
        .eq('id', contactId);

      if (error) {
        console.error('PendingContactsManager: Erro ao atribuir célula:', error);
        toast({
          title: "Erro",
          description: `Erro ao atribuir célula: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('PendingContactsManager: Contato atribuído com sucesso');
      toast({
        title: "Sucesso",
        description: "Contato atribuído à célula com sucesso!"
      });

      await fetchContacts();
    } catch (error: any) {
      console.error('PendingContactsManager: Erro inesperado:', error);
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

  const formatBirthDate = (birthDate: string) => {
    if (!birthDate) return null;
    return new Date(birthDate).toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

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
                          {contact.birth_date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {formatBirthDate(contact.birth_date)}
                                {calculateAge(contact.birth_date) && ` (${calculateAge(contact.birth_date)} anos)`}
                              </span>
                            </div>
                          )}
                          <span className="text-xs text-gray-500">
                            Cadastrado em: {formatDate(contact.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[220px]">
                        <label className="text-sm font-medium">Atribuir à Célula:</label>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={(value) => handleAssignCell(contact.id, value)}
                            disabled={updating === contact.id || cellsLoading}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecione uma célula" />
                            </SelectTrigger>
                            <SelectContent className="z-[50] bg-white border rounded shadow-lg">
                              <SelectItem value="no-cell">Nenhuma</SelectItem>
                              {Object.entries(groupedCellsByNeighborhood).map(([neighborhood, cellsArr]) => (
                                <div key={neighborhood}>
                                  <div className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border-b">
                                    {neighborhood}
                                  </div>
                                  {cellsArr.map((cell) => (
                                    <SelectItem key={cell.id} value={cell.id} className="pt-2 pb-1">
                                      <div className="flex flex-col">
                                        <span className="font-semibold text-sm flex gap-1 items-center">
                                          <Home className="h-3 w-3 mr-1 text-blue-400" />
                                          {cell.name}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-5">{cell.address}</span>
                                        {cell.leader_id && cellLeaders[cell.leader_id] && (
                                          <span className="text-xs text-purple-700 ml-5 flex items-center gap-1">
                                            <User className="h-3 w-3" /> 
                                            {cellLeaders[cell.leader_id].name}
                                          </span>
                                        )}
                                      </div>
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
