
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, AlertCircle, Home, MapPin, User, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useCities } from '@/hooks/useCities';
import { useNeighborhoods } from '@/hooks/useNeighborhoods';

const FormPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [qrInfo, setQrInfo] = useState<any>(null);
  const { settings } = useSystemSettings();
  const { cities } = useCities();
  const { neighborhoods } = useNeighborhoods(formData.city_id);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    address: '',
    neighborhood: '',
    city_id: '',
    birth_date: null as Date | null,
    encounter_with_god: false,
    baptized: false
  });

  // Verificar códigos de erro
  const errorCode = searchParams.get('error');
  const eventId = searchParams.get('evento');
  const cod = searchParams.get('cod');

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLoading(true);

        // Se tem evento, carregar dados do evento
        if (eventId && !errorCode) {
          const { data: event, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

          if (!error && event) {
            setEventInfo(event);
            console.log('FormPage: Evento carregado:', event);
          }
        }
        
        // Se tem código, carregar dados do QR code
        if (cod && !eventId && !errorCode) {
          const { data: qr, error } = await supabase
            .from('qr_codes')
            .select('*')
            .eq('keyword', cod)
            .single();

          if (!error && qr) {
            setQrInfo(qr);
            console.log('FormPage: QR code carregado:', qr);
          }
        }

      } catch (error) {
        console.error('FormPage: Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [eventId, cod, errorCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const contactData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        whatsapp: formData.whatsapp.trim() || null,
        address: formData.address.trim() || null,
        neighborhood: formData.neighborhood.trim(),
        city_id: formData.city_id || null,
        birth_date: formData.birth_date ? formData.birth_date.toISOString().split('T')[0] : null,
        encounter_with_god: formData.encounter_with_god,
        baptized: formData.baptized,
        status: 'pending',
        attendance_code: cod || null
      };

      const { error } = await supabase
        .from('contacts')
        .insert([contactData]);

      if (error) throw error;

      // Incrementar contador de scan se for evento
      if (eventId && eventInfo) {
        await supabase
          .from('events')
          .update({ scan_count: (eventInfo.scan_count || 0) + 1 })
          .eq('id', eventId);
      }

      // Incrementar contador de scan se for QR code
      if (qrInfo) {
        await supabase
          .from('qr_codes')
          .update({ scan_count: (qrInfo.scan_count || 0) + 1 })
          .eq('id', qrInfo.id);
      }

      toast({
        title: "Sucesso!",
        description: "Seu cadastro foi realizado com sucesso. Em breve entraremos em contato!"
      });

      // Limpar formulário
      setFormData({
        name: '',
        email: '',
        whatsapp: '',
        address: '',
        neighborhood: '',
        city_id: '',
        birth_date: null,
        encounter_with_god: false,
        baptized: false
      });

    } catch (error: any) {
      console.error('Erro ao enviar formulário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar formulário",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getErrorMessage = (code: string) => {
    const messages = {
      evento_nao_encontrado: 'Evento não encontrado ou inválido',
      evento_inativo: 'Este evento não está mais ativo',
      codigo_nao_encontrado: 'Código QR não encontrado ou inválido',
      codigo_inativo: 'Este código QR não está mais ativo',
      erro_interno: 'Ocorreu um erro interno. Tente novamente.'
    };
    return messages[code as keyof typeof messages] || 'Código inválido';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-2xl border-0 bg-white/80 backdrop-blur-lg">
          <CardContent className="p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Carregando...</h3>
            <p className="text-sm text-gray-500">Preparando formulário</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-2xl border-0 bg-white/90 backdrop-blur-lg">
        <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white rounded-t-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"></div>
          <div className="relative z-10">
            {settings.logo_url && (
              <div className="flex justify-center mb-4">
                <img 
                  src={settings.logo_url} 
                  alt="Logo" 
                  className="h-16 w-auto filter drop-shadow-lg"
                />
              </div>
            )}
            <CardTitle className="text-3xl font-bold mb-2">
              {eventInfo ? `${eventInfo.name}` : 
               qrInfo ? `${qrInfo.title}` : 
               settings.church_name || 'Cadastro de Visitante'}
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              {eventInfo ? `Evento: ${format(new Date(eventInfo.date), 'dd/MM/yyyy', { locale: ptBR })}` :
               qrInfo ? 'Preencha seus dados para entrarmos em contato' :
               'Seja bem-vindo! Preencha o formulário abaixo'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 p-8">
          {/* Mostrar erro se houver */}
          {errorCode && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {getErrorMessage(errorCode)}
              </AlertDescription>
              <div className="mt-3">
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/form">
                    <Home className="w-4 h-4 mr-2" />
                    Ir para Formulário
                  </Link>
                </Button>
              </div>
            </Alert>
          )}

          {/* Formulário - só mostrar se não houver erro */}
          {!errorCode && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dados Pessoais */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Dados Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Nome Completo *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome completo"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="seu@email.com"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-sm font-semibold text-gray-700">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      placeholder="(00) 00000-0000"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Data de Nascimento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-gray-300 hover:border-blue-400 h-12",
                            !formData.birth_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.birth_date ? (
                            format(formData.birth_date, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.birth_date || undefined}
                          onSelect={(date) => setFormData(prev => ({ ...prev, birth_date: date || null }))}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-semibold text-gray-700">Cidade</Label>
                    <Select value={formData.city_id} onValueChange={(value) => setFormData(prev => ({ ...prev, city_id: value, neighborhood: '' }))}>
                      <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500 h-12">
                        <SelectValue placeholder="Selecione sua cidade" />
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

                  <div className="space-y-2">
                    <Label htmlFor="neighborhood" className="text-sm font-semibold text-gray-700">Bairro</Label>
                    <Select 
                      value={formData.neighborhood} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, neighborhood: value }))}
                      disabled={!formData.city_id}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500 h-12">
                        <SelectValue placeholder={formData.city_id ? "Selecione seu bairro" : "Selecione primeiro a cidade"} />
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

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="text-sm font-semibold text-gray-700">Endereço Completo</Label>
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Rua, número, complemento"
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500 h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Informações Espirituais */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Espirituais</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="encounter"
                      checked={formData.encounter_with_god}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, encounter_with_god: !!checked }))
                      }
                    />
                    <Label
                      htmlFor="encounter"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Já participei de um Encontro com Deus
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="baptized"
                      checked={formData.baptized}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, baptized: !!checked }))
                      }
                    />
                    <Label
                      htmlFor="baptized"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Sou batizado
                    </Label>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-lg"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Enviando...
                  </div>
                ) : "Enviar Cadastro"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormPage;
