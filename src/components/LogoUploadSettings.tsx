
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Save, Image } from 'lucide-react';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const LogoUploadSettings = () => {
  const { config, updateConfig, loading } = useSystemConfig();
  const [logoUrl, setLogoUrl] = useState(config.site_logo?.url || '');
  const [logoAlt, setLogoAlt] = useState(config.site_logo?.alt || '');
  const [churchName, setChurchName] = useState(config.church_name?.text || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig({
        site_logo: {
          url: logoUrl,
          alt: logoAlt || 'Logo da Igreja'
        },
        church_name: {
          text: churchName
        }
      });

      toast({
        title: "Sucesso",
        description: "Configurações de logo salvas com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5 text-blue-600" />
          Configurações de Logo e Marca
        </CardTitle>
        <CardDescription>
          Configure o logo e nome da igreja que aparecerão no sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="churchName">Nome da Igreja</Label>
            <Input
              id="churchName"
              value={churchName}
              onChange={(e) => setChurchName(e.target.value)}
              placeholder="Nome da sua igreja"
            />
          </div>

          <div>
            <Label htmlFor="logoUrl">URL do Logo</Label>
            <Input
              id="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://exemplo.com/logo.png"
            />
          </div>

          <div>
            <Label htmlFor="logoAlt">Texto Alternativo do Logo</Label>
            <Input
              id="logoAlt"
              value={logoAlt}
              onChange={(e) => setLogoAlt(e.target.value)}
              placeholder="Logo da Igreja"
            />
          </div>

          {logoUrl && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <Label className="text-sm font-medium mb-2 block">Preview do Logo:</Label>
              <div className="flex items-center gap-3">
                <img 
                  src={logoUrl} 
                  alt={logoAlt}
                  className="w-12 h-12 object-contain rounded-lg bg-white border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div>
                  <p className="font-semibold">{churchName}</p>
                  <p className="text-sm text-gray-600">Sistema de Gestão</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving || loading}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  );
};
