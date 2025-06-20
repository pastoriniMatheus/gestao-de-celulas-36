
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, MapPin, Clock, Trash2, Users, Eye } from 'lucide-react';
import { useCells } from '@/hooks/useCells';
import { EditCellDialog } from './EditCellDialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const CellsList = () => {
  const { cells, loading, deleteCell, fetchCells } = useCells();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log('CellsList: células carregadas:', cells.length, cells);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a célula "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteCell(id);
      toast({
        title: "Sucesso",
        description: "Célula excluída com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir célula:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir célula. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetails = (cellId: string) => {
    console.log('CellsList: Navegando para célula:', cellId);
    navigate(`/cells/${cellId}`);
  };

  const handleEditCell = (cell: any) => {
    setEditingCell(cell);
    setEditDialogOpen(true);
  };

  const handleCellUpdated = () => {
    fetchCells();
    setEditDialogOpen(false);
    setEditingCell(null);
  };

  const getWeekDayName = (day: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[day] || 'N/A';
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return time;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-2 text-gray-600">Carregando células...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (cells.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Células</CardTitle>
          <CardDescription>
            Gerencie todas as células da igreja
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma célula encontrada</h3>
          <p className="text-gray-600 mb-4">Comece criando sua primeira célula.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Células ({cells.length})</CardTitle>
        <CardDescription>
          Gerencie todas as células da igreja
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cells.map((cell) => (
            <Card key={cell.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Home className="h-4 w-4 text-blue-600" />
                      {cell.name}
                    </CardTitle>
                    <Badge variant={cell.active ? "default" : "secondary"} className="mt-1">
                      {cell.active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(cell.id)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCell(cell)}
                      title="Editar célula"
                    >
                      <Users className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cell.id, cell.name)}
                      disabled={deletingId === cell.id}
                      title="Excluir célula"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{cell.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {getWeekDayName(cell.meeting_day)} às {formatTime(cell.meeting_time)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Clique no ícone de olho para ver membros</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dialog de edição */}
        {editingCell && (
          <EditCellDialog
            cell={editingCell}
            isOpen={editDialogOpen}
            onClose={() => {
              setEditDialogOpen(false);
              setEditingCell(null);
            }}
            onCellUpdated={handleCellUpdated}
          />
        )}
      </CardContent>
    </Card>
  );
};
