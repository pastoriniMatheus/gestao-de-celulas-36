
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Calendar, Eye, Download, ToggleLeft, ToggleRight, Trash2, Edit } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { AddEventDialog } from './AddEventDialog';
import { EditEventDialog } from './EditEventDialog';

export const EventsManager = () => {
  const { events, loading, deleteEvent, toggleEventStatus } = useEvents();
  const { toast } = useToast();
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDownloadQR = (event: any) => {
    try {
      const link = document.createElement('a');
      link.href = event.qr_code;
      link.download = `evento-${event.keyword}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Sucesso",
        description: "QR Code baixado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao baixar QR Code",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleEventStatus(id, !currentStatus);
  };

  const handleDeleteEvent = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o evento "${name}" e seu QR code?`)) {
      try {
        await deleteEvent(id);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir evento.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const activeEvents = events.filter(event => event.active).length;
  const totalScans = events.reduce((sum, event) => sum + event.scan_count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Gerenciamento de Eventos e QR Codes
          </CardTitle>
          <CardDescription>
            Crie eventos e seus QR codes são gerados automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Eventos Ativos</h3>
              <p className="text-2xl font-bold text-blue-600">{activeEvents}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Total de Eventos</h3>
              <p className="text-2xl font-bold text-green-600">{events.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Total de Scans</h3>
              <p className="text-2xl font-bold text-purple-600">{totalScans}</p>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <AddEventDialog />
          </div>
          
          {events.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum evento cadastrado ainda.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span className="truncate">{event.name}</span>
                      </div>
                      <Badge variant={event.active ? "default" : "secondary"}>
                        {event.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-center">
                      <img 
                        src={event.qr_code} 
                        alt={`QR Code ${event.name}`}
                        className="w-32 h-32 border rounded"
                      />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">
                          {formatDate(event.date)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 font-mono">
                          {event.keyword}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">
                          {event.scan_count} scans
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center gap-1 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadQR(event)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleStatus(event.id, event.active)}
                      >
                        {event.active ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id, event.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingEvent && (
        <EditEventDialog
          event={editingEvent}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
};
