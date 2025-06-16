import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, CheckCircle, AlertCircle, ExternalLink, User, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SystemSettings {
  site_logo: { url: string; alt: string };
  form_title: { text: string };
  form_description: { text: string };
}

interface Neighborhood {
  id: string;
  name: string;
  city_id: string;
}

export const FormPage = () => {
  const [searchParams] = useSearchParams();
  const { keyword } = useParams();
  
  // Buscar parâmetros tanto da URL quanto dos searchParams
  const evento = searchParams.get('evento');
  const cod = searchParams.get('cod') || keyword;
  
  const [itemData, setItemData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    neighborhood: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    site_logo: { url: '', alt: 'Logo da Igreja' },
    form_title: { text: 'Formulário de Contato' },
    form_description: { text: 'Preencha seus dados para nos conectarmos com você' }
  });
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    console.log('FormPage: Carregado com parâmetros:', { 
      evento, 
      cod, 
      keyword, 
      allSearchParams: Object.fromEntries(searchParams.entries()),
      currentURL: window.location.href
    });
    
    loadSystemSettings();
    loadNeighborhoods();
    
    if (evento || cod) {
      handleItemScan();
    } else {
      console.log('FormPage: Nenhum parâmetro válido encontrado');
      setError('Parâmetros não encontrados na URL');
      setLoading(false);
    }
  }, [evento, cod, keyword]);

  const loadSystemSettings = async () => {
    try {
      console.log('FormPage: Carregando configurações do sistema...');
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['site_logo', 'form_title', 'form_description']);

      if (error) {
        console.error('FormPage: Erro ao carregar configurações:', error);
        return;
      }

      console.log('FormPage: Configurações carregadas:', data);
      
      if (data && data.length > 0) {
        const settings: any = {};
        data.forEach(item => {
          settings[item.key] = item.value;
        });
        setSystemSettings(prev => ({ ...prev, ...settings }));
      }
    } catch (error) {
      console.error('FormPage: Erro crítico ao carregar configurações:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const loadNeighborhoods = async () => {
    try {
      console.log('FormPage: Carregando bairros...');
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('id, name, city_id')
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('FormPage: Erro ao carregar bairros:', error);
        return;
      }

      console.log('FormPage: Bairros carregados:', data);
      setNeighborhoods(data || []);
    } catch (error) {
      console.error('FormPage: Erro crítico ao carregar bairros:', error);
    }
  };

  const handleItemScan = async () => {
    try {
      console.log('FormPage: Processando scan com parâmetros:', { evento, cod });
      setLoading(true);
      setError(null);

      // Se tem ID do evento, buscar diretamente
      if (evento) {
        console.log('FormPage: Buscando evento por ID:', evento);
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', evento)
          .eq('active', true)
          .maybeSingle();

        console.log('FormPage: Resultado busca evento por ID:', { eventData, eventError });

        if (eventData && !eventError) {
          console.log('FormPage: Evento encontrado por ID:', eventData);
          
          // Incrementar contador de scan do evento
          await supabase
            .from('events')
            .update({ scan_count: (eventData.scan_count || 0) + 1 })
            .eq('id', eventData.id);

          setItemData({
            type: 'event',
            title: eventData.name,
            description: `Evento: ${eventData.name}`,
            data: eventData
          });
          setShowForm(true);
          setLoading(false);
          return;
        }
      }

      // Se não encontrou por ID, ou se só tem código, tentar por keyword
      if (cod) {
        const normalizedCod = cod.toLowerCase().trim();
        console.log('FormPage: Buscando por código normalizado:', normalizedCod);
        
        // Buscar evento por keyword
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('keyword', normalizedCod)
          .eq('active', true)
          .maybeSingle();

        console.log('FormPage: Resultado busca evento por código:', { eventData, eventError });

        if (eventData && !eventError) {
          console.log('FormPage: Evento encontrado por código:', eventData);
          
          // Incrementar contador de scan do evento
          await supabase
            .from('events')
            .update({ scan_count: (eventData.scan_count || 0) + 1 })
            .eq('id', eventData.id);

          setItemData({
            type: 'event',
            title: eventData.name,
            description: `Evento: ${eventData.name}`,
            data: eventData
          });
          setShowForm(true);
          setLoading(false);
          return;
        }

        // Se não encontrou evento, buscar na tabela de QR codes
        const { data: qrCodeData, error: qrError } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('keyword', normalizedCod)
          .eq('active', true)
          .maybeSingle();

        console.log('FormPage: Resultado busca QR code:', { qrCodeData, qrError });

        if (qrCodeData && !qrError) {
          console.log('FormPage: QR code encontrado:', qrCodeData);
          
          // Incrementar contador de scan
          await supabase
            .from('qr_codes')
            .update({ scan_count: (qrCodeData.scan_count || 0) + 1 })
            .eq('id', qrCodeData.id);

          setItemData({
            type: 'qrcode',
            title: qrCodeData.title,
            description: 'QR Code escaneado com sucesso!',
            data: qrCodeData
          });
          setShowForm(true);
          setLoading(false);
          return;
        }
      }

      console.log('FormPage: Nenhum evento ou QR code encontrado para os parâmetros:', { evento, cod });
      setError('Código não encontrado ou inativo');
    } catch (error) {
      console.error('FormPage: Erro crítico ao processar código:', error);
      setError('Erro ao processar código');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.whatsapp.trim() || !formData.neighborhood.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      console.log('FormPage: Enviando dados do contato:', formData);
      
      const { data, error } = await supabase
        .from('contacts')
        .insert([{
          name: formData.name.trim(),
          whatsapp: formData.whatsapp.trim(),
          neighborhood: formData.neighborhood.trim(),
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('FormPage: Erro ao criar contato:', error);
        toast({
          title: "Erro",
          description: "Erro ao enviar dados. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      console.log('FormPage: Contato criado com sucesso:', data);
      toast({
        title: "Sucesso",
        description: "Seus dados foram enviados com sucesso!",
      });

      // Limpar formulário e mostrar mensagem de sucesso
      setFormData({ name: '', whatsapp: '', neighborhood: '' });
      setShowForm(false);
    } catch (error) {
      console.error('FormPage: Erro crítico ao enviar contato:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando formulário...</p>
            <div className="mt-4 text-xs text-gray-500">
              <p>Parâmetros: evento={evento}, cod={cod}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-600">Código Não Encontrado</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-500">
              <p>Parâmetros recebidos:</p>
              <div className="bg-gray-100 p-2 rounded text-left">
                <p>• evento: {evento || 'não fornecido'}</p>
                <p>• cod: {cod || 'não fornecido'}</p>
                <p>• keyword: {keyword || 'não fornecido'}</p>
              </div>
              <p className="mt-4">
                Verifique se o código é válido ou entre em contato com o organizador.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {systemSettings.site_logo.url && (
              <div className="mx-auto mb-4">
                <img 
                  src={systemSettings.site_logo.url} 
                  alt={systemSettings.site_logo.alt}
                  className="h-16 w-auto mx-auto"
                />
              </div>
            )}
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl text-blue-600">
              {systemSettings.form_title.text}
            </CardTitle>
            <CardDescription>
              {systemSettings.form_description.text}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitContact} className="space-y-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div>
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  WhatsApp *
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div>
                <Label htmlFor="neighborhood" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Bairro *
                </Label>
                <Select 
                  value={formData.neighborhood} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, neighborhood: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu bairro" />
                  </SelectTrigger>
                  <SelectContent>
                    {neighborhoods.map((neighborhood) => (
                      <SelectItem key={neighborhood.id} value={neighborhood.name}>
                        {neighborhood.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar Dados'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Seus dados serão utilizados apenas para contato da igreja.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          {systemSettings.site_logo.url && (
            <div className="mx-auto mb-4">
              <img 
                src={systemSettings.site_logo.url} 
                alt={systemSettings.site_logo.alt}
                className="h-16 w-auto mx-auto"
              />
            </div>
          )}
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-xl text-green-600">
            Dados Enviados com Sucesso!
          </CardTitle>
          <CardDescription>
            Obrigado por compartilhar seus dados conosco
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <QrCode className="w-4 h-4" />
              <span>
                {itemData?.type === 'event' ? 'Evento:' : 'Código:'} {evento || cod}
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Entraremos em contato em breve!
            </p>
          </div>

          <Button
            className="w-full"
            onClick={() => window.close()}
          >
            <ExternalLink className="w-4 w-4 mr-2" />
            Fechar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
