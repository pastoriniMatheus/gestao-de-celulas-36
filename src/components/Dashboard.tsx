
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, HeartHandshake } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Dashboard limpo, sem dados prefixados/fictícios, só mostrando os dados reais
export const Dashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*');
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
    } finally {
      setContactsLoading(false);
    }
  };

  if (contactsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Métricas calculadas de acordo com dados REAIS
  const totalMembers = contacts.length;
  const totalEncounter = contacts.filter((c: any) => c.encounter_with_god === true).length;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Resumo Geral</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            <CardTitle>Total de Membros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-700">{totalMembers}</div>
            <CardDescription>Número total de membros cadastrados no sistema</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <HeartHandshake className="h-6 w-6 text-green-600" />
            <CardTitle>Já fez Encontro com Deus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-700">{totalEncounter}</div>
            <CardDescription>Pessoas que marcaram encontro com Deus</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
