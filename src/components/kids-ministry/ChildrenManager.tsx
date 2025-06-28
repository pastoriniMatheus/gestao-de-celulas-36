
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { useChildren, Child } from '@/hooks/useChildren';
import { useContacts } from '@/hooks/useContacts';
import { format } from 'date-fns';

const CLASS_OPTIONS = ['Berçário', 'Jardim', 'Pré-Adolescentes', 'Adolescentes'];
const TYPE_OPTIONS = ['Membro', 'Visitante'];

export const ChildrenManager = () => {
  const { children, loading, addChild, updateChild, deleteChild } = useChildren();
  const { contacts } = useContacts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    class: '',
    type: '',
    parent_contact_id: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      birth_date: '',
      class: '',
      type: '',
      parent_contact_id: ''
    });
    setEditingChild(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingChild) {
      await updateChild(editingChild.id, formData);
    } else {
      await addChild(formData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (child: Child) => {
    setEditingChild(child);
    setFormData({
      name: child.name,
      birth_date: child.birth_date,
      class: child.class,
      type: child.type,
      parent_contact_id: child.parent_contact_id || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover esta criança?')) {
      await deleteChild(id);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2">Carregando...</span>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Cadastro de Crianças</h2>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Criança
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingChild ? 'Editar Criança' : 'Nova Criança'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="birth_date">Data de Nascimento *</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="class">Turma *</Label>
                <Select 
                  value={formData.class} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_OPTIONS.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Tipo *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="parent">Nome dos Pais</Label>
                <Select 
                  value={formData.parent_contact_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, parent_contact_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione os pais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Não informado</SelectItem>
                    {contacts.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingChild ? 'Atualizar' : 'Cadastrar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crianças Cadastradas ({children.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data de Nascimento</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Pais</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {children.map((child) => (
                <TableRow key={child.id}>
                  <TableCell className="font-medium">{child.name}</TableCell>
                  <TableCell>{format(new Date(child.birth_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{child.class}</TableCell>
                  <TableCell>{child.type}</TableCell>
                  <TableCell>{child.parent_name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(child)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(child.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {children.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Nenhuma criança cadastrada ainda
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
