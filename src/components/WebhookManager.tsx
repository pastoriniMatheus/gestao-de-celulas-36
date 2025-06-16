
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Webhook, TestTube, CheckCircle } from 'lucide-react';
import { useBirthdayWebhooks } from '@/hooks/useBirthdayWebhooks';
import { useWebhookConfigs } from '@/hooks/useWebhookConfigs';
import { toast } from '@/hooks/use-toast';

export const WebhookManager = () => {
  const { webhooks, loading: webhooksLoading, addWebhook, toggleWebhook, deleteWebhook } = useBirthdayWebhooks();
  const { webhooks: configs, loading: configsLoading, addWebhook: addConfig, updateWebhook: updateConfig, deleteWebhook: deleteConfig } = useWebhookConfigs();
  
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [newConfig, setNewConfig] = useState({
    name: '',
    webhook_url: '',
    event_type: 'new_contact' as const,
    headers: {}
  });

  const handleAddWebhook = async () => {
    if (!newWebhookUrl.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL válida",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addWebhook(newWebhookUrl);
      setNewWebhookUrl('');
    } catch (error) {
      console.error('Erro ao adicionar webhook:', error);
    }
  };

  const handleAddConfig = async () => {
    if (!newConfig.name.trim() || !newConfig.webhook_url.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addConfig({
        ...newConfig,
        active: true
      });
      setNewConfig({
        name: '',
        webhook_url: '',
        event_type: 'new_contact',
        headers: {}
      });
      
      toast({
        title: "Sucesso",
        description: "Webhook configurado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao adicionar configuração:', error);
    }
  };

  const testWebhook = async (url: string, id: string) => {
    setTestingWebhook(id);
    
    try {
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
        message: "Este é um teste do webhook",
        event_type: "test",
        data: {
          test_field: "test_value"
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        toast({
          title: "Teste bem-sucedido!",
          description: `Webhook respondeu com status ${response.status}`,
        });
      } else {
        toast({
          title: "Falha no teste",
          description: `Webhook respondeu com status ${response.status}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      toast({
        title: "Erro no teste",
        description: "Falha ao conectar com o webhook. Verifique a URL.",
        variant: "destructive"
      });
    } finally {
      setTestingWebhook(null);
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    const labels: { [key: string]: string } = {
      'birthday': 'Aniversário',
      'new_contact': 'Novo Contato',
      'pipeline_change': 'Mudança de Pipeline',
      'custom': 'Personalizado'
    };
    return labels[eventType] || eventType;
  };

  const getEventTypeDescription = (eventType: string) => {
    const descriptions: { [key: string]: string } = {
      'birthday': 'Disparado automaticamente quando é aniversário de um contato',
      'new_contact': 'Disparado quando um novo contato é cadastrado',
      'pipeline_change': 'Disparado quando um contato muda de estágio no pipeline',
      'custom': 'Webhook personalizado para eventos específicos'
    };
    return descriptions[eventType] || 'Evento personalizado';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-blue-600" />
            Gerenciar Webhooks
          </CardTitle>
          <CardDescription>
            Configure webhooks para receber notificações de eventos do sistema. 
            Webhooks são URLs que recebem dados automaticamente quando eventos específicos acontecem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="birthday" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="birthday">Aniversários</TabsTrigger>
              <TabsTrigger value="general">Configurações Gerais</TabsTrigger>
            </TabsList>
            
            <TabsContent value="birthday" className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Webhooks de Aniversário</h4>
                <p className="text-sm text-blue-700">
                  Estes webhooks são disparados automaticamente quando algum contato faz aniversário.
                  Os dados do contato são enviados via POST para as URLs configuradas.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://exemplo.com/webhook-aniversario"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddWebhook} disabled={!newWebhookUrl.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
                
                {webhooksLoading ? (
                  <div className="text-center py-4">Carregando...</div>
                ) : webhooks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Webhook className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Nenhum webhook de aniversário configurado</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {webhooks.map((webhook) => (
                      <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                        <div className="flex-1">
                          <p className="text-sm font-medium break-all">{webhook.webhook_url}</p>
                          <p className="text-xs text-gray-500">
                            Criado em {new Date(webhook.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${webhook.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                              {webhook.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testWebhook(webhook.webhook_url, webhook.id)}
                            disabled={testingWebhook === webhook.id}
                          >
                            {testingWebhook === webhook.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                              <TestTube className="h-4 w-4" />
                            )}
                          </Button>
                          <Switch
                            checked={webhook.active}
                            onCheckedChange={(checked) => toggleWebhook(webhook.id, checked)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteWebhook(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="general" className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Webhooks Configuráveis</h4>
                <p className="text-sm text-green-700">
                  Configure webhooks para diferentes tipos de eventos no sistema.
                  Cada tipo de evento enviará dados específicos relacionados ao evento.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="config-name">Nome da Configuração *</Label>
                    <Input
                      id="config-name"
                      placeholder="Ex: Webhook Novos Contatos"
                      value={newConfig.name}
                      onChange={(e) => setNewConfig({...newConfig, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="config-event">Tipo de Evento *</Label>
                    <Select
                      value={newConfig.event_type}
                      onValueChange={(value: any) => setNewConfig({...newConfig, event_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new_contact">Novo Contato</SelectItem>
                        <SelectItem value="pipeline_change">Mudança de Pipeline</SelectItem>
                        <SelectItem value="birthday">Aniversário</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      {getEventTypeDescription(newConfig.event_type)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="config-url">URL do Webhook *</Label>
                  <Input
                    id="config-url"
                    placeholder="https://exemplo.com/meu-webhook"
                    value={newConfig.webhook_url}
                    onChange={(e) => setNewConfig({...newConfig, webhook_url: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL que receberá os dados via POST quando o evento ocorrer
                  </p>
                </div>
                
                <Button 
                  onClick={handleAddConfig}
                  disabled={!newConfig.name.trim() || !newConfig.webhook_url.trim()}
                  className="w-full md:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Configuração
                </Button>
              </div>
              
              {configsLoading ? (
                <div className="text-center py-4">Carregando...</div>
              ) : configs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Webhook className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma configuração de webhook encontrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Webhooks Configurados:</h4>
                  {configs.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{config.name}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${config.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {config.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 break-all">{config.webhook_url}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                            {getEventTypeLabel(config.event_type)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getEventTypeDescription(config.event_type)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testWebhook(config.webhook_url, config.id)}
                          disabled={testingWebhook === config.id}
                          title="Testar webhook"
                        >
                          {testingWebhook === config.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : (
                            <TestTube className="h-4 w-4" />
                          )}
                        </Button>
                        <Switch
                          checked={config.active}
                          onCheckedChange={(checked) => updateConfig(config.id, { active: checked })}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteConfig(config.id)}
                          title="Excluir webhook"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Informações sobre Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Como Funcionam os Webhooks</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p><strong>Aniversários:</strong> Disparados automaticamente quando é aniversário de alguém</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p><strong>Novos Contatos:</strong> Disparados quando um novo contato é cadastrado</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p><strong>Pipeline:</strong> Disparados quando um contato muda de estágio</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p><strong>Teste:</strong> Use o botão de teste para verificar se seu webhook está funcionando</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
