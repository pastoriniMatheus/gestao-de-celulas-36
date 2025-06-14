
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Phone, MapPin, Home } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { AddContactDialog } from './AddContactDialog';
import { PendingContactsManager } from './PendingContactsManager';

export const ContactsManager = () => {
  const { contacts, loading } = useContacts();

  const activeContacts = contacts.filter(contact => contact.status !== 'pending');
  const pendingCount = contacts.filter(contact => contact.status === 'pending').length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Pendente</Badge>;
      case 'assigned':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Atribuído</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contatos Pendentes */}
      {pendingCount > 0 && <PendingContactsManager />}

      {/* Gerenciamento Geral de Contatos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Gerenciamento de Contatos
          </CardTitle>
          <CardDescription>
            Gerencie visitantes, membros e leads do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total de Contatos</h3>
              <p className="text-2xl font-bold text-blue-600">{contacts.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Contatos Ativos</h3>
              <p className="text-2xl font-bold text-green-600">{activeContacts.length}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800">Pendentes</h3>
              <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <AddContactDialog />
          </div>

          {activeContacts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum contato ativo cadastrado ainda.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeContacts.map((contact) => (
                <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">{contact.name}</h3>
                        {getStatusBadge(contact.status)}
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
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

                        {contact.cell_id && (
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            <span>Célula atribuída</span>
                          </div>
                        )}

                        {contact.age && (
                          <div className="text-xs">
                            Idade: {contact.age} anos
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          Cadastrado: {formatDate(contact.created_at)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
