
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, QrCode, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Event {
  id: string;
  name: string;
  date: string;
  qrCode: string;
  scanCount: number;
  active: boolean;
}

export const EventsManager = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      name: 'Encontro de Células',
      date: '2024-06-14',
      qrCode: 'QR123456',
      scanCount: 45,
      active: true
    },
    {
      id: '2',
      name: 'Culto de Jovens',
      date: '2024-06-15',
      qrCode: 'QR789012',
      scanCount: 23,
      active: true
    },
    {
      id: '3',
      name: 'Retiro Espiritual',
      date: '2024-06-16',
      qrCode: 'QR345678',
      scanCount: 8,
      active: false
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: ''
  });

  const generateQRCode = () => {
    return 'QR' + Math.random().toString(36).substr(2, 6).toUpperCase();
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
      const newEvent: Event = {
        id: Date.now().toString(),
        ...formData,
        qrCode: generateQRCode(),
        scanCount: 0,
        active: true
      };
      setEvents([...events, newEvent]);
    }
    
    setFormData({ name: '', date: '' });
    setEditingEvent(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({ name: event.name, date: event.date });
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
              </div>
              
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <QrCode size={64} className="text-gray-600" />
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{event.scanCount}</p>
                <p className="text-sm text-gray-600">Total de Scans</p>
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
