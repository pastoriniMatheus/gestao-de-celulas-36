
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Contact, Calendar, MapPin, Phone, Edit, Trash2, Search, Home, User, Users } from 'lucide-react';
import { AddContactDialog } from './AddContactDialog';
import { EditContactDialog } from './EditContactDialog';
import { useLeaderContacts } from '@/hooks/useLeaderContacts';
import { useLeaderCells } from '@/hooks/useLeaderCells';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const ContactsManager = () => {
  const { contacts, loading } = useLeaderContacts();
  const { cells, loading: cellsLoading } = useLeaderCells();
  const permissions = useUserPermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [assigningCell, setAssigningCell] = useState<string | null>(null);

  // Separar contatos pendentes dos demais
  const pendingContacts = contacts.filter(contact => 
    contact.status === 'pending' && !contact.cell_id
  );
  
  const otherContacts = contacts.filter(contact => 
    contact.status !== 'pending' || contact.cell_id
  );

  const filteredPendingContacts = pendingContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOtherContacts = otherContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCells = cells.filter(cell => cell.active);

  const handleAssignCell = async (contactId: string, cellId: string) => {
    if (!cellId || cellId === 'none') return;

    setAssigningCell(contactId);
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ 
          cell_id: cellId,
          status: 'assigned' // Mudando para 'assigned' ao invés de 'member'
        })
        .eq('id', contactId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contato atribuído à célula com sucesso!"
      });
    } catch (error: any) {
      console.error('Erro ao atribuir célula:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atribuir célula",
        variant: "destructive"
      });
    } finally {
      setAssigningCell(null);
    }
  };

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

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      member: 'bg-green-100 text-green-800',
      visitor: 'bg-purple-100 text-purple-800',
      inactive: 'bg-red-100 text-red-800'
    };

    const labels = {
      pending: 'Pendente',
      assigned: 'Atribuído',
      member: 'Membro',
      visitor: 'Visitante',
      inactive: 'Inativo'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
      {/* Seção de Contatos Pendentes */}
      {pendingContacts.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Users className="h-5 w-5" />
              Contatos Pendentes ({pendingContacts.length})
            </CardTitle>
            <CardDescription className="text-orange-700">
              Novos contatos aguardando atribuição de célula
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {filteredPendingContacts.map((contact) => (
                <Card key={contact.id} className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{contact.name}</h3>
                          {getStatusBadge(contact.status)}
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                          {contact.whatsapp && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{contact.whatsapp}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{contact.neighborhood}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            Cadastrado em: {formatDate(contact.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[220px]">
                        <label className="text-sm font-medium text-orange-800">
                          Atribuir à Célula:
                        </label>
                        <Select
                          onValueChange={(value) => handleAssignCell(contact.id, value)}
                          disabled={assigningCell === contact.id || cellsLoading}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecione uma célula" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            {activeCells.map((cell) => (
                              <SelectItem key={cell.id} value={cell.id}>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-sm flex gap-1 items-center">
                                    <Home className="h-3 w-3 mr-1 text-blue-400" />
                                    {cell.name}
                                  </span>
                                  <span className="text-xs text-gray-500">{cell.address}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {assigningCell === contact.id && (
                          <p className="text-xs text-blue-600">Atribuindo...</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção de Outros Contatos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Contact className="h-5 w-5 text-blue-600" />
                {permissions.isLeader && !permissions.isAdmin ? 'Meus Contatos' : 'Contatos'}
              </CardTitle>
              <CardDescription>
                {permissions.isLeader && !permissions.isAdmin 
                  ? `Gerencie os contatos das suas células (${otherContacts.length} contatos)` 
                  : `Gerencie todos os contatos do sistema (${otherContacts.length} contatos)`
                }
              </CardDescription>
            </div>
            {permissions.isAdmin && <AddContactDialog />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou bairro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Encontro com Deus</TableHead>
                <TableHead>Batizado</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOtherContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Contact className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        {contact.age && (
                          <div className="text-sm text-gray-500">{contact.age} anos</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {contact.whatsapp ? (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-600" />
                        <span>{contact.whatsapp}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{contact.neighborhood}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(contact.status)}</TableCell>
                  <TableCell>
                    <Badge variant={contact.encounter_with_god ? "default" : "secondary"}>
                      {contact.encounter_with_god ? 'Sim' : 'Não'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={contact.baptized ? "default" : "secondary"}>
                      {contact.baptized ? 'Sim' : 'Não'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{formatDate(contact.created_at)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedContact(contact);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {permissions.isAdmin && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteContact(contact.id)}
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

          {filteredOtherContacts.length === 0 && (
            <div className="text-center py-8">
              <Contact className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'Nenhum contato encontrado' : 
                 permissions.isLeader && !permissions.isAdmin ? 'Nenhum contato nas suas células' : 'Nenhum contato cadastrado'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Tente usar termos diferentes para a busca.' :
                 permissions.isLeader && !permissions.isAdmin ? 'Os contatos das suas células aparecerão aqui.' : 'Comece adicionando um novo contato.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedContact && (
        <EditContactDialog
          contact={selectedContact}
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) setSelectedContact(null);
          }}
        />
      )}
    </div>
  );
};
