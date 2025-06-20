
import { CellsList } from './CellsList';
import { CellsDebug } from './CellsDebug';
import { AddCellDialog } from './AddCellDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export const CellsManager = () => {
  console.log('CellsManager: Renderizando componente');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Gerenciamento de Células
              </CardTitle>
              <CardDescription>
                Gerencie todas as células da igreja
              </CardDescription>
            </div>
            <AddCellDialog />
          </div>
        </CardHeader>
      </Card>
      
      <CellsDebug />
      <CellsList />
    </div>
  );
};
