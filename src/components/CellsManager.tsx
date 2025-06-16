
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MapPin, Calendar, Clock, Edit, Trash2, Save, X, QrCode } from 'lucide-react';
import { AddCellDialog } from './AddCellDialog';
import { EditCellDialog } from './EditCellDialog';
import { CellQrCode } from './CellQrCode';
import { useLeaderCells } from '@/hooks/useLeaderCells';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useLocationManager } from '@/hooks/useLocationManager';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const CellsManager = () => {
  const { cells, loading } = useLeaderCells();
  const { neighborhoods } = useLocationManager();
  const permissions = useUserPermissions();
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [showQrCode, setShowQrCode] = useState(false);

  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const handleUpdateCell = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('cells')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Célula atualizada com sucesso!"
      });

      setEditingCell(null);
      setEditValues({});
    } catch (error: any) {
      console.error('Erro ao atualizar célula:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar célula",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCell = async (id: string) => {
    if (!permissions.isAdmin) {
      toast({
        title: "Erro",
        description: "Apenas administradores podem deletar células",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Tem certeza que deseja excluir esta célula?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('cells')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Célula deletada com sucesso!"
      });
    } catch (error: any) {
      console.error('Erro ao deletar célula:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar célula",
        variant: "destructive"
      });
    }
  };

  const getNeighborhoodName = (neighborhoodId: string | null) => {
    if (!neighborhoodId) return 'N/A';
    const neighborhood = neighborhoods.find(n => n.id === neighborhoodId);
    return neighborhood ? neighborhood.name : 'N/A';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando células...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {permissions.isLeader && !permissions.isAdmin ? 'Minhas Células' : 'Células'}
              </CardTitle>
              <CardDescription>
                {permissions.isLeader && !permissions.isAdmin 
                  ? 'Gerencie suas células' 
                  : 'Gerencie as células do sistema'
                }
              </CardDescription>
            </div>
            {permissions.isAdmin && <AddCellDialog />}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead>Dia/Horário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cells.map((cell) => (
                <TableRow key={cell.id}>
                  <TableCell>
                    {editingCell === cell.id ? (
                      <Input
                        value={editValues.name || cell.name}
                        onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full"
                      />
                    ) : (
                      cell.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCell === cell.id ? (
                      <Input
                        value={editValues.address || cell.address}
                        onChange={(e) => setEditValues(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full"
                      />
                    ) : (
                      cell.address
                    )}
                  </TableCell>
                  <TableCell>{getNeighborhoodName(cell.neighborhood_id)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-4 h-4" />
                      {weekDays[cell.meeting_day]}
                      <Clock className="w-4 h-4 ml-2" />
                      {cell.meeting_time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={cell.active ? "default" : "secondary"}>
                      {cell.active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {editingCell === cell.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateCell(cell.id, editValues)}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCell(null);
                              setEditValues({});
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCell(cell);
                              setShowQrCode(true);
                            }}
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCell(cell.id);
                              setEditValues({ 
                                name: cell.name, 
                                address: cell.address 
                              });
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {permissions.isAdmin && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCell(cell.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {cells.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {permissions.isLeader && !permissions.isAdmin 
                  ? 'Nenhuma célula encontrada' 
                  : 'Nenhuma célula cadastrada'
                }
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {permissions.isLeader && !permissions.isAdmin 
                  ? 'Você ainda não é líder de nenhuma célula.' 
                  : 'Comece criando uma nova célula.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCell && (
        <CellQrCode
          cell={selectedCell}
          isOpen={showQrCode}
          onClose={() => {
            setShowQrCode(false);
            setSelectedCell(null);
          }}
        />
      )}
    </div>
  );
};
