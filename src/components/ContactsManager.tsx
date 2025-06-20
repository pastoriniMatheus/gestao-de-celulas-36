import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Filter, Edit, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react';
import { AddContactDialog } from './AddContactDialog';
import { EditContactDialog } from './EditContactDialog';
import { useLeaderContacts } from '@/hooks/useLeaderContacts';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useLocationManager } from '@/hooks/useLocationManager';
import { useCells } from '@/hooks/useCells';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Import the Contact type from the hook
type Contact = ReturnType<typeof useLeaderContacts>['contacts'][0];

export const ContactsManager = () => {
  const { contacts, loading } = useLeaderContacts();
  const { neighborhoods } = useLocationManager();
  const { cells } = useCells();
  const permissions = useUserPermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCell, setSelectedCell] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.whatsapp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCell = selectedCell === 'all' || 
                       (selectedCell === 'no-cell' && !contact.cell_id) ||
                       contact.cell_id === selectedCell;
    
    const matchesStatus = selectedStatus === 'all' || contact.status === selectedStatus;
    
    return matchesSearch && matchesCell && matchesStatus;
  });

  const handleDeleteContact = async (id: string) => {
    if (!permissions.isAdmin) {
      toast({
        title: "Erro",
        description: "Apenas administradores podem deletar contatos",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este contato?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contato deletado com sucesso!"
      });
    } catch (error: any) {
      console.error('Erro ao deletar contato:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar contato",
        variant: "destructive"
      });
    }
  };

  const getNeighborhoodName = (neighborhoodName: string) => {
    return neighborhoodName || 'N/A';
  };

  const getCellName = (cellId: string | null) => {
    if (!cellId) return 'Sem célula';
    const cell = cells.find(c => c.id === cellId);
    return cell ? cell.name : 'N/A';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando contatos...</span>
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
                {permissions.isLeader && !permissions.isAdmin ? 'Meus Contatos' : 'Contatos'}
              </CardTitle>
              <CardDescription>
                {permissions.isLeader && !permissions.isAdmin 
                  ? 'Gerencie os contatos das suas células' 
                  : 'Gerencie todos os contatos do sistema'
                }
              </CardDescription>
            </div>
            <AddContactDialog />
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, WhatsApp ou bairro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCell} onValueChange={setSelectedCell}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por célula" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as células</SelectItem>
                <SelectItem value="no-cell">Sem célula</SelectItem>
                {cells.map((cell) => (
                  <SelectItem key={cell.id} value={cell.id}>
                    {cell.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de contatos */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead>Célula</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Encontro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.whatsapp || 'N/A'}</TableCell>
                  <TableCell>{getNeighborhoodName(contact.neighborhood)}</TableCell>
                  <TableCell>{getCellName(contact.cell_id)}</TableCell>
                  <TableCell>
                    <Badge variant={contact.status === 'active' ? 'default' : 'secondary'}>
                      {contact.status === 'pending' && 'Pendente'}
                      {contact.status === 'active' && 'Ativo'}
                      {contact.status === 'inactive' && 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {contact.encounter_with_god ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingContact(contact)}
                        title="Editar contato"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {permissions.isAdmin && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteContact(contact.id)}
                          title="Deletar contato"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredContacts.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || selectedCell !== 'all' || selectedStatus !== 'all'
                  ? 'Nenhum contato encontrado'
                  : permissions.isLeader && !permissions.isAdmin
                  ? 'Nenhum contato encontrado'
                  : 'Nenhum contato cadastrado'
                }
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedCell !== 'all' || selectedStatus !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : permissions.isLeader && !permissions.isAdmin
                  ? 'Você ainda não possui contatos em suas células.'
                  : 'Comece adicionando um novo contato.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Contact Dialog */}
      {editingContact && (
        <EditContactDialog
          open={!!editingContact}
          onOpenChange={(open) => !open && setEditingContact(null)}
          contact={editingContact}
          context="contacts"
        />
      )}
    </div>
  );
};
