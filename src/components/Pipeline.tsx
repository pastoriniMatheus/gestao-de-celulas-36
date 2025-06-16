
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GitBranch, Users, ArrowRight, Heart, Phone } from 'lucide-react';
import { usePipelineStages } from '@/hooks/usePipelineStages';
import { useContacts } from '@/hooks/useContacts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  name: string;
  whatsapp?: string;
  pipeline_stage_id?: string;
  encounter_with_god: boolean;
  cell_id?: string;
  status: string;
}

interface Cell {
  id: string;
  name: string;
}

export const Pipeline = () => {
  const { stages, loading: stagesLoading } = usePipelineStages();
  const { contacts, loading: contactsLoading } = useContacts();
  const [cells, setCells] = useState<Cell[]>([]);
  const [draggedContact, setDraggedContact] = useState<Contact | null>(null);

  useEffect(() => {
    const fetchCells = async () => {
      try {
        const { data, error } = await supabase
          .from('cells')
          .select('id, name')
          .eq('active', true);

        if (error) throw error;
        setCells(data || []);
      } catch (error) {
        console.error('Erro ao buscar células:', error);
      }
    };

    fetchCells();
  }, []);

  const getCellName = (cellId?: string) => {
    if (!cellId) return 'Sem célula';
    const cell = cells.find(c => c.id === cellId);
    return cell ? cell.name : 'Célula não encontrada';
  };

  const getContactsByStage = (stageId: string) => {
    return contacts.filter(contact => contact.pipeline_stage_id === stageId);
  };

  const handleDragStart = (contact: Contact) => {
    setDraggedContact(contact);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    
    if (!draggedContact || draggedContact.pipeline_stage_id === targetStageId) {
      setDraggedContact(null);
      return;
    }

    try {
      console.log('Movendo contato para novo estágio:', {
        contactId: draggedContact.id,
        fromStage: draggedContact.pipeline_stage_id,
        toStage: targetStageId
      });

      const { error } = await supabase
        .from('contacts')
        .update({ pipeline_stage_id: targetStageId })
        .eq('id', draggedContact.id);

      if (error) {
        console.error('Erro ao mover contato:', error);
        toast({
          title: "Erro",
          description: "Erro ao mover contato para novo estágio.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Contato movido com sucesso!",
        });
      }
    } catch (error) {
      console.error('Erro ao mover contato:', error);
      toast({
        title: "Erro",
        description: "Erro ao mover contato.",
        variant: "destructive",
      });
    } finally {
      setDraggedContact(null);
    }
  };

  if (stagesLoading || contactsLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-blue-600" />
              Pipeline de Conversão
            </CardTitle>
            <CardDescription>
              Carregando estágios...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-blue-600" />
            Pipeline de Conversão
          </CardTitle>
          <CardDescription>
            Acompanhe o progresso dos visitantes e membros através dos estágios
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stages.map((stage, index) => {
          const stageContacts = getContactsByStage(stage.id);
          
          return (
            <Card 
              key={stage.id}
              className="min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle 
                    className="text-lg flex items-center gap-2"
                    style={{ color: stage.color }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    {stage.name}
                  </CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {stageContacts.length}
                  </Badge>
                </div>
                {index < stages.length - 1 && (
                  <div className="flex justify-center mt-2 md:hidden">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {stageContacts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum contato neste estágio</p>
                  </div>
                ) : (
                  stageContacts.map((contact) => (
                    <Card 
                      key={contact.id}
                      className="p-3 cursor-move hover:shadow-md transition-shadow border-l-4"
                      style={{ borderLeftColor: stage.color }}
                      draggable
                      onDragStart={() => handleDragStart(contact)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{contact.name}</h4>
                          {contact.encounter_with_god && (
                            <Heart className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {getCellName(contact.cell_id)}
                          </p>
                          
                          {contact.whatsapp && (
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {contact.whatsapp}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Badge 
                            variant={contact.status === 'member' ? 'default' : 
                                   contact.status === 'visitor' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {contact.status === 'member' ? 'Membro' : 
                             contact.status === 'visitor' ? 'Visitante' : 'Pendente'}
                          </Badge>
                          
                          {contact.encounter_with_god && (
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                              Encontro
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Indicadores de fluxo para desktop */}
      <div className="hidden lg:flex justify-center items-center space-x-8 mt-4">
        {stages.slice(0, -1).map((_, index) => (
          <ArrowRight key={index} className="w-6 h-6 text-gray-400" />
        ))}
      </div>
    </div>
  );
};
