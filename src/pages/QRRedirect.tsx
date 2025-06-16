
import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

export const QRRedirect = () => {
  const { keyword } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Capturar todos os parâmetros
    const evento = searchParams.get('evento');
    const cod = searchParams.get('cod');
    
    console.log('QRRedirect: Redirecionando com parâmetros:', { 
      keyword, 
      evento, 
      cod,
      allParams: Object.fromEntries(searchParams.entries()),
      currentOrigin: window.location.origin
    });

    // Construir URL de redirecionamento
    let redirectUrl = '/form';
    const params = new URLSearchParams();

    // Priorizar evento se existir
    if (evento) {
      params.set('evento', evento);
      console.log('QRRedirect: Adicionando parâmetro evento:', evento);
    }

    // Adicionar cod se existir, ou usar keyword
    if (cod) {
      params.set('cod', cod);
      console.log('QRRedirect: Adicionando parâmetro cod:', cod);
    } else if (keyword) {
      params.set('cod', keyword);
      console.log('QRRedirect: Usando keyword como cod:', keyword);
    }

    // Se há parâmetros, adicionar à URL
    if (params.toString()) {
      redirectUrl += `?${params.toString()}`;
    }

    console.log('QRRedirect: URL final de redirecionamento:', redirectUrl);
    
    // Pequeno delay para garantir que o console.log seja visível
    setTimeout(() => {
      navigate(redirectUrl, { replace: true });
    }, 100);
  }, [keyword, searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardContent className="p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Redirecionando...</h3>
          <p className="text-sm text-gray-500">Aguarde um momento</p>
        </CardContent>
      </Card>
    </div>
  );
};
