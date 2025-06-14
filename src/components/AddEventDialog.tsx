
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';

export const AddEventDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [keyword, setKeyword] = useState('');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const { addEvent } = useEvents();
  const { toast } = useToast();

  const generateQRCode = (keyword: string) => {
    const qrUrl = `${window.location.origin}/qr/${keyword}`;
    return {
      qr_code: `QR-${keyword}-${Date.now()}`,
      qr_url: qrUrl
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !date || !keyword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { qr_code, qr_url } = generateQRCode(keyword);
      
      await addEvent({
        name,
        date,
        keyword,
        qr_code,
        qr_url,
        active
      });

      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso!",
      });

      // Reset form
      setName('');
      setDate('');
      setKeyword('');
      setActive(true);
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar evento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Evento *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Culto de Celebração"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="date">Data do Evento *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="keyword">Palavra-chave *</Label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value.toLowerCase())}
              placeholder="Ex: culto2024"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Esta palavra será usada no QR code para identificar o evento
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={active}
              onCheckedChange={setActive}
            />
            <Label htmlFor="active">Evento ativo</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Evento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
