import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';
import { AddCellDialog } from './AddCellDialog';
import { CellsList } from './CellsList';
import { useCells } from '@/hooks/useCells';
import { Button } from '@/components/ui/button';

export const CellsManager = () => {
  const { cells, loading, fetchCells } = useCells();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const activeCells = cells.filter(cell => cell.active).length;
  const totalCells = cells.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                Gerenciamento de Células
              </CardTitle>
              <CardDescription>
                Organize e gerencie as células da igreja
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <Home className="mr-2 h-4 w-4" />
              Adicionar Célula
            </Button>
            <AddCellDialog
              isOpen={isAddDialogOpen}
              onClose={() => setIsAddDialogOpen(false)}
              onCellAdded={fetchCells}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total de Células</h3>
              <p className="text-2xl font-bold text-blue-600">
                {loading ? '...' : totalCells}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Células Ativas</h3>
              <p className="text-2xl font-bold text-green-600">
                {loading ? '...' : activeCells}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800">Taxa de Atividade</h3>
              <p className="text-2xl font-bold text-orange-600">
                {loading ? '...' : totalCells > 0 ? `${Math.round((activeCells / totalCells) * 100)}%` : '0%'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <CellsList />
    </div>
  );
};
