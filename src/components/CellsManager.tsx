
import { CellsList } from './CellsList';
import { AddCellDialog } from './AddCellDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useLeaderPermissions } from '@/hooks/useLeaderPermissions';

export const CellsManager = () => {
  const { canManageAllCells, isLeader, isAdmin } = useLeaderPermissions();

  console.log('CellsManager: Renderizando componente');
  console.log('CellsManager: canManageAllCells:', canManageAllCells);
  console.log('CellsManager: isLeader:', isLeader);
  console.log('CellsManager: isAdmin:', isAdmin);

  // Mostrar sempre o componente, mas com conteúdo diferente baseado nas permissões
  const title = canManageAllCells ? 'Gerenciamento de Células' : (isLeader ? 'Minhas Células' : 'Células');
  const description = canManageAllCells 
    ? 'Gerencie todas as células da igreja, controle presenças e acompanhe estatísticas'
    : (isLeader 
      ? 'Gerencie suas células, controle presenças e acompanhe estatísticas'
      : 'Visualize as células da igreja'
    );

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="h-6 w-6 text-blue-600" />
                {title}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {canManageAllCells && <AddCellDialog />}
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <CellsList />
    </div>
  );
};
