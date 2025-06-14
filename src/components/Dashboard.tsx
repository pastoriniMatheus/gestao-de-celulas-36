
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, QrCode, MessageSquare, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalContacts: number;
  activeCells: number;
  activeEvents: number;
  totalScans: number;
}

interface RecentActivity {
  id: string;
  type: 'contact' | 'scan' | 'assignment';
  message: string;
  time: string;
}

interface UpcomingEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  scan_count: number;
  active: boolean;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    activeCells: 0,
    activeEvents: 0,
    totalScans: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Buscar estatísticas
      const [contactsData, cellsData, eventsData] = await Promise.all([
        supabase.from('contacts').select('id', { count: 'exact' }),
        supabase.from('cells').select('id', { count: 'exact' }).eq('active', true),
        supabase.from('events').select('scan_count').eq('active', true)
      ]);

      const totalScans = eventsData.data?.reduce((sum, event) => sum + event.scan_count, 0) || 0;

      setStats({
        totalContacts: contactsData.count || 0,
        activeCells: cellsData.count || 0,
        activeEvents: eventsData.data?.length || 0,
        totalScans
      });

      // Buscar próximos eventos
      const { data: eventsResult } = await supabase
        .from('events')
        .select('id, name, date, scan_count, active')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(3);

      if (eventsResult) {
        const formattedEvents = eventsResult.map(event => ({
          ...event,
          time: '19:00' // Horário padrão, pode ser customizado
        }));
        setUpcomingEvents(formattedEvents);
      }

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    } else {
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'long',
        day: 'numeric',
        month: 'short'
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema de células</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts}</div>
            <p className="text-xs opacity-80">Pessoas cadastradas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Células Ativas</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCells}</div>
            <p className="text-xs opacity-80">Grupos funcionando</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Ativos</CardTitle>
            <QrCode className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
            <p className="text-xs opacity-80">{stats.totalScans} scans total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalContacts > 0 ? Math.round((stats.totalScans / stats.totalContacts) * 100) : 0}%
            </div>
            <p className="text-xs opacity-80">Taxa de participação</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Sistema conectado ao Supabase</p>
                  <p className="text-xs text-gray-500">Dados em tempo real disponíveis</p>
                </div>
                <span className="text-xs text-gray-500">Agora</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Dados de amostra carregados</p>
                  <p className="text-xs text-gray-500">{stats.totalContacts} contatos e {stats.activeCells} células</p>
                </div>
                <span className="text-xs text-gray-500">5min atrás</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Sistema de eventos configurado</p>
                  <p className="text-xs text-gray-500">QR Codes disponíveis</p>
                </div>
                <span className="text-xs text-gray-500">10min atrás</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(event.date)}, {event.time}
                    </p>
                    <p className="text-xs text-gray-500">
                      QR Code: {event.active ? 'Ativo' : 'Inativo'} ({event.scan_count} scans)
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Nenhum evento próximo</p>
                  <p className="text-xs text-gray-400">Crie novos eventos na seção de eventos</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
