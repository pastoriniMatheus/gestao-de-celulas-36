
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { User, Phone, MapPin, Search, Filter } from 'lucide-react';
import { usePipelineStages } from '@/hooks/usePipelineStages';
import { useContacts } from '@/hooks/useContacts';
import { useCells } from '@/hooks/useCells';
import { EditContactDialog } from './EditContactDialog';

export const KanbanPipeline = () => {
  const { stages, loading: stagesLoading } = usePipelineStages();
  const { contacts, loading: contactsLoading, updateContact } = useContacts();
  const { cells } = useCells();
  
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCellFilter, setSelectedCellFilter] = useState<string>('all');

  // Filtrar contatos baseado na pesquisa e célula selecionada
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contact.whatsapp && contact.whatsapp.includes(searchTerm));
    
    const matchesCell = selectedCellFilter === 'all' || 
                       (selectedCellFilter === 'no-cell' && !contact.cell_id) ||
                       contact.cell_id === selectedCellFilter;
    
    return matchesSearch && matchesCell && contact.pipeline_stage_id;
  });

  const handleMoveContact = async (contactId: string, newStageId: string) => {
    try {
      await updateContact(contactId, { pipeline_stage_id: newStageId });
    } catch (error) {
      console.error('Erro ao mover contato:', error);
    }
  };

  const getCellName = (cellId: string) => {
    const cell = cells.find(c => c.id === cellId);
    return cell ? cell.name : 'Sem célula';
  };

  const handleEditContact = (contact: any) => {
    setSelectedContact(contact);
    setEditDialogOpen(true);
  };

  if (stagesLoading || contactsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando pipeline...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar contato</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Nome ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrar por célula</label>
              <Select value={selectedCellFilter} onValueChange={setSelectedCellFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as células" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as células</SelectItem>
                  <SelectItem value="no-cell">Sem célula</SelectItem>
                  {cells.filter(cell => cell.active).map((cell) => (
                    <SelectItem key={cell.id} value={cell.id}>
                      {cell.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Kanban */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageContacts = filteredContacts.filter(
            contact => contact.pipeline_stage_id === stage.id
          );

          return (
            <Card key={stage.id} className="min-w-[300px] flex-shrink-0">
              <CardHeader 
                className="pb-3"
                style={{ backgroundColor: `${stage.color}15`, borderBottom: `2px solid ${stage.color}` }}
              >
                <CardTitle className="flex items-center justify-between">
                  <span style={{ color: stage.color }}>{stage.name}</span>
                  <Badge variant="secondary">{stageContacts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {stageContacts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum contato</p>
                  </div>
                ) : (
                  stageContacts.map((contact) => (
                    <Card 
                      key={contact.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                      style={{ borderLeftColor: stage.color }}
                      onClick={() => handleEditContact(contact)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">{contact.name}</h4>
                            <Badge 
                              variant={contact.status === 'member' ? 'default' : 
                                     contact.status === 'visitor' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {contact.status === 'member' ? 'Membro' :
                               contact.status === 'visitor' ? 'Visitante' : 'Pendente'}
                            </Badge>
                          </div>
                          
                          {contact.whatsapp && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Phone className="h-3 w-3" />
                              <span>{contact.whatsapp}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{contact.neighborhood}</span>
                          </div>

                          {contact.cell_id && (
                            <div className="text-xs text-blue-600 font-medium">
                              {getCellName(contact.cell_id)}
                            </div>
                          )}
                          
                          <div className="flex gap-1 mt-2">
                            {contact.encounter_with_god && (
                              <Badge variant="outline" className="text-xs">EcD</Badge>
                            )}
                            {contact.baptized && (
                              <Badge variant="outline" className="text-xs">Batizado</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog de edição */}
      {selectedContact && (
        <EditContactDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          contact={selectedContact}
          context="contacts"
        />
      )}
    </div>
  );
};
