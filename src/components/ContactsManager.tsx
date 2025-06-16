
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { AddContactDialog } from './AddContactDialog';
import { PendingContactsManager } from './PendingContactsManager';
import { ContactsList } from './ContactsList';

export const ContactsManager = () => {
  const { contacts, loading } = useContacts();

  const pendingCount = contacts.filter(contact => contact.status === 'pending').length;

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
          <div className="flex justify-end mb-4">
            <AddContactDialog />
          </div>
        </CardContent>
      </Card>

      {/* Lista Completa de Contatos */}
      <ContactsList />
    </div>
  );
};
