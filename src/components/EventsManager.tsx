
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, QrCode, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Event {
  id: string;
  name: string;
  keyword: string;
  date: string;
  qrCode: string;
  qrUrl: string;
  scanCount: number;
  active: boolean;
}

export const EventsManager = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      name: 'Encontro de Células',
      keyword: 'encontro-celulas',
      date: '2024-06-14',
      qrCode: 'QR123456',
      qrUrl: `${window.location.origin}/evento/encontro-celulas/qr_123456`,
      scanCount: 45,
      active: true
    },
    {
      id: '2',
      name: 'Culto de Jovens',
      keyword: 'culto-jovens',
      date: '2024-06-15',
      qrCode: 'QR789012',
      qrUrl: `${window.location.origin}/evento/culto-jovens/qr_789012`,
      scanCount: 23,
      active: true
    },
    {
      id: '3',
      name: 'Retiro Espiritual',
      keyword: 'retiro-espiritual',
      date: '2024-06-16',
      qrCode: 'QR345678',
      qrUrl: `${window.location.origin}/evento/retiro-espiritual/qr_345678`,
      scanCount: 8,
      active: false
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    keyword: '',
    date: ''
  });

  const generateSecureQRCode = (eventName: string, keyword: string) => {
    // Usando o sistema de proteção LicenseGuard
    if (window.generateSecureQR) {
      return window.generateSecureQR(eventName, keyword);
    } else {
      // Fallback caso o script não esteja carregado
      const eventId = 'qr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const sanitizedKeyword = keyword.toLowerCase().replace(/[^a-z0-9]/g, '-');
      return {
        eventId,
        eventName,
        keyword: sanitizedKeyword,
        url: `${window.location.origin}/evento/${sanitizedKeyword}/${eventId}`,
        timestamp: Date.now(),
        domain: window.location.hostname,
        scanCount: 0,
        active: true
      };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEvent) {
      setEvents(events.map(event => 
        event.id === editingEvent.id 
          ? { ...event, ...formData }
          : event
      ));
    } else {
      const qrData = generateSecureQRCode(formData.name, formData.keyword);
      const newEvent: Event = {
        id: Date.now().toString(),
        name: formData.name,
        keyword: formData.keyword,
        date: formData.date,
        qrCode: qrData.eventId,
        qrUrl: qrData.url,
        scanCount: 0,
        active: true
      };
      setEvents([...events, newEvent]);
    }
    
    setFormData({ name: '', keyword: '', date: '' });
    setEditingEvent(null);
    setIsDialogOpen(false);
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

  const handleDelete = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const toggleActive = (id: string) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, active: !event.active } : event
    ));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Aqui você pode adicionar um toast de confirmação
  };

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
                <p className="text-sm text-gray-600">Código QR: {event.qrCode}</p>
                <p className="text-sm text-gray-600">Palavra-chave: {event.keyword}</p>
              </div>
              
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <QrCode size={64} className="text-gray-600" />
              </div>
              
              <div className="space-y-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{event.scanCount}</p>
                  <p className="text-sm text-gray-600">Total de Scans</p>
                </div>
                
                <div className="p-2 bg-blue-50 rounded text-xs">
                  <p className="font-medium mb-1">URL do QR Code:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-blue-600 break-all flex-1">{event.qrUrl}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(event.qrUrl)}
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
                  onClick={() => toggleActive(event.id)}
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
