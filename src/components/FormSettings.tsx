
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Upload, Image } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const FormSettings = () => {
  const [loading, setLoading] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadFormSettings();
  }, []);

  const loadFormSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_configs')
        .select('*')
        .in('config_key', ['form_title', 'form_description', 'form_image_url', 'welcome_message', 'success_message']);

      if (error) throw error;

      data?.forEach((config) => {
        switch (config.config_key) {
          case 'form_title':
            setFormTitle(config.config_value?.text || '');
            break;
          case 'form_description':
            setFormDescription(config.config_value?.text || '');
            break;
          case 'form_image_url':
            setFormImageUrl(config.config_value?.url || '');
            break;
          case 'welcome_message':
            setWelcomeMessage(config.config_value?.text || '');
            break;
          case 'success_message':
            setSuccessMessage(config.config_value?.text || '');
            break;
        }
      });
    } catch (error) {
      console.error('Erro ao carregar configurações do formulário:', error);
    }
  };

  const saveFormSettings = async () => {
    try {
      setLoading(true);

      const configs = [
        { key: 'form_title', value: { text: formTitle } },
        { key: 'form_description', value: { text: formDescription } },
        { key: 'form_image_url', value: { url: formImageUrl } },
        { key: 'welcome_message', value: { text: welcomeMessage } },
        { key: 'success_message', value: { text: successMessage } }
      ];

      for (const config of configs) {
        const { error } = await supabase
          .from('system_configs')
          .upsert({
            config_key: config.key,
            config_value: config.value,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Configurações do formulário salvas!"
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações do formulário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Configurações do Formulário
        </CardTitle>
        <CardDescription>
          Configure as informações exibidas no formulário de cadastro
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="form_title">Título do Formulário</Label>
              <Input
                id="form_title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ex: Cadastro de Visitantes"
              />
            </div>

            <div>
              <Label htmlFor="form_description">Descrição</Label>
              <Textarea
                id="form_description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descrição que aparece no formulário"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="form_image_url" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                URL da Imagem do Formulário
              </Label>
              <Input
                id="form_image_url"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Imagem que aparece no cabeçalho do formulário (diferente da logo do sistema)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="welcome_message">Mensagem de Boas-vindas</Label>
              <Textarea
                id="welcome_message"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="Mensagem exibida no início do formulário"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="success_message">Mensagem de Sucesso</Label>
              <Textarea
                id="success_message"
                value={successMessage}
                onChange={(e) => setSuccessMessage(e.target.value)}
                placeholder="Mensagem exibida após completar o formulário"
                rows={3}
              />
            </div>

            {formImageUrl && (
              <div>
                <Label>Preview da Imagem</Label>
                <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                  <img 
                    src={formImageUrl} 
                    alt="Preview da imagem do formulário"
                    className="max-w-full h-32 object-contain mx-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Button 
          onClick={saveFormSettings} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </CardContent>
    </Card>
  );
};
