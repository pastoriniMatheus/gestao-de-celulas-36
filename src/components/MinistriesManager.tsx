
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Edit2, Trash2, UserPlus } from 'lucide-react';
import { useMinistries } from '@/hooks/useMinistries';
import { useContacts } from '@/hooks/useContacts';
import { MinistryMembersDialog } from './MinistryMembersDialog';

export const MinistriesManager = () => {
  const { ministries, loading, createMinistry, updateMinistry, deleteMinistry } = useMinistries();
  const { contacts } = useContacts();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    leader_id: '',
    description: ''
  });

  // Filtrar apenas contatos que são membros de alguma célula
  const cellMembers = contacts.filter(contact => contact.cell_id && contact.status === 'member');

  const resetForm = () => {
    setFormData({ name: '', leader_id: '', description: '' });
    setSelectedMinistry(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMinistry({
        name: formData.name,
        leader_id: formData.leader_id || undefined,
        description: formData.description || undefined
      });
      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar ministério:', error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMinistry) return;
    
    try {
      await updateMinistry(selectedMinistry.id, {
        name: formData.name,
        leader_id: formData.leader_id || null,
        description: formData.description || null
      });
      resetForm();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar ministério:', error);
    }
  };

  const handleDelete = async (ministryId: string) => {
    if (confirm('Tem certeza que deseja excluir este ministério?')) {
      await deleteMinistry(ministryId);
    }
  };

  const openEditDialog = (ministry: any) => {
    console.log('Abrindo diálogo de edição para ministério:', ministry);
    setSelectedMinistry(ministry);
    setFormData({
      name: ministry.name || '',
      leader_id: ministry.leader_id || '',
      description: ministry.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const openMembersDialog = (ministry: any) => {
    console.log('Abrindo diálogo de membros para ministério:', ministry);
    setSelectedMinistry(ministry);
    setIsMembersDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    resetForm();
  };

  const closeMembersDialog = () => {
    setIsMembersDialogOpen(false);
    setSelectedMinistry(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Carregando ministérios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ministérios</h2>
          <p className="text-gray-600">Gerencie os ministérios e seus membros</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Ministério
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Ministério</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="ministry-name">Nome do Ministério *</Label>
                <Input
                  id="ministry-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="ministry-leader">Líder Responsável</Label>
                <Select value={formData.leader_id} onValueChange={(value) => setFormData({ ...formData, leader_id: value })}>
                  <SelectTrigger id="ministry-leader">
                    <SelectValue placeholder="Selecione um líder..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum líder</SelectItem>
                    {cellMembers.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="ministry-description">Descrição</Label>
                <Textarea
                  id="ministry-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">Criar Ministério</Button>
                <Button type="button" variant="outline" onClick={closeCreateDialog}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ministries.map(ministry => (
          <Card key={ministry.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {ministry.name}
                    {ministry.is_system_ministry && (
                      <Badge variant="secondary" className="text-xs">Sistema</Badge>
                    )}
                  </CardTitle>
                  {ministry.leader && (
                    <CardDescription>
                      Líder: {ministry.leader.name}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(ministry)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  {!ministry.is_system_ministry && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(ministry.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {ministry.description && (
                <p className="text-sm text-gray-600 mb-3">{ministry.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {ministry.member_count || 0} membros
                </Badge>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openMembersDialog(ministry)}
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Gerenciar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ministries.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum ministério cadastrado ainda.</p>
            <p className="text-sm text-gray-500">Clique em "Novo Ministério" para começar.</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ministério</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-ministry-name">Nome do Ministério *</Label>
              <Input
                id="edit-ministry-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-ministry-leader">Líder Responsável</Label>
              <Select 
                value={formData.leader_id || ''} 
                onValueChange={(value) => setFormData({ ...formData, leader_id: value })}
              >
                <SelectTrigger id="edit-ministry-leader">
                  <SelectValue placeholder="Selecione um líder..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum líder</SelectItem>
                  {cellMembers.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-ministry-description">Descrição</Label>
              <Textarea
                id="edit-ministry-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">Salvar Alterações</Button>
              <Button type="button" variant="outline" onClick={closeEditDialog}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Gestão de Membros */}
      <MinistryMembersDialog
        ministry={selectedMinistry}
        isOpen={isMembersDialogOpen}
        onClose={closeMembersDialog}
      />
    </div>
  );
};
