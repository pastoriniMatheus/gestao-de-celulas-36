
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, ExternalLink } from 'lucide-react';

export const QRRedirect = () => {
  const { keyword } = useParams<{ keyword: string }>();
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trackAndRedirect = async () => {
      if (!keyword) {
        setError('QR code inválido');
        setLoading(false);
        return;
      }

      try {
        // Buscar dados do QR code
        const { data: qrCode, error: fetchError } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('keyword', keyword)
          .eq('active', true)
          .single();

        if (fetchError || !qrCode) {
          setError('QR code não encontrado ou inativo');
          setLoading(false);
          return;
        }

        setQrData(qrCode);

        // Registrar o scan via edge function
        try {
          const response = await fetch('/api/track-qr-scan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ keyword }),
          });

          if (!response.ok) {
            console.warn('Falha ao registrar scan, mas continuando...');
          }
        } catch (scanError) {
          console.warn('Erro ao registrar scan:', scanError);
          // Continua mesmo se o tracking falhar
        }

        // Aguardar um pouco para mostrar a página antes de redirecionar
        setTimeout(() => {
          // Redirecionar para a página principal da aplicação
          window.location.href = '/';
        }, 2000);

      } catch (error) {
        console.error('Erro ao processar QR code:', error);
        setError('Erro ao processar QR code');
      } finally {
        setLoading(false);
      }
    };

    trackAndRedirect();
  }, [keyword]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processando QR Code...
            </h2>
            <p className="text-gray-600 text-center">
              Aguarde enquanto validamos o código
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <QrCode className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              QR Code Inválido
            </h2>
            <p className="text-gray-600 text-center mb-4">
              {error}
            </p>
            <a 
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Ir para o site
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <QrCode className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {qrData?.title}
          </h2>
          <p className="text-gray-600 text-center mb-4">
            QR Code escaneado com sucesso! Redirecionando...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full animate-pulse w-full"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
