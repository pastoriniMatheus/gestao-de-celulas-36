
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Users, Filter, Phone, Mail, Calendar, MapPin } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useLeaderCells } from '@/hooks/useLeaderCells';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  position: number;
}

interface Contact {
  id: string;
  name: string;
  whatsapp: string | null;
  email: string | null;
  neighborhood: string;
  birth_date: string | null;
  encounter_with_god: boolean;
  baptized: boolean;
  pipeline_stage_id: string | null;
  cell_id: string | null;
}

export const KanbanPipeline = () => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<String>('all');
  const { cells } = useLeaderCells();

  useEffect(() => {
    fetchData();
  }, [selectedCell]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar estágios
      const { data: stagesData, error: stagesError } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('active', true)
        .order('position');

      if (stagesError) throw stagesError;
      setStages(stagesData || []);

      // Buscar contatos com filtro de célula se necessário
      let contactsQuery = supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCell !== 'all') {
        contactsQuery = contactsQuery.eq('cell_id', selectedCell);
      }

      const { data: contactsData, error: contactsError } = await contactsQuery;

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do pipeline",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStageId = destination.droppableId;
    
    try {
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('contacts')
        .update({ pipeline_stage_id: newStageId })
        .eq('id', draggableId);

      if (error) throw error;

      // Atualizar estado local
      setContacts(prev => 
        prev.map(contact => 
          contact.id === draggableId 
            ? { ...contact, pipeline_stage_id: newStageId }
            : contact
        )
      );

      toast({
        title: "Sucesso",
        description: "Contato movido com sucesso!"
      });

    } catch (error) {
      console.error('Erro ao mover contato:', error);
      toast({
        title: "Erro",
        description: "Erro ao mover contato",
        variant: "destructive"
      });
    }
  };

  const getContactsByStage = (stageId: string) => {
    return contacts.filter(contact => contact.pipeline_stage_id === stageId);
  };

  const getContactsWithoutStage = () => {
    return contacts.filter(contact => !contact.pipeline_stage_id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Carregando pipeline...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Estágio dos Discípulos
          </h1>
          <p className="text-gray-600">
            Acompanhe e mova os discípulos através dos estágios do pipeline
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <Select value={selectedCell} onValueChange={setSelectedCell}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por célula" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as células</SelectItem>
                {cells.map((cell) => (
                  <SelectItem key={cell.id} value={cell.id}>
                    {cell.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline" className="text-sm">
            {contacts.length} discípulos
          </Badge>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-6">
          {/* Coluna para contatos sem estágio */}
          <div className="min-w-80 flex-shrink-0">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-600">
                    Não Classificados
                  </CardTitle>
                  <Badge variant="secondary">
                    {getContactsWithoutStage().length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Droppable droppableId="no-stage">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3 min-h-32"
                    >
                      {getContact sWithoutStage().map((contact, index) => (
                        <Draggable key={contact.id} draggableId={contact.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-move ${
                                snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                              }`}
                            >
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-800">{contact.name}</h4>
                                {contact.whatsapp && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="h-3 w-3" />
                                    {contact.whatsapp}
                                  </div>
                                )}
                                {contact.email && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="h-3 w-3" />
                                    {contact.email}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="h-3 w-3" />
                                  {contact.neighborhood}
                                </div>
                                <div className="flex gap-2">
                                  {contact.encounter_with_god && (
                                    <Badge variant="outline" className="text-xs">ECD</Badge>
                                  )}
                                  {contact.baptized && (
                                    <Badge variant="outline" className="text-xs">Batizado</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>

          {/* Colunas dos estágios */}
          {stages.map((stage) => (
            <div key={stage.id} className="min-w-80 flex-shrink-0">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      {stage.name}
                    </CardTitle>
                    <Badge style={{ backgroundColor: stage.color, color: 'white' }}>
                      {getContactsByStage(stage.id).length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-3 min-h-32 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-gray-50 rounded-lg' : ''
                        }`}
                      >
                        {getContactsByStage(stage.id).map((contact, index) => (
                          <Draggable key={contact.id} draggableId={contact.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all cursor-move ${
                                  snapshot.isDragging ? 'shadow-lg rotate-2 scale-105' : ''
                                }`}
                                style={{
                                  borderLeft: `4px solid ${stage.color}`,
                                  ...provided.draggableProps.style
                                }}
                              >
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-gray-800">{contact.name}</h4>
                                  {contact.whatsapp && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Phone className="h-3 w-3" />
                                      {contact.whatsapp}
                                    </div>
                                  )}
                                  {contact.email && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Mail className="h-3 w-3" />
                                      {contact.email}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="h-3 w-3" />
                                    {contact.neighborhood}
                                  </div>
                                  {contact.birth_date && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(contact.birth_date).toLocaleDateString('pt-BR')}
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    {contact.encounter_with_god && (
                                      <Badge variant="outline" className="text-xs">ECD</Badge>
                                    )}
                                    {contact.baptized && (
                                      <Badge variant="outline" className="text-xs">Batizado</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};
