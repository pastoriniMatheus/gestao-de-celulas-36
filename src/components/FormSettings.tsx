
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Save } from 'lucide-react';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { toast } from '@/hooks/use-toast';

export const FormSettings = () => {
  const { config, updateConfig, loading } = useSystemConfig();
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [churchName, setChurchName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setFormTitle(config.form_title?.text || '');
      setFormDescription(config.form_description?.text || '');
      setChurchName(config.church_name?.text || '');
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig({
        form_title: { text: formTitle },
        form_description: { text: formDescription },
        church_name: { text: churchName }
      });

      toast({
        title: "Sucesso",
        description: "Configurações do formulário salvas com sucesso!"
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
          <FileText className="h-5 w-5 text-blue-600" />
          Configurações do Formulário
        </CardTitle>
        <CardDescription>
          Configure os textos e informações que aparecem no formulário de contato
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
            <p className="text-sm text-gray-500 mt-1">
              Nome que aparecerá no cabeçalho do sistema
            </p>
          </div>

          <div>
            <Label htmlFor="formTitle">Título do Formulário</Label>
            <Input
              id="formTitle"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Formulário de Contato"
            />
            <p className="text-sm text-gray-500 mt-1">
              Título principal que aparece no formulário
            </p>
          </div>

          <div>
            <Label htmlFor="formDescription">Descrição do Formulário</Label>
            <Textarea
              id="formDescription"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Preencha seus dados para nos conectarmos com você"
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-1">
              Texto explicativo que aparece abaixo do título
            </p>
          </div>
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
