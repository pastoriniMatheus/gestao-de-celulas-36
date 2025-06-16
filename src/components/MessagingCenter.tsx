
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Filter, Users, Search } from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';

export const MessagingCenter = () => {
  const {
    contacts,
    cells,
    pipelineStages,
    selectedContacts,
    loading,
    setSelectedContacts,
    applyFilters,
    sendMessage
  } = useMessaging();

  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({
    encounterWithGod: undefined as boolean | undefined,
    cellId: '',
    pipelineStageId: '',
    status: '',
    searchName: ''
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  const handleContactSelect = (contactId: string) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert('Digite uma mensagem');
      return;
    }

    if (selectedContacts.length === 0) {
      alert('Selecione pelo menos um contato');
      return;
    }

    const success = await sendMessage(selectedContacts, message);
    if (success) {
      setMessage('');
      setSelectedContacts([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando contatos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Central de Mensagens
          </CardTitle>
          <CardDescription>
            Envie mensagens personalizadas para os contatos selecionados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtros */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-700">Filtros</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  <Search className="h-4 w-4 inline mr-1" />
                  Buscar por nome
                </label>
                <Input
                  placeholder="Digite o nome..."
                  value={filters.searchName}
                  onChange={(e) => handleFilterChange('searchName', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Encontro com Deus</label>
                <Select value={filters.encounterWithGod?.toString() || 'all'} onValueChange={(value) => 
                  handleFilterChange('encounterWithGod', value === 'all' ? undefined : value === 'true')
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Célula</label>
                <Select value={filters.cellId || 'all'} onValueChange={(value) => handleFilterChange('cellId', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as células" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as células</SelectItem>
                    {cells.map(cell => (
                      <SelectItem key={cell.id} value={cell.id}>{cell.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Estágio Pipeline</label>
                <Select value={filters.pipelineStageId || 'all'} onValueChange={(value) => handleFilterChange('pipelineStageId', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os estágios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os estágios</SelectItem>
                    {pipelineStages.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="member">Membro</SelectItem>
                    <SelectItem value="visitor">Visitante</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Lista de Contatos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  {selectedContacts.length === contacts.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </Button>
                <Badge variant="secondary">
                  {contacts.length} contatos encontrados
                </Badge>
                {selectedContacts.length > 0 && (
                  <Badge>
                    {selectedContacts.length} selecionados
                  </Badge>
                )}
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-lg">
              {contacts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nenhum contato encontrado com os filtros aplicados
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {contacts.map(contact => (
                    <div key={contact.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={() => handleContactSelect(contact.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{contact.name}</span>
                          {contact.encounter_with_god && <Badge variant="secondary" className="text-xs">Encontro</Badge>}
                          {!contact.whatsapp && <Badge variant="destructive" className="text-xs">Sem WhatsApp</Badge>}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contact.neighborhood} • {contact.status}
                          {contact.whatsapp && ` • ${contact.whatsapp}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Área de Mensagem */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Mensagem</label>
              <Textarea
                placeholder="Digite sua mensagem aqui..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {selectedContacts.length > 0 && (
                  <>Será enviado para {selectedContacts.length} contato(s)</>
                )}
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={selectedContacts.length === 0 || !message.trim()}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Enviar Mensagens
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
