
import { CellsList } from './CellsList';
import { AddCellDialog } from './AddCellDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus } from 'lucide-react';

export const CellsManager = () => {
  console.log('CellsManager: Renderizando componente');

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="h-6 w-6 text-blue-600" />
                Gerenciamento de Células
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Gerencie todas as células da igreja, controle presenças e acompanhe estatísticas
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <AddCellDialog />
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <CellsList />
    </div>
  );
};
