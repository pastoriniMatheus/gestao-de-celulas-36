
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Webhook } from 'lucide-react';
import { useBirthdayWebhooks } from '@/hooks/useBirthdayWebhooks';
import { useWebhookConfigs } from '@/hooks/useWebhookConfigs';

export const WebhookManager = () => {
  const { webhooks, loading: webhooksLoading, addWebhook, toggleWebhook, deleteWebhook } = useBirthdayWebhooks();
  const { webhooks: configs, loading: configsLoading, addWebhook: addConfig, updateWebhook: updateConfig, deleteWebhook: deleteConfig } = useWebhookConfigs();
  
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newConfig, setNewConfig] = useState({
    name: '',
    webhook_url: '',
    event_type: 'new_contact' as const,
    headers: {}
  });

  const handleAddWebhook = async () => {
    if (!newWebhookUrl.trim()) return;
    
    try {
      await addWebhook(newWebhookUrl);
      setNewWebhookUrl('');
    } catch (error) {
      console.error('Erro ao adicionar webhook:', error);
    }
  };

  const handleAddConfig = async () => {
    if (!newConfig.name.trim() || !newConfig.webhook_url.trim()) return;
    
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
    } catch (error) {
      console.error('Erro ao adicionar configuração:', error);
    }
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
            Configure webhooks para receber notificações de eventos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="birthday" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="birthday">Aniversários</TabsTrigger>
              <TabsTrigger value="general">Configurações Gerais</TabsTrigger>
            </TabsList>
            
            <TabsContent value="birthday" className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="URL do webhook para aniversários"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                  />
                  <Button onClick={handleAddWebhook}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
                
                {webhooksLoading ? (
                  <div className="text-center py-4">Carregando...</div>
                ) : (
                  <div className="space-y-2">
                    {webhooks.map((webhook) => (
                      <div key={webhook.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{webhook.webhook_url}</p>
                          <p className="text-xs text-gray-500">
                            Criado em {new Date(webhook.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
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
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="config-name">Nome da Configuração</Label>
                    <Input
                      id="config-name"
                      placeholder="Nome da configuração"
                      value={newConfig.name}
                      onChange={(e) => setNewConfig({...newConfig, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="config-event">Tipo de Evento</Label>
                    <Select
                      value={newConfig.event_type}
                      onValueChange={(value: any) => setNewConfig({...newConfig, event_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="birthday">Aniversário</SelectItem>
                        <SelectItem value="new_contact">Novo Contato</SelectItem>
                        <SelectItem value="pipeline_change">Mudança de Pipeline</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="config-url">URL do Webhook</Label>
                  <Input
                    id="config-url"
                    placeholder="https://exemplo.com/webhook"
                    value={newConfig.webhook_url}
                    onChange={(e) => setNewConfig({...newConfig, webhook_url: e.target.value})}
                  />
                </div>
                
                <Button onClick={handleAddConfig}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Configuração
                </Button>
              </div>
              
              {configsLoading ? (
                <div className="text-center py-4">Carregando...</div>
              ) : (
                <div className="space-y-2">
                  {configs.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{config.name}</p>
                        <p className="text-xs text-gray-500">{config.webhook_url}</p>
                        <p className="text-xs text-blue-600">{config.event_type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.active}
                          onCheckedChange={(checked) => updateConfig(config.id, { active: checked })}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteConfig(config.id)}
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
    </div>
  );
};
