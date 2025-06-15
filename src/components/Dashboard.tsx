import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  UsersRound,
  CircleCheck,
  Home,
  CalendarDays,
  ChartBar,
  ChartPie,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardCharts from "./DashboardCharts";

// Ícones Lucide disponíveis: "Users", "UsersRound", "CircleCheck", "Home", "CalendarDays", "ChartBar", "ChartPie"
export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalEncounter: 0,
    totalCells: 0,
    activeCells: 0,
    neighborhoodsWithMembers: 0,
    totalNeighborhoods: 0,
    totalCities: 0,
    totalLeaders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
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
    const activeCells = cellsData?.filter(c => c.active)?.length ?? 0;

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

    setStats({
      totalMembers,
      totalEncounter,
      totalCells,
      activeCells,
      neighborhoodsWithMembers,
      totalNeighborhoods,
      totalCities,
      totalLeaders,
    });
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

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-6">
      <h1 className="text-2xl font-bold text-center mb-3">Painel de Indicadores</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Users className="h-6 w-6 text-blue-700" />
            <CardTitle>Membros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{stats.totalMembers}</div>
            <CardDescription>Membros cadastrados</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CircleCheck className="h-6 w-6 text-green-600" />
            <CardTitle>Encontro com Deus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{stats.totalEncounter}</div>
            <CardDescription>Já fizeram Encontro com Deus</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Home className="h-6 w-6 text-indigo-600" />
            <CardTitle>Células</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-700">{stats.totalCells}</div>
            <CardDescription>Total de células</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <UsersRound className="h-6 w-6 text-teal-600" />
            <CardTitle>Células Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-700">{stats.activeCells}</div>
            <CardDescription>Células ativas</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <ChartPie className="h-6 w-6 text-pink-600" />
            <CardTitle>Bairros com membros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-700">{stats.neighborhoodsWithMembers}</div>
            <CardDescription>Quantos bairros têm membros</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <ChartBar className="h-6 w-6 text-orange-600" />
            <CardTitle>Bairros cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">{stats.totalNeighborhoods}</div>
            <CardDescription>Total de bairros</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CalendarDays className="h-6 w-6 text-violet-600" />
            <CardTitle>Cidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-violet-700">{stats.totalCities}</div>
            <CardDescription>Cidades cadastradas</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Users className="h-6 w-6 text-yellow-600" />
            <CardTitle>Líderes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{stats.totalLeaders}</div>
            <CardDescription>Líderes cadastrados</CardDescription>
          </CardContent>
        </Card>
      </div>
      {/* Bloco bonito de gráficos logo abaixo dos cards */}
      <DashboardCharts stats={stats} />
    </div>
  );
};

export default Dashboard;
