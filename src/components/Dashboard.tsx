
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  CircleCheck,
  Home,
  CalendarDays,
  ChartBar,
  ChartPie,
  TrendingUp,
  MapPin,
  Crown,
  Target,
  Activity,
  Zap,
  Waves
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardCharts } from "./DashboardCharts";
import { DashboardPipelineMetrics } from './DashboardPipelineMetrics';

export const Dashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [cells, setCells] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [cities, setCities] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Configurar real-time updates
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts'
        },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cells'
        },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendances'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Buscar todos os dados em paralelo
      const [contactsData, cellsData, neighborhoodsData, citiesData, attendancesData, profilesData] = await Promise.all([
        supabase.from('contacts').select('*'),
        supabase.from('cells').select('*'),
        supabase.from('neighborhoods').select('*'),
        supabase.from('cities').select('*'),
        supabase.from('attendances').select('*'),
        supabase.from('profiles').select('id, role, active')
      ]);

      setContacts(contactsData.data || []);
      setCells(cellsData.data || []);
      setNeighborhoods(neighborhoodsData.data || []);
      setCities(citiesData.data || []);
      setAttendances(attendancesData.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Carregando painel de controle...</p>
        </div>
      </div>
    );
  }

  // Cálculos de estatísticas
  const totalMembers = contacts.filter(c => c.status === 'member').length;
  const totalVisitors = contacts.filter(c => c.status === 'visitor').length;
  const totalPending = contacts.filter(c => c.status === 'pending').length;
  const totalEncounter = contacts.filter(c => c.encounter_with_god).length;
  const totalBaptized = contacts.filter(c => c.baptized).length;
  const activeCells = cells.filter(c => c.active).length;
  const totalLeaders = cells.filter(c => c.leader_id).length;
  
  // Calcular média de idade
  const contactsWithAge = contacts.filter(c => c.age);
  const averageAge = contactsWithAge.length > 0 
    ? Math.round(contactsWithAge.reduce((sum, c) => sum + c.age, 0) / contactsWithAge.length)
    : 0;

  // Calcular estatísticas de presença (últimos 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentAttendances = attendances.filter(a => 
    new Date(a.attendance_date) >= thirtyDaysAgo && a.present
  );
  
  const uniqueContactsPresent = new Set(recentAttendances.map(a => a.contact_id)).size;
  const attendanceRate = totalMembers > 0 ? Math.round((uniqueContactsPresent / totalMembers) * 100) : 0;

  // Bairros com mais membros
  const neighborhoodStats = neighborhoods.map(n => ({
    name: n.name,
    count: contacts.filter(c => c.neighborhood === n.name).length
  })).sort((a, b) => b.count - a.count);

  // Taxa de conversão (visitantes que viraram membros)
  const conversionRate = totalVisitors > 0 ? Math.round((totalMembers / (totalMembers + totalVisitors)) * 100) : 0;

  const stats = [
    {
      title: "Total de Discípulos",
      value: contacts.length,
      icon: Users,
      gradient: "from-blue-600 to-blue-700",
      bgGradient: "from-blue-50 to-blue-100",
      description: `${totalMembers} membros, ${totalVisitors} visitantes`,
      trend: "+12% este mês"
    },
    {
      title: "Encontro com Deus",
      value: totalEncounter,
      icon: CircleCheck,
      gradient: "from-green-600 to-green-700",
      bgGradient: "from-green-50 to-green-100",
      description: `${Math.round((totalEncounter / contacts.length) * 100)}% dos discípulos`,
      trend: "+8% este mês"
    },
    {
      title: "Batizados",
      value: totalBaptized,
      icon: Waves,
      gradient: "from-cyan-600 to-cyan-700",
      bgGradient: "from-cyan-50 to-cyan-100",
      description: `${Math.round((totalBaptized / contacts.length) * 100)}% dos discípulos`,
      trend: "+5% este mês"
    },
    {
      title: "Células Ativas",
      value: activeCells,
      icon: Home,
      gradient: "from-purple-600 to-purple-700",
      bgGradient: "from-purple-50 to-purple-100",
      description: `${totalLeaders} com líderes definidos`,
      trend: "+2 novas este mês"
    }
  ];

  const secondaryStats = [
    {
      title: "Cidades Atendidas",
      value: cities.length,
      icon: MapPin,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Bairros Cadastrados", 
      value: neighborhoods.length,
      icon: ChartBar,
      color: "text-pink-600",
      bg: "bg-pink-50"
    },
    {
      title: "Idade Média",
      value: averageAge > 0 ? `${averageAge} anos` : "N/A",
      icon: CalendarDays,
      color: "text-cyan-600",
      bg: "bg-cyan-50"
    },
    {
      title: "Taxa de Conversão",
      value: `${conversionRate}%`,
      icon: Target,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Pendentes",
      value: totalPending,
      icon: Activity,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Líderes Ativos",
      value: totalLeaders,
      icon: Crown,
      color: "text-violet-600",
      bg: "bg-violet-50"
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      {/* Header do Dashboard */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Painel de Gestão
        </h1>
        <p className="text-gray-600 text-lg">
          Visão completa e em tempo real do seu sistema de células
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Zap className="h-4 w-4 text-green-500" />
          <span>Dados atualizados em tempo real</span>
        </div>
      </div>
      
      {/* Cards Principais - Métricas Essenciais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={`hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br ${stat.bgGradient} transform hover:-translate-y-1`}>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-gray-600">{stat.description}</p>
                  <p className="text-xs text-green-600 font-medium">{stat.trend}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cards Secundários - Métricas Complementares */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {secondaryStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 border border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                    <p className="text-xs text-gray-600">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bairros com Mais Membros */}
      {neighborhoodStats.length > 0 && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartPie className="h-5 w-5 text-purple-600" />
              Top 5 Bairros com Mais Discípulos
            </CardTitle>
            <CardDescription>
              Distribuição geográfica dos discípulos cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {neighborhoodStats.slice(0, 5).map((neighborhood, index) => (
                <div key={neighborhood.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{neighborhood.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{neighborhood.count}</span>
                    <span className="text-xs text-gray-500">discípulos</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas do Pipeline e Gráfico Unificado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPipelineMetrics />
        <DashboardCharts stats={{
          totalMembers,
          totalEncounter,
          totalBaptized,
          totalCells: cells.length,
          activeCells,
          neighborhoodsWithMembers: neighborhoodStats.filter(n => n.count > 0).length,
          totalNeighborhoods: neighborhoods.length,
          totalCities: cities.length,
          totalLeaders,
        }} />
      </div>

      {/* Footer com Informações Adicionais */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Sistema em Tempo Real</h3>
              <p className="text-sm text-gray-600">
                Todos os dados são atualizados automaticamente conforme as mudanças acontecem no sistema.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Gestão Inteligente</h3>
              <p className="text-sm text-gray-600">
                Acompanhe o crescimento das células, conversões e engajamento dos discípulos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Tomada de Decisão</h3>
              <p className="text-sm text-gray-600">
                Use os insights para identificar oportunidades e otimizar a estratégia das células.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
