
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, QrCode, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  name: string;
  keyword: string;
  date: string;
  qr_code: string;
  qr_url: string;
  scan_count: number;
  active: boolean;
}

export const EventsManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    keyword: '',
    date: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('Buscando eventos...');
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }

      console.log('Eventos encontrados:', data);
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSecureQRCode = (eventName: string, keyword: string) => {
    console.log('Gerando QR code para:', eventName, keyword);
    
    // Sempre gerar um QR code simples, independente do license guard
    const eventId = 'qr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const sanitizedKeyword = keyword.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const qrUrl = `${window.location.origin}/evento/${sanitizedKeyword}/${eventId}`;
    
    const qrData = {
      eventId,
      eventName,
      keyword: sanitizedKeyword,
      url: qrUrl,
      timestamp: Date.now(),
      domain: window.location.hostname,
      scanCount: 0,
      active: true
    };
    
    console.log('QR code gerado:', qrData);
    return qrData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Salvando evento:', formData);
    
    try {
      if (editingEvent) {
        console.log('Atualizando evento existente:', editingEvent.id);
        const { error } = await supabase
          .from('events')
          .update({
            name: formData.name,
            keyword: formData.keyword,
            date: formData.date
          })
          .eq('id', editingEvent.id);

        if (error) {
          console.error('Erro ao atualizar:', error);
          throw error;
        }

        toast({
          title: "Sucesso",
          description: "Evento atualizado com sucesso"
        });
      } else {
        console.log('Criando novo evento...');
        const qrData = generateSecureQRCode(formData.name, formData.keyword);
        
        const eventData = {
          name: formData.name,
          keyword: formData.keyword,
          date: formData.date,
          qr_code: qrData.eventId,
          qr_url: qrData.url,
          scan_count: 0,
          active: true
        };
        
        console.log('Dados do evento para inserir:', eventData);
        
        const { data, error } = await supabase
          .from('events')
          .insert(eventData)
          .select();

        if (error) {
          console.error('Erro ao inserir:', error);
          throw error;
        }

        console.log('Evento criado com sucesso:', data);

        toast({
          title: "Sucesso",
          description: "Evento criado com sucesso"
        });
      }
      
      // Recarregar eventos
      await fetchEvents();
      
      // Limpar formulário
      setFormData({ name: '', keyword: '', date: '' });
      setEditingEvent(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast({
        title: "Erro",
        description: `Não foi possível salvar o evento: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({ 
      name: event.name, 
      keyword: event.keyword,
      date: event.date 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('Deletando evento:', id);
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso"
      });
      
      fetchEvents();
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o evento",
        variant: "destructive"
      });
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ active: !currentActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Evento ${!currentActive ? 'ativado' : 'desativado'} com sucesso`
      });
      
      fetchEvents();
    } catch (error) {
      console.error('Erro ao alterar status do evento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do evento",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "URL copiada para a área de transferência"
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando eventos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Eventos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Editar Evento' : 'Novo Evento'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Evento</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Digite o nome do evento"
                  required
                />
              </div>
              <div>
                <Label htmlFor="keyword">Palavra-chave/Título</Label>
                <Input
                  id="keyword"
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  placeholder="ex: encontro-celulas, culto-jovens"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Esta palavra será parte da URL do QR code
                </p>
              </div>
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingEvent ? 'Atualizar' : 'Criar'} Evento
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{event.name}</CardTitle>
                <Badge variant={event.active ? "default" : "secondary"}>
                  {event.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Data: {new Date(event.date).toLocaleDateString('pt-BR')}</p>
                <p className="text-sm text-gray-600">Código QR: {event.qr_code}</p>
                <p className="text-sm text-gray-600">Palavra-chave: {event.keyword}</p>
              </div>
              
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <QrCode size={64} className="text-gray-600" />
              </div>
              
              <div className="space-y-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{event.scan_count}</p>
                  <p className="text-sm text-gray-600">Total de Scans</p>
                </div>
                
                <div className="p-2 bg-blue-50 rounded text-xs">
                  <p className="font-medium mb-1">URL do QR Code:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-blue-600 break-all flex-1">{event.qr_url}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(event.qr_url)}
                      className="flex-shrink-0"
                    >
                      <ExternalLink size={12} />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(event.id, event.active)}
                  className="flex-1"
                >
                  {event.active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(event)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(event.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
