
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';

export const CellsManager = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-blue-600" />
            Gerenciamento de Células
          </CardTitle>
          <CardDescription>
            Organize e gerencie as células da igreja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Módulo de células em desenvolvimento...</p>
            <p className="text-sm text-gray-400 mt-2">
              Em breve você poderá cadastrar e gerenciar todas as células.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
