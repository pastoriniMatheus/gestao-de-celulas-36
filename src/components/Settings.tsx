
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, MapPin, Webhook, Palette, Image, Globe, Plus } from 'lucide-react';

export const Settings = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#64748B');
  const [logo, setLogo] = useState('');
  const [favicon, setFavicon] = useState('');

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

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    // Aqui você implementaria a busca real de bairros da cidade
    // Por enquanto, usamos os dados simulados
    setSelectedNeighborhoods(neighborhoodsByCity[city] || []);
  };

  const handleSaveSettings = () => {
    console.log('Configurações salvas:', { 
      selectedCity, 
      selectedNeighborhoods,
      webhookUrl,
      primaryColor,
      secondaryColor,
      logo,
      favicon
    });
    // Aqui implementaríamos a lógica de salvamento
  };

  const handleFileUpload = (type: 'logo' | 'favicon') => {
    // Simulação de upload de arquivo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'favicon' ? 'image/png,image/jpg,image/jpeg' : 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        if (type === 'logo') {
          setLogo(url);
        } else {
          setFavicon(url);
        }
      }
    };
    input.click();
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
              <Select value={selectedCity} onValueChange={handleCityChange}>
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

            {selectedCity && selectedNeighborhoods.length > 0 && (
              <div>
                <Label>Bairros Cadastrados</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Bairros disponíveis para {selectedCity}:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedNeighborhoods.map((neighborhood) => (
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

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                if (selectedCity) {
                  // Simular busca de mais bairros
                  const moreBairros = ['Novo Bairro 1', 'Novo Bairro 2'];
                  setSelectedNeighborhoods([...selectedNeighborhoods, ...moreBairros]);
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Buscar Mais Bairros
            </Button>
          </CardContent>
        </Card>

        {/* Personalização Visual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette size={20} />
              Personalização Visual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Cor Primária</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondaryColor">Cor Secundária</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="#64748B"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Logotipo</Label>
              <div className="mt-2 space-y-2">
                {logo && (
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <img src={logo} alt="Logo" className="h-16 object-contain" />
                  </div>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => handleFileUpload('logo')}
                  className="w-full"
                >
                  <Image className="w-4 h-4 mr-2" />
                  {logo ? 'Alterar Logotipo' : 'Enviar Logotipo'}
                </Button>
              </div>
            </div>

            <div>
              <Label>Favicon</Label>
              <div className="mt-2 space-y-2">
                {favicon && (
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <img src={favicon} alt="Favicon" className="h-8 object-contain" />
                  </div>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => handleFileUpload('favicon')}
                  className="w-full"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {favicon ? 'Alterar Favicon' : 'Enviar Favicon'}
                </Button>
                <p className="text-xs text-gray-500">
                  Recomendado: PNG/JPG (Lovable não suporta .ico)
                </p>
              </div>
            </div>
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
        <Card>
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
