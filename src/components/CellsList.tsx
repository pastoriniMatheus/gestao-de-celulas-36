
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { useCells } from '@/hooks/useCells';
import { useToast } from '@/hooks/use-toast';

const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const CellsList = () => {
  const { cells, loading, deleteCell } = useCells();
  const { toast } = useToast();

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a célula "${name}"?`)) {
      try {
        await deleteCell(id);
        toast({
          title: "Sucesso",
          description: "Célula excluída com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir célula.",
          variant: "destructive",
        });
      }
    }
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Remove seconds from HH:MM:SS
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando células...</span>
      </div>
    );
  }

  if (cells.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma célula cadastrada ainda.</p>
          <p className="text-sm text-gray-400 mt-2">
            Comece criando sua primeira célula!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cells.map((cell) => (
        <Card key={cell.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                <span className="truncate">{cell.name}</span>
              </div>
              <Badge variant={cell.active ? "default" : "secondary"}>
                {cell.active ? "Ativa" : "Inativa"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600">{cell.address}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {DAYS_OF_WEEK[cell.meeting_day]} às {formatTime(cell.meeting_time)}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDelete(cell.id, cell.name)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
