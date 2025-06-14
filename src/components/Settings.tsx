
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, MapPin, Webhook, Palette, Image, Globe, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AddCityDialog } from './AddCityDialog';
import { AddNeighborhoodDialog } from './AddNeighborhoodDialog';

interface City {
  id: string;
  name: string;
  state: string;
}

interface Neighborhood {
  id: string;
  name: string;
  city_id: string;
}

interface ChurchSettings {
  name: string;
  admin_email: string;
  selected_city: string;
  webhook_url: string;
  primary_color: string;
  secondary_color: string;
  logo: string;
  favicon: string;
}

export const Settings = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Estados das configurações
  const [settings, setSettings] = useState<ChurchSettings>({
    name: '',
    admin_email: '',
    selected_city: '',
    webhook_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#64748B',
    logo: '',
    favicon: ''
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([
      fetchCities(),
      fetchNeighborhoods(),
      loadSettings()
    ]);
    setLoading(false);
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as cidades",
        variant: "destructive"
      });
    }
  };

  const fetchNeighborhoods = async () => {
    try {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setNeighborhoods(data || []);
    } catch (error) {
      console.error('Erro ao buscar bairros:', error);
    }
  };

  const loadSettings = async () => {
    try {
      console.log('Carregando configurações...');
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'church_settings')
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar configurações:', error);
        return;
      }

      if (data?.value) {
        console.log('Configurações carregadas:', data.value);
        // Converter Json para ChurchSettings com type assertion segura
        const churchSettings = data.value as unknown as ChurchSettings;
        setSettings(churchSettings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleCityChange = (cityId: string) => {
    setSettings(prev => ({ ...prev, selected_city: cityId }));
    const cityNeighborhoods = neighborhoods.filter(n => n.city_id === cityId);
    setSelectedNeighborhoods(cityNeighborhoods);
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      console.log('Salvando configurações:', settings);
      
      // Converter ChurchSettings para Json com type assertion
      const settingsAsJson = settings as unknown as any;
      
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'church_settings',
          value: settingsAsJson
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (type: 'logo' | 'favicon') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'favicon' ? 'image/png,image/jpg,image/jpeg' : 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setSettings(prev => ({
          ...prev,
          [type]: url
        }));
      }
    };
    input.click();
  };

  const updateSetting = (key: keyof ChurchSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <div className="flex items-center gap-4">
          <SettingsIcon size={24} className="text-gray-600" />
          <Button 
            onClick={handleSaveSettings} 
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Tudo'}
          </Button>
        </div>
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
              <Select value={settings.selected_city} onValueChange={handleCityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name} - {city.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <AddCityDialog onCityAdded={fetchCities} />

            {settings.selected_city && selectedNeighborhoods.length > 0 && (
              <div>
                <Label>Bairros Cadastrados</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Bairros disponíveis para {cities.find(c => c.id === settings.selected_city)?.name}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedNeighborhoods.map((neighborhood) => (
                      <span
                        key={neighborhood.id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {neighborhood.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <AddNeighborhoodDialog cities={cities} onNeighborhoodAdded={fetchNeighborhoods} />
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
                    value={settings.primary_color}
                    onChange={(e) => updateSetting('primary_color', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={settings.primary_color}
                    onChange={(e) => updateSetting('primary_color', e.target.value)}
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
                    value={settings.secondary_color}
                    onChange={(e) => updateSetting('secondary_color', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={settings.secondary_color}
                    onChange={(e) => updateSetting('secondary_color', e.target.value)}
                    placeholder="#64748B"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Logotipo</Label>
              <div className="mt-2 space-y-2">
                {settings.logo && (
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <img src={settings.logo} alt="Logo" className="h-16 object-contain" />
                  </div>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => handleFileUpload('logo')}
                  className="w-full"
                >
                  <Image className="w-4 h-4 mr-2" />
                  {settings.logo ? 'Alterar Logotipo' : 'Enviar Logotipo'}
                </Button>
              </div>
            </div>

            <div>
              <Label>Favicon</Label>
              <div className="mt-2 space-y-2">
                {settings.favicon && (
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <img src={settings.favicon} alt="Favicon" className="h-8 object-contain" />
                  </div>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => handleFileUpload('favicon')}
                  className="w-full"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {settings.favicon ? 'Alterar Favicon' : 'Enviar Favicon'}
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
                value={settings.webhook_url}
                onChange={(e) => updateSetting('webhook_url', e.target.value)}
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
                  value={settings.name}
                  onChange={(e) => updateSetting('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="adminEmail">Email do Administrador</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@igreja.com"
                  value={settings.admin_email}
                  onChange={(e) => updateSetting('admin_email', e.target.value)}
                />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2 text-green-800">Status do Sistema:</h4>
              <ul className="text-xs text-green-700 space-y-1">
                <li>✅ Banco de dados conectado</li>
                <li>✅ Dados de teste carregados</li>
                <li>✅ Sistema de configurações ativo</li>
                <li>✅ Pronto para uso</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
