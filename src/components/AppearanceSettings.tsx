
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Upload, Save, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AppearanceConfig {
  site_logo: { url: string; alt: string };
  favicon: { url: string };
  church_name: { text: string };
  primary_color: { color: string };
  secondary_color: { color: string };
  accent_color: { color: string };
  background_color: { color: string };
}

export const AppearanceSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AppearanceConfig>({
    site_logo: { url: '', alt: 'Logo da Igreja' },
    favicon: { url: '' },
    church_name: { text: '' },
    primary_color: { color: '#3b82f6' },
    secondary_color: { color: '#6b7280' },
    accent_color: { color: '#10b981' },
    background_color: { color: '#f8fafc' }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['site_logo', 'favicon', 'church_name', 'primary_color', 'secondary_color', 'accent_color', 'background_color']);

      if (error) {
        console.error('Erro ao carregar configurações de aparência:', error);
        return;
      }

      if (data && data.length > 0) {
        const settings: any = {};
        data.forEach(item => {
          settings[item.key] = item.value;
        });
        setConfig(prev => ({ ...prev, ...settings }));
      }
    } catch (error) {
      console.error('Erro crítico ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const updates = [
        { key: 'site_logo', value: config.site_logo },
        { key: 'favicon', value: config.favicon },
        { key: 'church_name', value: config.church_name },
        { key: 'primary_color', value: config.primary_color },
        { key: 'secondary_color', value: config.secondary_color },
        { key: 'accent_color', value: config.accent_color },
        { key: 'background_color', value: config.background_color }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({ 
            key: update.key, 
            value: update.value 
          }, { 
            onConflict: 'key' 
          });

        if (error) {
          console.error(`Erro ao salvar ${update.key}:`, error);
          throw error;
        }
      }

      toast({
        title: "Sucesso",
        description: "Configurações de aparência salvas com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-blue-600" />
          Aparência do Sistema
        </CardTitle>
        <CardDescription>
          Configure o visual e identidade da sua igreja
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nome da Igreja */}
        <div className="space-y-2">
          <Label htmlFor="church-name">Nome da Igreja</Label>
          <Input
            id="church-name"
            value={config.church_name.text}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              church_name: { text: e.target.value }
            }))}
            placeholder="Nome da sua igreja"
          />
        </div>

        {/* Logo da Igreja */}
        <div className="space-y-2">
          <Label htmlFor="logo-url">Logo da Igreja</Label>
          <Input
            id="logo-url"
            type="url"
            value={config.site_logo.url}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              site_logo: { ...prev.site_logo, url: e.target.value }
            }))}
            placeholder="https://exemplo.com/logo.png"
          />
          <p className="text-sm text-gray-500">
            URL da imagem do logo que aparecerá no sistema
          </p>
          {config.site_logo.url && (
            <div className="mt-2">
              <img 
                src={config.site_logo.url} 
                alt="Preview do logo"
                className="h-16 w-auto border rounded"
              />
            </div>
          )}
        </div>

        {/* Favicon */}
        <div className="space-y-2">
          <Label htmlFor="favicon-url">Favicon</Label>
          <Input
            id="favicon-url"
            type="url"
            value={config.favicon.url}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              favicon: { url: e.target.value }
            }))}
            placeholder="https://exemplo.com/favicon.png"
          />
          <p className="text-sm text-gray-500">
            URL do ícone que aparecerá na aba do navegador
          </p>
        </div>

        {/* Cores do Sistema */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary-color">Cor Primária</Label>
            <div className="flex gap-2">
              <Input
                id="primary-color"
                type="color"
                value={config.primary_color.color}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  primary_color: { color: e.target.value }
                }))}
                className="w-16 h-10"
              />
              <Input
                value={config.primary_color.color}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  primary_color: { color: e.target.value }
                }))}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary-color">Cor Secundária</Label>
            <div className="flex gap-2">
              <Input
                id="secondary-color"
                type="color"
                value={config.secondary_color.color}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  secondary_color: { color: e.target.value }
                }))}
                className="w-16 h-10"
              />
              <Input
                value={config.secondary_color.color}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  secondary_color: { color: e.target.value }
                }))}
                placeholder="#6b7280"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accent-color">Cor de Destaque</Label>
            <div className="flex gap-2">
              <Input
                id="accent-color"
                type="color"
                value={config.accent_color.color}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  accent_color: { color: e.target.value }
                }))}
                className="w-16 h-10"
              />
              <Input
                value={config.accent_color.color}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  accent_color: { color: e.target.value }
                }))}
                placeholder="#10b981"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="background-color">Cor de Fundo</Label>
            <div className="flex gap-2">
              <Input
                id="background-color"
                type="color"
                value={config.background_color.color}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  background_color: { color: e.target.value }
                }))}
                className="w-16 h-10"
              />
              <Input
                value={config.background_color.color}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  background_color: { color: e.target.value }
                }))}
                placeholder="#f8fafc"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Configurações de Aparência'}
        </Button>
      </CardContent>
    </Card>
  );
};
