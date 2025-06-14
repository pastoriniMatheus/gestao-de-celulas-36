
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, CheckCircle, AlertCircle, ExternalLink, User, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const QRRedirect = () => {
  const { keyword } = useParams();
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    neighborhood: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (keyword) {
      handleQRCodeScan(keyword);
    }
  }, [keyword]);

  const handleQRCodeScan = async (keyword: string) => {
    try {
      console.log('Processando scan do QR code:', keyword);

      // Primeiro, buscar na tabela de eventos
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('keyword', keyword)
        .eq('active', true)
        .maybeSingle();

      if (eventData && !eventError) {
        console.log('Evento encontrado:', eventData);
        
        // Incrementar contador de scan do evento
        const { error: updateError } = await supabase
          .from('events')
          .update({ scan_count: eventData.scan_count + 1 })
          .eq('id', eventData.id);

        if (updateError) {
          console.error('Erro ao incrementar contador do evento:', updateError);
        }

        setQrData({
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
        .eq('keyword', keyword)
        .eq('active', true)
        .maybeSingle();

      if (qrCodeData && !qrError) {
        console.log('QR code encontrado:', qrCodeData);
        
        // Incrementar contador de scan
        const { error: updateError } = await supabase
          .from('qr_codes')
          .update({ scan_count: qrCodeData.scan_count + 1 })
          .eq('id', qrCodeData.id);

        if (updateError) {
          console.error('Erro ao incrementar contador:', updateError);
        }

        setQrData({
          type: 'qrcode',
          title: qrCodeData.title,
          description: 'QR Code escaneado com sucesso!',
          data: qrCodeData
        });
        setShowForm(true);
      } else {
        console.log('Nenhum QR code ou evento encontrado para:', keyword);
        setError('QR code não encontrado ou inativo');
      }
    } catch (error) {
      console.error('Erro ao processar QR code:', error);
      setError('Erro ao processar QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.whatsapp || !formData.neighborhood) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([{
          name: formData.name,
          whatsapp: formData.whatsapp,
          neighborhood: formData.neighborhood,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar contato:', error);
        toast({
          title: "Erro",
          description: "Erro ao enviar dados. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      console.log('Contato criado:', data);
      toast({
        title: "Sucesso",
        description: "Seus dados foram enviados com sucesso!",
      });

      // Limpar formulário e mostrar mensagem de sucesso
      setFormData({ name: '', whatsapp: '', neighborhood: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao enviar contato:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processando QR code...</p>
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
            <CardTitle className="text-xl text-red-600">QR Code Inválido</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Verifique se o QR code é válido ou entre em contato com o organizador.
            </p>
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
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl text-blue-600">
              {qrData?.title || 'Formulário de Contato'}
            </CardTitle>
            <CardDescription>
              Preencha seus dados para nos conectarmos com você
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
                <Input
                  id="neighborhood"
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                  placeholder="Seu bairro"
                  required
                />
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
                {qrData?.type === 'event' ? 'Evento:' : 'QR Code:'} {keyword}
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
