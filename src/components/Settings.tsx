import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings as SettingsIcon, Save, Palette, Plus, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthProvider';

// Interface para as configurações da igreja
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
  
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddCellDialogOpen, setIsAddCellDialogOpen] = useState(false);
  const [cellFormData, setCellFormData] = useState({
    name: '',
    address: '',
    meeting_day: 1,
    meeting_time: '19:00',
    leader_id: '',
    active: true
  });
  const [leaders, setLeaders] = useState<any[]>([]);
  
  const { toast } = useToast();
  const { userProfile } = useAuth();

  // Verificar se o usuário é admin
  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadSettings();
      loadCities();
      loadLeaders();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadSettings = async () => {
    try {
      console.log('Carregando configurações...');
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'church_settings')
        .single();

      if (error) {
        console.error('Erro ao carregar configurações:', error);
        if (error.code !== 'PGRST116') { // PGRST116 = no rows returned
          toast({
            title: "Erro ao carregar configurações",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (data?.value) {
        console.log('Configurações carregadas:', data.value);
        setSettings(data.value as unknown as ChurchSettings);
      }
    } catch (error) {
      console.error('Erro na consulta de configurações:', error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Erro ao carregar cidades:', error);
        return;
      }

      setCities(data || []);
    } catch (error) {
      console.error('Erro na consulta de cidades:', error);
    }
  };

  const loadLeaders = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'leader'])
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Erro ao buscar líderes:', error);
        return;
      }

      setLeaders(data || []);
    } catch (error) {
      console.error('Erro na consulta de líderes:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'church_settings',
          value: settings as unknown as any
        });

      if (error) throw error;

      toast({
        title: "Configurações salvas com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar configurações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const cellData = {
        name: cellFormData.name,
        address: cellFormData.address,
        meeting_day: cellFormData.meeting_day,
        meeting_time: cellFormData.meeting_time,
        leader_id: cellFormData.leader_id || null,
        active: cellFormData.active
      };

      const { error } = await supabase
        .from('cells')
        .insert([cellData]);

      if (error) throw error;

      toast({
        title: "Célula criada com sucesso!",
      });

      setIsAddCellDialogOpen(false);
      setCellFormData({
        name: '',
        address: '',
        meeting_day: 1,
        meeting_time: '19:00',
        leader_id: '',
        active: true
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar célula",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getDayName = (day: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[day] || `Dia ${day}`;
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-red-600" />
            Acesso Negado
          </CardTitle>
          <CardDescription>
            Você não tem permissão para acessar as configurações do sistema.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando configurações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-blue-600" />
                Configurações da Igreja
              </CardTitle>
              <CardDescription>
                Configure as informações gerais da igreja
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddCellDialogOpen} onOpenChange={setIsAddCellDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => {
                    setCellFormData({
                      name: '',
                      address: '',
                      meeting_day: 1,
                      meeting_time: '19:00',
                      leader_id: '',
                      active: true
                    });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    <Home className="h-4 w-4 mr-2" />
                    Adicionar Célula
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nova Célula</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCellSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="cell_name">Nome da Célula</Label>
                      <Input
                        id="cell_name"
                        value={cellFormData.name}
                        onChange={(e) => setCellFormData({ ...cellFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cell_address">Endereço</Label>
                      <Input
                        id="cell_address"
                        value={cellFormData.address}
                        onChange={(e) => setCellFormData({ ...cellFormData, address: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cell_meeting_day">Dia da Reunião</Label>
                      <Select value={cellFormData.meeting_day.toString()} onValueChange={(value) => setCellFormData({ ...cellFormData, meeting_day: parseInt(value) })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Domingo</SelectItem>
                          <SelectItem value="1">Segunda-feira</SelectItem>
                          <SelectItem value="2">Terça-feira</SelectItem>
                          <SelectItem value="3">Quarta-feira</SelectItem>
                          <SelectItem value="4">Quinta-feira</SelectItem>
                          <SelectItem value="5">Sexta-feira</SelectItem>
                          <SelectItem value="6">Sábado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cell_meeting_time">Horário</Label>
                      <Input
                        id="cell_meeting_time"
                        type="time"
                        value={cellFormData.meeting_time}
                        onChange={(e) => setCellFormData({ ...cellFormData, meeting_time: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cell_leader_id">Líder</Label>
                      <Select value={cellFormData.leader_id} onValueChange={(value) => setCellFormData({ ...cellFormData, leader_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um líder" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sem líder</SelectItem>
                          {leaders.map((leader) => (
                            <SelectItem key={leader.id} value={leader.id}>
                              {leader.name} ({leader.role === 'admin' ? 'Admin' : 'Líder'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="cell_active"
                        checked={cellFormData.active}
                        onChange={(e) => setCellFormData({ ...cellFormData, active: e.target.checked })}
                      />
                      <Label htmlFor="cell_active">Ativa</Label>
                    </div>
                    <Button type="submit" className="w-full">
                      Criar Célula
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome da Igreja</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="Nome da Igreja"
              />
            </div>
            <div>
              <Label htmlFor="admin_email">Email do Administrador</Label>
              <Input
                id="admin_email"
                type="email"
                value={settings.admin_email}
                onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
                placeholder="admin@igreja.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="selected_city">Cidade Principal</Label>
              <Select value={settings.selected_city} onValueChange={(value) => setSettings({ ...settings, selected_city: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma cidade" />
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
            <div>
              <Label htmlFor="webhook_url">URL do Webhook</Label>
              <Input
                id="webhook_url"
                value={settings.webhook_url}
                onChange={(e) => setSettings({ ...settings, webhook_url: e.target.value })}
                placeholder="https://exemplo.com/webhook"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Personalização Visual</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary_color">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondary_color">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    placeholder="#64748B"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logo">URL do Logo</Label>
                <Input
                  id="logo"
                  value={settings.logo}
                  onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>
              <div>
                <Label htmlFor="favicon">URL do Favicon</Label>
                <Input
                  id="favicon"
                  value={settings.favicon}
                  onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                  placeholder="https://exemplo.com/favicon.ico"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
