
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users2, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Cell {
  id: string;
  name: string;
  leader: string;
  address: string;
  members: Member[];
}

interface Member {
  id: string;
  name: string;
  whatsapp: string;
}

export const CellsManager = () => {
  const [cells, setCells] = useState<Cell[]>([
    {
      id: '1',
      name: 'Célula Esperança',
      leader: 'Pastor João Silva',
      address: 'Rua das Flores, 123 - Centro',
      members: [
        { id: '1', name: 'Maria Silva', whatsapp: '(11) 99999-9999' },
        { id: '2', name: 'Sofia Oliveira', whatsapp: '(11) 55555-5555' }
      ]
    },
    {
      id: '2',
      name: 'Célula Fé',
      leader: 'Líder Maria Santos',
      address: 'Av. Principal, 456 - Jardim Europa',
      members: [
        { id: '3', name: 'Ana Costa', whatsapp: '(11) 77777-7777' }
      ]
    },
    {
      id: '3',
      name: 'Célula Amor',
      leader: 'Líder Pedro Lima',
      address: 'Rua da Paz, 789 - Vila Nova',
      members: []
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<Cell | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    leader: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCell) {
      setCells(cells.map(cell => 
        cell.id === editingCell.id 
          ? { ...cell, ...formData }
          : cell
      ));
    } else {
      const newCell: Cell = {
        id: Date.now().toString(),
        ...formData,
        members: []
      };
      setCells([...cells, newCell]);
    }
    
    setFormData({ name: '', leader: '', address: '' });
    setEditingCell(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (cell: Cell) => {
    setEditingCell(cell);
    setFormData({ 
      name: cell.name, 
      leader: cell.leader, 
      address: cell.address 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCells(cells.filter(cell => cell.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Células</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Célula
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCell ? 'Editar Célula' : 'Nova Célula'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Célula</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Digite o nome da célula"
                  required
                />
              </div>
              <div>
                <Label htmlFor="leader">Líder</Label>
                <Input
                  id="leader"
                  value={formData.leader}
                  onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                  placeholder="Nome do líder"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Endereço completo"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingCell ? 'Atualizar' : 'Criar'} Célula
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cells.map((cell) => (
          <Card key={cell.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{cell.name}</CardTitle>
                <Badge variant="secondary">
                  {cell.members.length} membros
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Líder:</p>
                <p className="text-sm text-gray-600">{cell.leader}</p>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">{cell.address}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users2 size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Membros:</span>
                </div>
                {cell.members.length > 0 ? (
                  <div className="space-y-2">
                    {cell.members.map((member) => (
                      <div key={member.id} className="p-2 bg-gray-50 rounded text-sm">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-gray-600">{member.whatsapp}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Nenhum membro cadastrado</p>
                )}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(cell)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(cell.id)}
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
