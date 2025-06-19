
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
import { CalendarIcon, AlertCircle, Home } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

const FormPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [qrInfo, setQrInfo] = useState<any>(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    neighborhood: '',
    birth_date: null as Date | null,
    encounter_with_god: false
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
        whatsapp: formData.whatsapp.trim() || null,
        neighborhood: formData.neighborhood.trim(),
        birth_date: formData.birth_date ? formData.birth_date.toISOString().split('T')[0] : null,
        encounter_with_god: formData.encounter_with_god,
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
        whatsapp: '',
        neighborhood: '',
        birth_date: null,
        encounter_with_god: false
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {eventInfo ? `Cadastro - ${eventInfo.name}` : 
             qrInfo ? `Cadastro - ${qrInfo.title}` : 
             'Cadastro de Visitante'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {eventInfo ? `Evento: ${format(new Date(eventInfo.date), 'dd/MM/yyyy', { locale: ptBR })}` :
             qrInfo ? 'Preencha seus dados para entrarmos em contato' :
             'Preencha o formulário abaixo'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                    placeholder="Seu bairro"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="encounter"
                  checked={formData.encounter_with_god}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, encounter_with_god: !!checked }))
                  }
                />
                <Label
                  htmlFor="encounter"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Já participei de um Encontro com Deus
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={submitting}
              >
                {submitting ? "Enviando..." : "Enviar Cadastro"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormPage;
