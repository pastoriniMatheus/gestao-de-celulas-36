
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, MapPin, Webhook } from 'lucide-react';

export const Settings = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  const cities = [
    'São Paulo',
    'Rio de Janeiro', 
    'Belo Horizonte',
    'Salvador',
    'Brasília',
    'Fortaleza'
  ];

  const neighborhoodsByCity: { [key: string]: string[] } = {
    'São Paulo': ['Centro', 'Vila Madalena', 'Jardim Europa', 'Moema', 'Ipiranga'],
    'Rio de Janeiro': ['Copacabana', 'Ipanema', 'Botafogo', 'Tijuca', 'Barra da Tijuca'],
    'Belo Horizonte': ['Centro', 'Savassi', 'Pampulha', 'Funcionários', 'Santo Antônio'],
    'Salvador': ['Pelourinho', 'Barra', 'Campo Grande', 'Pituba', 'Ondina'],
    'Brasília': ['Asa Norte', 'Asa Sul', 'Águas Claras', 'Taguatinga', 'Sobradinho'],
    'Fortaleza': ['Centro', 'Aldeota', 'Meireles', 'Cocó', 'Papicu']
  };

  const handleSaveSettings = () => {
    console.log('Configurações salvas:', { selectedCity, webhookUrl });
    // Aqui implementaríamos a lógica de salvamento
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <SettingsIcon size={24} className="text-gray-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações de Localização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin size={20} />
              Localização da Igreja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCity && (
              <div>
                <Label>Bairros Disponíveis</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Bairros cadastrados para {selectedCity}:</p>
                  <div className="flex flex-wrap gap-2">
                    {neighborhoodsByCity[selectedCity]?.map((neighborhood) => (
                      <span
                        key={neighborhood}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {neighborhood}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configurações de Integração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook size={20} />
              Integração de Mensagens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="webhook">URL do Webhook</Label>
              <Input
                id="webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://seu-sistema.com/webhook"
                type="url"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL para envio das mensagens de nutrição automática
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Como funciona:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• As mensagens do pipeline são enviadas para este webhook</li>
                <li>• O webhook receberá dados do contato e mensagem</li>
                <li>• Configure seu sistema para processar as mensagens</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Configurações Gerais */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configurações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="churchName">Nome da Igreja</Label>
                <Input
                  id="churchName"
                  placeholder="Digite o nome da igreja"
                  defaultValue="Igreja Batista Central"
                />
              </div>
              <div>
                <Label htmlFor="adminEmail">Email do Administrador</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@igreja.com"
                  defaultValue="admin@igrejabatistacentral.com"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
                Salvar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
