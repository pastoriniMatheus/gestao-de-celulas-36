import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Home, Calendar, QrCode, TrendingUp, Activity } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useCells } from '@/hooks/useCells';
import { useQRCodes } from '@/hooks/useQRCodes';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NeighborhoodStatsCards } from './NeighborhoodStatsCards';

export const Dashboard = () => {
  const { events, loading: eventsLoading } = useEvents();
  const { cells, loading: cellsLoading } = useCells();
  const { qrCodes, loading: qrLoading } = useQRCodes();
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

  if (eventsLoading || cellsLoading || qrLoading || contactsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const activeEvents = events.filter(event => event.active).length;
  const activeCells = cells.filter(cell => cell.active).length;
  const activeQRCodes = qrCodes.filter(qr => qr.active).length;
  const totalScans = [...events, ...qrCodes].reduce((sum, item) => sum + item.scan_count, 0);

  const contactsByStatus = contacts.reduce((acc: any, contact: any) => {
    acc[contact.status] = (acc[contact.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(contactsByStatus).map(([status, count]) => ({
    name: status === 'pending' ? 'Pendente' : 
          status === 'active' ? 'Ativo' : 
          status === 'inactive' ? 'Inativo' : 'Convertido',
    value: count,
    color: status === 'pending' ? '#f59e0b' : 
           status === 'active' ? '#10b981' : 
           status === 'inactive' ? '#6b7280' : '#3b82f6'
  }));

  const eventScansData = events
    .filter(event => event.scan_count > 0)
    .slice(0, 5)
    .map(event => ({
      name: event.name.length > 15 ? event.name.substring(0, 15) + '...' : event.name,
      scans: event.scan_count
    }));

  const qrScansData = qrCodes
    .filter(qr => qr.scan_count > 0)
    .slice(0, 5)
    .map(qr => ({
      name: qr.title.length > 15 ? qr.title.substring(0, 15) + '...' : qr.title,
      scans: qr.scan_count
    }));

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
            <p className="text-xs text-muted-foreground">
              {contacts.filter((c: any) => c.status === 'active').length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Células Ativas</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCells}</div>
            <p className="text-xs text-muted-foreground">
              de {cells.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Ativos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEvents}</div>
            <p className="text-xs text-muted-foreground">
              de {events.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Scans</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScans}</div>
            <p className="text-xs text-muted-foreground">
              QR codes e eventos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards Interativos dos Bairros */}
      <div>
        <h2 className="text-lg font-bold my-2 ml-1">Métricas por Bairro</h2>
        <NeighborhoodStatsCards />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Status dos Contatos
            </CardTitle>
            <CardDescription>
              Distribuição dos contatos por status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Eventos Mais Acessados
            </CardTitle>
            <CardDescription>
              Top 5 eventos por número de scans
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventScansData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventScansData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="scans" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Nenhum evento com scans ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QR Codes Mais Acessados */}
      {qrScansData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-purple-600" />
              QR Codes Mais Acessados
            </CardTitle>
            <CardDescription>
              Top 5 QR codes por número de scans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={qrScansData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="scans" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Resumo de Atividades Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Sistema</CardTitle>
          <CardDescription>
            Visão geral das principais métricas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">QR Codes Ativos</h3>
              <p className="text-2xl font-bold text-blue-600">{activeQRCodes}</p>
              <p className="text-sm text-blue-600">de {qrCodes.length} total</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Taxa de Conversão</h3>
              <p className="text-2xl font-bold text-green-600">
                {contacts.length > 0 ? 
                  Math.round((contacts.filter((c: any) => c.status === 'converted').length / contacts.length) * 100) 
                  : 0}%
              </p>
              <p className="text-sm text-green-600">contatos convertidos</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800">Pendências</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {contacts.filter((c: any) => c.status === 'pending').length}
              </p>
              <p className="text-sm text-yellow-600">contatos pendentes</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Média de Scans</h3>
              <p className="text-2xl font-bold text-purple-600">
                {events.length + qrCodes.length > 0 ? 
                  Math.round(totalScans / (events.length + qrCodes.length)) 
                  : 0}
              </p>
              <p className="text-sm text-purple-600">por QR code/evento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
