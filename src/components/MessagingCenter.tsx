
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

export const MessagingCenter = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Central de Mensagens
          </CardTitle>
          <CardDescription>
            Envie mensagens e comunicados para as células
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Módulo de mensagens em desenvolvimento...</p>
            <p className="text-sm text-gray-400 mt-2">
              Em breve você poderá enviar mensagens via WhatsApp e outros canais.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
