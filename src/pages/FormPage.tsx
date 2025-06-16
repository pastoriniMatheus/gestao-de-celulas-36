
import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, CheckCircle, AlertCircle, ExternalLink, User, Phone, MapPin, Calendar, Clock } from 'lucide-react';
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

interface EventData {
  id: string;
  name: string;
  date: string;
  keyword: string;
  active: boolean;
  scan_count: number;
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
  const [showSuccess, setShowSuccess] = useState(false);
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
    console.log('FormPage: Iniciando com parâmetros:', { 
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

      let eventData: EventData | null = null;

      // Primeira tentativa: buscar por ID do evento
      if (evento) {
        console.log('FormPage: Buscando evento por ID:', evento);
        const { data, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', evento)
          .maybeSingle();

        console.log('FormPage: Resultado busca por ID:', { data, eventError });

        if (data && !eventError) {
          eventData = data;
          console.log('FormPage: Evento encontrado por ID:', eventData);
        }
      }

      // Segunda tentativa: buscar por keyword/código
      if (!eventData && cod) {
        const normalizedCod = cod.toLowerCase().trim();
        console.log('FormPage: Buscando evento por keyword:', normalizedCod);
        
        const { data, error: keywordError } = await supabase
          .from('events')
          .select('*')
          .eq('keyword', normalizedCod)
          .maybeSingle();

        console.log('FormPage: Resultado busca por keyword:', { data, keywordError });

        if (data && !keywordError) {
          eventData = data;
          console.log('FormPage: Evento encontrado por keyword:', eventData);
        }
      }

      // Verificar se encontrou evento e se está ativo
      if (eventData) {
        if (!eventData.active) {
          console.log('FormPage: Evento encontrado mas está inativo:', eventData);
          setError('Este evento não está mais ativo');
          setLoading(false);
          return;
        }

        console.log('FormPage: Evento válido encontrado, incrementando contador...');
        
        // Incrementar contador de scan do evento
        const { error: updateError } = await supabase
          .from('events')
          .update({ scan_count: (eventData.scan_count || 0) + 1 })
          .eq('id', eventData.id);

        if (updateError) {
          console.error('FormPage: Erro ao incrementar contador:', updateError);
        }

        setItemData({
          type: 'event',
          title: eventData.name,
          description: `Evento: ${eventData.name}`,
          date: eventData.date,
          data: eventData
        });
        setShowForm(true);
        setLoading(false);
        return;
      }

      // Se chegou até aqui, não encontrou nada
      console.log('FormPage: Nenhum evento encontrado para os parâmetros:', { evento, cod });
      setError('Evento não encontrado ou inativo');
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

      // Mostrar tela de sucesso
      setShowForm(false);
      setShowSuccess(true);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading || loadingSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg border-0">
          <CardContent className="p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Carregando formulário...</h3>
            <p className="text-sm text-gray-500">Aguarde um momento</p>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
              <p className="font-medium mb-1">Parâmetros de Debug:</p>
              <p>evento: {evento || 'não fornecido'}</p>
              <p>cod: {cod || 'não fornecido'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-700 mb-2">Código Não Encontrado</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 mb-3">Parâmetros recebidos:</p>
              <div className="space-y-1 text-sm text-red-700">
                <p>• evento: {evento || 'não fornecido'}</p>
                <p>• cod: {cod || 'não fornecido'}</p>
                <p>• keyword: {keyword || 'não fornecido'}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Verifique se o código é válido ou entre em contato com o organizador.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg border-0">
          <CardHeader className="pb-4">
            {systemSettings.site_logo.url && (
              <div className="mx-auto mb-6">
                <img 
                  src={systemSettings.site_logo.url} 
                  alt={systemSettings.site_logo.alt}
                  className="h-20 w-auto mx-auto"
                />
              </div>
            )}
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl text-green-700 mb-2">
              Dados Enviados com Sucesso!
            </CardTitle>
            <CardDescription className="text-green-600">
              Obrigado por compartilhar seus dados conosco
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {itemData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-3 text-sm text-green-700">
                  <Calendar className="w-4 h-4" />
                  <div className="text-center">
                    <p className="font-medium">{itemData.title}</p>
                    {itemData.date && (
                      <p className="text-xs text-green-600">{formatDate(itemData.date)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 font-medium">
                Entraremos em contato em breve!
              </p>
              <p className="text-xs text-gray-500">
                Seus dados foram registrados com segurança
              </p>
            </div>

            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => window.close()}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Fechar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            {systemSettings.site_logo.url && (
              <div className="mx-auto mb-6">
                <img 
                  src={systemSettings.site_logo.url} 
                  alt={systemSettings.site_logo.alt}
                  className="h-20 w-auto mx-auto"
                />
              </div>
            )}
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <QrCode className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl text-blue-700 mb-2">
              {systemSettings.form_title.text}
            </CardTitle>
            <CardDescription className="text-blue-600">
              {systemSettings.form_description.text}
            </CardDescription>
            
            {itemData && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-3 text-sm text-blue-700">
                  <Calendar className="w-4 h-4" />
                  <div className="text-center">
                    <p className="font-medium">{itemData.title}</p>
                    {itemData.date && (
                      <p className="text-xs text-blue-600">{formatDate(itemData.date)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitContact} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                  <User className="w-4 h-4 text-blue-600" />
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome completo"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2 text-sm font-medium">
                  <Phone className="w-4 h-4 text-blue-600" />
                  WhatsApp *
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood" className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Bairro *
                </Label>
                <Select 
                  value={formData.neighborhood} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, neighborhood: value }))}
                  required
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Dados'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                🔒 Seus dados serão utilizados apenas para contato da igreja e estão protegidos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};
