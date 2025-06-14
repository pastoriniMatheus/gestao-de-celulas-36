
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch } from 'lucide-react';

export const Pipeline = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-blue-600" />
            Pipeline de Conversão
          </CardTitle>
          <CardDescription>
            Acompanhe o progresso dos visitantes e membros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Módulo de pipeline em desenvolvimento...</p>
            <p className="text-sm text-gray-400 mt-2">
              Em breve você poderá acompanhar o pipeline de conversão e discipulado.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
