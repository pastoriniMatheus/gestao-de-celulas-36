
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export const EventsManager = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Gerenciamento de Eventos
          </CardTitle>
          <CardDescription>
            Organize eventos, encontros e atividades das células
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Módulo de eventos em desenvolvimento...</p>
            <p className="text-sm text-gray-400 mt-2">
              Em breve você poderá criar, gerenciar e acompanhar eventos das células.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
