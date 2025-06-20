
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Users, Webhook } from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';
import { useWebhookConfigs } from '@/hooks/useWebhookConfigs';
import { toast } from '@/hooks/use-toast';

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

  const { webhooks } = useWebhookConfigs();
  
  const [message, setMessage] = useState('');
  const [selectedCell, setSelectedCell] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedWebhook, setSelectedWebhook] = useState<string>('');
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const filters = {
      ...(selectedCell && { cellId: selectedCell }),
      ...(selectedStage && { pipelineStageId: selectedStage }),
      ...(selectedStatus && { status: selectedStatus })
    };
    applyFilters(filters);
  }, [selectedCell, selectedStage, selectedStatus, applyFilters]);

  const handleSelectAll = (checked: boolean) => {
    setIsSelectAll(checked);
    if (checked) {
      setSelectedContacts(contacts.map(c => c.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleContactSelect = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, contactId]);
    } else {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
      setIsSelectAll(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || selectedContacts.length === 0) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem e selecione pelo menos um contato",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    
    try {
      // Enviar webhook se selecionado
      if (selectedWebhook) {
        const webhook = webhooks.find(w => w.id === selectedWebhook);
        if (webhook) {
          const selectedContactsData = contacts.filter(c => selectedContacts.includes(c.id));
          
          await fetch(webhook.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              event_type: 'message_sent',
              message: message,
              contacts: selectedContactsData,
              timestamp: new Date().toISOString()
            })
          });
        }
      }

      // Enviar mensagens
      const success = await sendMessage(selectedContacts, message);
      
      if (success) {
        setMessage('');
        setSelectedContacts([]);
        setIsSelectAll(false);
      }
    } catch (error) {
      console.error('Erro ao enviar:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar envio",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Central de Mensagens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedCell} onValueChange={setSelectedCell}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as células" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as células</SelectItem>
                {cells.map((cell) => (
                  <SelectItem key={cell.id} value={cell.id}>
                    {cell.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os estágios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os estágios</SelectItem>
                {pipelineStages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="member">Membros</SelectItem>
                <SelectItem value="visitor">Visitantes</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Webhook */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Webhook (opcional)
            </label>
            <Select value={selectedWebhook} onValueChange={setSelectedWebhook}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar webhook" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum webhook</SelectItem>
                {webhooks.filter(w => w.active).map((webhook) => (
                  <SelectItem key={webhook.id} value={webhook.id}>
                    {webhook.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mensagem */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mensagem</label>
            <Textarea
              placeholder="Digite sua mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contatos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contatos ({contacts.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={isSelectAll}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm">
                Selecionar todos
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={(checked) => handleContactSelect(contact.id, checked as boolean)}
                  />
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.whatsapp}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {contact.status === 'member' ? 'Membro' :
                   contact.status === 'visitor' ? 'Visitante' : 'Pendente'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botão Enviar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedContacts.length} contato(s) selecionado(s)
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={sending || selectedContacts.length === 0 || !message.trim()}
              className="flex items-center gap-2"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              Enviar Mensagem
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
