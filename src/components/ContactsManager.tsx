
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export const ContactsManager = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Gerenciamento de Contatos
          </CardTitle>
          <CardDescription>
            Gerencie contatos, membros e visitantes das células
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Módulo de contatos em desenvolvimento...</p>
            <p className="text-sm text-gray-400 mt-2">
              Em breve você poderá cadastrar e gerenciar todos os contatos das células.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
