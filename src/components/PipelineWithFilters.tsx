
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Users, Filter } from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  position: number;
  contacts: Contact[];
}

interface Contact {
  id: string;
  name: string;
  whatsapp: string | null;
  neighborhood: string;
  cell_id: string | null;
  cell_name: string | null;
}

interface Cell {
  id: string;
  name: string;
}

export const PipelineWithFilters = () => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedCell, setSelectedCell] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipelineData();
    fetchCells();
  }, []);

  const fetchCells = async () => {
    try {
      const { data, error } = await supabase
        .from('cells')
        .select('id, name')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setCells(data || []);
    } catch (error) {
      console.error('Erro ao buscar células:', error);
    }
  };

  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      
      // Buscar estágios
      const { data: stagesData, error: stagesError } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('active', true)
        .order('position');

      if (stagesError) throw stagesError;

      // Buscar contatos por estágio com informações da célula
      const stagesWithContacts = await Promise.all(
        (stagesData || []).map(async (stage) => {
          const { data: contacts, error } = await supabase
            .from('contacts')
            .select(`
              id,
              name,
              whatsapp,
              neighborhood,
              cell_id,
              cells!left(name)
            `)
            .eq('pipeline_stage_id', stage.id);

          if (error) console.error('Erro ao buscar contatos:', error);

          return {
            ...stage,
            contacts: (contacts || []).map(contact => ({
              ...contact,
              cell_name: contact.cells?.name || null
            }))
          };
        })
      );

      setStages(stagesWithContacts);
    } catch (error) {
      console.error('Erro ao buscar dados do pipeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredContacts = (contacts: Contact[]) => {
    if (selectedCell === 'all') return contacts;
    if (selectedCell === 'no-cell') return contacts.filter(c => !c.cell_id);
    return contacts.filter(c => c.cell_id === selectedCell);
  };

  if (loading) {
    return (
      <Card className="h-fit max-h-[80vh]">
        <CardHeader>
          <CardTitle>Pipeline de Discípulos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando pipeline...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit max-h-[80vh] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Pipeline de Discípulos
        </CardTitle>
        <CardDescription>
          Visualização dos discípulos por estágio do funil
        </CardDescription>
        
        {/* Filtro por Célula */}
        <div className="flex items-center gap-2 mt-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={selectedCell} onValueChange={setSelectedCell}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filtrar por célula" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as células</SelectItem>
              <SelectItem value="no-cell">Sem célula</SelectItem>
              {cells.map((cell) => (
                <SelectItem key={cell.id} value={cell.id}>
                  {cell.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        {/* Pipeline horizontal com scroll */}
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4" style={{ minWidth: `${stages.length * 300}px` }}>
            {stages.map((stage, index) => {
              const filteredContacts = getFilteredContacts(stage.contacts);
              
              return (
                <div key={stage.id} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-72 border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: stage.color }}
                      />
                      <h3 className="font-medium text-sm truncate">{stage.name}</h3>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {filteredContacts.length}
                      </Badge>
                    </div>
                    
                    {/* ScrollArea para os contatos */}
                    <ScrollArea className="h-64 w-full">
                      <div className="space-y-2">
                        {filteredContacts.length === 0 ? (
                          <p className="text-xs text-gray-500 text-center py-4">
                            {selectedCell === 'all' 
                              ? 'Nenhum discípulo neste estágio' 
                              : 'Nenhum discípulo neste estágio para o filtro selecionado'
                            }
                          </p>
                        ) : (
                          filteredContacts.map((contact) => (
                            <div key={contact.id} className="p-2 bg-gray-50 rounded text-xs">
                              <p className="font-medium truncate">{contact.name}</p>
                              <p className="text-gray-600 truncate">{contact.neighborhood}</p>
                              {contact.cell_name && (
                                <p className="text-blue-600 text-xs truncate">{contact.cell_name}</p>
                              )}
                              {contact.whatsapp && (
                                <p className="text-green-600 text-xs truncate">{contact.whatsapp}</p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  {/* Seta para próximo estágio */}
                  {index < stages.length - 1 && (
                    <div className="flex items-center pt-20">
                      <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {stages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum estágio de pipeline configurado.</p>
            <p className="text-sm">Configure os estágios nas configurações do sistema.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
