
import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export const QRRedirect = () => {
  const { keyword } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    handleRedirect();
  }, []);

  const handleRedirect = async () => {
    try {
      console.log('QRRedirect: Processando redirecionamento...');
      console.log('QRRedirect: keyword =', keyword);
      console.log('QRRedirect: searchParams =', Object.fromEntries(searchParams.entries()));
      
      // Verificar se é um link de evento (com parâmetros evento e cod)
      const eventoId = searchParams.get('evento');
      const codigo = searchParams.get('cod');

      if (eventoId && codigo) {
        console.log('QRRedirect: É link de evento, redirecionando para FormPage');
        // Redirecionar para FormPage mantendo os parâmetros
        navigate(`/form?evento=${eventoId}&cod=${codigo}`, { replace: true });
        return;
      }

      // Se é QR code simples com keyword
      if (keyword) {
        console.log('QRRedirect: É QR code simples, verificando se existe');
        
        // Verificar se o QR code existe antes de redirecionar
        const { data: qrCodeData } = await supabase
          .from('qr_codes')
          .select('keyword')
          .eq('keyword', keyword.toLowerCase().trim())
          .eq('active', true)
          .maybeSingle();

        if (qrCodeData) {
          console.log('QRRedirect: QR code existe, redirecionando para FormPage');
          navigate(`/form/${keyword}`, { replace: true });
        } else {
          console.log('QRRedirect: QR code não encontrado, redirecionando para FormPage mesmo assim');
          navigate(`/form/${keyword}`, { replace: true });
        }
        return;
      }

      console.log('QRRedirect: Nenhum parâmetro válido, redirecionando para FormPage');
      navigate('/form', { replace: true });
    } catch (error) {
      console.error('QRRedirect: Erro no redirecionamento:', error);
      navigate('/form', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando...</p>
        </CardContent>
      </Card>
    </div>
  );
};
