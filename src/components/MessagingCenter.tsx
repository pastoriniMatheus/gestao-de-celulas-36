
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Send, Filter, Users, Search, History, Save, Clock } from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';
import { useMessageHistory } from '@/hooks/useMessageHistory';
import { useMessageTemplates } from '@/hooks/useMessageTemplates';
import { EmojiPicker } from './EmojiPicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

  const { history, loading: historyLoading, saveMessageToHistory } = useMessageHistory();
  const { templates, addTemplate } = useMessageTemplates();

  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [filters, setFilters] = useState({
    encounterWithGod: undefined as boolean | undefined,
    cellId: '',
    pipelineStageId: '',
    status: '',
    searchName: ''
  });

  // Estados para salvar template
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

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

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMessage(template.message);
      setSelectedTemplate(templateId);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !message.trim()) return;

    try {
      await addTemplate({
        name: templateName,
        template_type: 'custom',
        message: message,
        variables: [],
        active: true
      });
      
      setTemplateName('');
      setShowSaveTemplate(false);
    } catch (error) {
      console.error('Erro ao salvar template:', error);
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

    const success = await sendMessage(selectedContacts, message, selectedTemplate || undefined);
    if (success) {
      // Salvar no histórico
      await saveMessageToHistory(message, selectedContacts, selectedTemplate || undefined);
      
      setMessage('');
      setSelectedContacts([]);
      setSelectedTemplate('');
    }
  };

  const handleUseHistoryMessage = (messageContent: string) => {
    setMessage(messageContent);
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
          <Tabs defaultValue="compose" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="compose">Compor Mensagem</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-6">
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
                    <Select value={filters.encounterWithGod?.toString() || 'todos'} onValueChange={(value) => 
                      handleFilterChange('encounterWithGod', value === 'todos' ? undefined : value === 'true')
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="true">Sim</SelectItem>
                        <SelectItem value="false">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Célula</label>
                    <Select value={filters.cellId || 'todas'} onValueChange={(value) => handleFilterChange('cellId', value === 'todas' ? '' : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as células" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas as células</SelectItem>
                        {cells.map(cell => (
                          <SelectItem key={cell.id} value={cell.id}>{cell.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Estágio Pipeline</label>
                    <Select value={filters.pipelineStageId || 'todos'} onValueChange={(value) => handleFilterChange('pipelineStageId', value === 'todos' ? '' : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os estágios" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os estágios</SelectItem>
                        {pipelineStages.map(stage => (
                          <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                    <Select value={filters.status || 'todos'} onValueChange={(value) => handleFilterChange('status', value === 'todos' ? '' : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os status</SelectItem>
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
                {/* Seletor de Template */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Template (opcional)</label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Nenhum template</SelectItem>
                      {templates.filter(t => t.active).map(template => (
                        <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Mensagem</label>
                    <div className="flex items-center gap-2">
                      <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                      <Dialog open={showSaveTemplate} onOpenChange={setShowSaveTemplate}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" disabled={!message.trim()}>
                            <Save className="h-4 w-4 mr-1" />
                            Salvar Template
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Salvar como Template</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Nome do template"
                              value={templateName}
                              onChange={(e) => setTemplateName(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowSaveTemplate(false)}>
                                Cancelar
                              </Button>
                              <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
                                Salvar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
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
            </TabsContent>

            <TabsContent value="templates">
              <div className="text-center py-8">
                <p className="text-gray-500">Templates são gerenciados na seção dedicada de templates.</p>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <History className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Histórico de Mensagens</h3>
              </div>
              
              {historyLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>Carregando histórico...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma mensagem enviada ainda.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={item.status === 'sent' ? 'default' : item.status === 'partial' ? 'outline' : 'destructive'}>
                            {item.status === 'sent' ? 'Enviado' : item.status === 'partial' ? 'Parcial' : 'Falha'}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {item.recipients_count} destinatário(s)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {format(new Date(item.sent_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUseHistoryMessage(item.message_content)}
                          >
                            Usar
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{item.message_content}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
