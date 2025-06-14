
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useQRCodes } from '@/hooks/useQRCodes';

export const CreateQRCodeDialog = () => {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const { createQRCode } = useQRCodes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim() || !title.trim()) {
      return;
    }

    setLoading(true);
    const result = await createQRCode(keyword.trim(), title.trim());
    
    if (result) {
      setKeyword('');
      setTitle('');
      setOpen(false);
    }
    
    setLoading(false);
  };

  const formatKeyword = (value: string) => {
    // Converter para lowercase e remover caracteres especiais
    return value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Criar QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo QR Code</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do QR Code</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Evento Principal"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="keyword">Palavra-chave (será parte da URL)</Label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(formatKeyword(e.target.value))}
              placeholder="Ex: evento-principal"
              required
            />
            <p className="text-sm text-gray-500">
              URL gerada: {window.location.origin}/qr/{keyword || 'palavra-chave'}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !keyword.trim() || !title.trim()}>
              {loading ? 'Criando...' : 'Criar QR Code'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
