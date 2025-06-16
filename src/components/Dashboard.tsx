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
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardCharts from "./DashboardCharts";
import { DashboardPipeline } from './DashboardPipeline';

export const Dashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [cells, setCells] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [cities, setCities] = useState([]);
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
          table: 'neighborhoods'
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
          table: 'cities'
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
          table: 'profiles'
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
    // Buscar contatos
    const { data: contactsData } = await supabase.from('contacts').select('*');
    // Buscar células
    const { data: cellsData } = await supabase.from('cells').select('*');
    // Buscar bairros
    const { data: neighborhoodsData } = await supabase.from('neighborhoods').select('*');
    // Buscar cidades
    const { data: citiesData } = await supabase.from('cities').select('*');
    // Buscar perfis (líderes)
    const { data: profilesData } = await supabase.from('profiles').select('id, role, active');

    // Indicadores reais:
    const totalMembers = contactsData?.length ?? 0;
    const totalEncounter = contactsData?.filter(c => c.encounter_with_god)?.length ?? 0;
    const totalCells = cellsData?.length ?? 0;

    // Quantos bairros têm pelo menos um membro
    let neighborhoodsWithMembers = 0;
    if (contactsData && contactsData.length > 0) {
      const neighborhoodNamesSet = new Set(contactsData.map(c => c.neighborhood).filter(Boolean));
      neighborhoodsWithMembers = neighborhoodNamesSet.size;
    }

    const totalNeighborhoods = neighborhoodsData?.length ?? 0;
    const totalCities = citiesData?.length ?? 0;
    // Perfis ativos e diferentes por id
    const leaderProfiles = profilesData?.filter(p => (p?.role === 'leader' || p?.role === 'admin') && p?.active) ?? [];
    const totalLeaders = leaderProfiles.length;

    setContacts(contactsData);
    setCells(cellsData);
    setNeighborhoods(neighborhoodsData);
    setCities(citiesData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalMembers: contacts.length,
    totalEncounter: contacts.filter(c => c.encounter_with_god).length,
    totalCells: cells.length,
    activeCells: cells.filter(c => c.active).length,
    neighborhoodsWithMembers: neighborhoods.filter(n => 
      contacts.some(c => c.neighborhood === n.name)
    ).length,
    totalNeighborhoods: neighborhoods.length,
    totalCities: cities.length,
    totalLeaders: cells.filter(c => c.leader_id).length,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Painel de Indicadores</h1>
        <p className="text-gray-600 mt-2">Visão geral dos dados do sistema</p>
      </div>
      
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Users className="h-6 w-6 text-blue-700" />
            <CardTitle className="text-lg">Membros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{stats.totalMembers}</div>
            <CardDescription>Membros cadastrados</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <CircleCheck className="h-6 w-6 text-green-600" />
            <CardTitle className="text-lg">Encontro com Deus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{stats.totalEncounter}</div>
            <CardDescription>Já fizeram Encontro com Deus</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Home className="h-6 w-6 text-indigo-600" />
            <CardTitle className="text-lg">Células</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-700">{stats.totalCells}</div>
            <CardDescription>Total de células</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Users className="h-6 w-6 text-yellow-600" />
            <CardTitle className="text-lg">Líderes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{stats.totalLeaders}</div>
            <CardDescription>Líderes cadastrados</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <ChartPie className="h-6 w-6 text-pink-600" />
            <CardTitle className="text-lg">Bairros Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-700">{stats.neighborhoodsWithMembers}</div>
            <CardDescription>Bairros com membros</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <ChartBar className="h-6 w-6 text-orange-600" />
            <CardTitle className="text-lg">Bairros Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">{stats.totalNeighborhoods}</div>
            <CardDescription>Total de bairros</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <CalendarDays className="h-6 w-6 text-violet-600" />
            <CardTitle className="text-lg">Cidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-violet-700">{stats.totalCities}</div>
            <CardDescription>Cidades cadastradas</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline de Contatos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPipeline />
        <DashboardCharts stats={stats} />
      </div>
    </div>
  );
};

export default Dashboard;
