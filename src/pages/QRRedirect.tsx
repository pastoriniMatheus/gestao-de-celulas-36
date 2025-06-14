
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const QRRedirect = () => {
  const { keyword } = useParams();
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        .maybeSingle(); // Usar maybeSingle ao invés de single

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
        setLoading(false);
        return;
      }

      // Se não encontrou evento, buscar na tabela de QR codes
      const { data: qrCodeData, error: qrError } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('keyword', keyword)
        .eq('active', true)
        .maybeSingle(); // Usar maybeSingle ao invés de single

      if (qrCodeData && !qrError) {
        console.log('QR code encontrado:', qrCodeData);
        
        // Incrementar contador manualmente se a função falhar
        try {
          const { error: incrementError } = await supabase.rpc(
            'increment_qr_scan_count',
            {
              qr_id: qrCodeData.id,
              user_ip: null,
              user_agent_string: navigator.userAgent
            }
          );

          if (incrementError) {
            console.error('Erro ao usar função RPC, incrementando manualmente:', incrementError);
            // Fallback: incrementar manualmente
            await supabase
              .from('qr_codes')
              .update({ scan_count: qrCodeData.scan_count + 1 })
              .eq('id', qrCodeData.id);
          }
        } catch (rpcError) {
          console.error('Erro na função RPC:', rpcError);
          // Fallback: incrementar manualmente
          await supabase
            .from('qr_codes')
            .update({ scan_count: qrCodeData.scan_count + 1 })
            .eq('id', qrCodeData.id);
        }

        setQrData({
          type: 'qrcode',
          title: qrCodeData.title,
          description: 'QR Code escaneado com sucesso!',
          data: qrCodeData
        });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-xl text-green-600">
            {qrData?.title || 'QR Code Escaneado!'}
          </CardTitle>
          <CardDescription>
            {qrData?.description || 'QR code processado com sucesso'}
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

          {qrData?.type === 'event' && (
            <div className="text-left space-y-2">
              <p><strong>Data:</strong> {new Date(qrData.data.date).toLocaleDateString('pt-BR')}</p>
              <p><strong>Status:</strong> {qrData.data.active ? 'Ativo' : 'Inativo'}</p>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Obrigado por escanear este QR code!
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
