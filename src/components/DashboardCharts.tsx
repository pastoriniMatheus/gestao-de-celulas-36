
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Users, Home, TrendingUp } from 'lucide-react';

interface CityStats {
  city_name: string;
  total_contacts: number;
  total_cells: number;
  total_members: number;
  total_visitors: number;
}

interface ChartData {
  name: string;
  contacts: number;
  cells: number;
  members: number;
  visitors: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export const DashboardCharts = () => {
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCityStats();
  }, []);

  const fetchCityStats = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          id,
          status,
          cities!inner(name)
        `);

      if (error) throw error;

      // Agrupar por cidade
      const cityMap = new Map<string, CityStats>();
      
      data?.forEach(contact => {
        const cityName = contact.cities?.name || 'Sem cidade';
        
        if (!cityMap.has(cityName)) {
          cityMap.set(cityName, {
            city_name: cityName,
            total_contacts: 0,
            total_cells: 0,
            total_members: 0,
            total_visitors: 0
          });
        }
        
        const stats = cityMap.get(cityName)!;
        stats.total_contacts++;
        
        if (contact.status === 'member') {
          stats.total_members++;
        } else if (contact.status === 'visitor') {
          stats.total_visitors++;
        }
      });

      // Buscar células por cidade
      const { data: cellsData } = await supabase
        .from('cells')
        .select(`
          id,
          neighborhoods!inner(
            city_id,
            cities!inner(name)
          )
        `)
        .eq('active', true);

      cellsData?.forEach(cell => {
        const cityName = cell.neighborhoods?.cities?.name || 'Sem cidade';
        const stats = cityMap.get(cityName);
        if (stats) {
          stats.total_cells++;
        }
      });

      setCityStats(Array.from(cityMap.values()));
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredStats = (): ChartData[] => {
    if (selectedCity === 'all') {
      return cityStats.map(city => ({
        name: city.city_name,
        contacts: city.total_contacts,
        cells: city.total_cells,
        members: city.total_members,
        visitors: city.total_visitors
      }));
    } else {
      const city = cityStats.find(c => c.city_name === selectedCity);
      if (city) {
        return [{
          name: city.city_name,
          contacts: city.total_contacts,
          cells: city.total_cells,
          members: city.total_members,
          visitors: city.total_visitors
        }];
      }
    }
    return [];
  };

  const getTotalStats = () => {
    if (selectedCity === 'all') {
      return cityStats.reduce((acc, city) => ({
        contacts: acc.contacts + city.total_contacts,
        cells: acc.cells + city.total_cells,
        members: acc.members + city.total_members,
        visitors: acc.visitors + city.total_visitors
      }), { contacts: 0, cells: 0, members: 0, visitors: 0 });
    } else {
      const city = cityStats.find(c => c.city_name === selectedCity);
      return city ? {
        contacts: city.total_contacts,
        cells: city.total_cells,
        members: city.total_members,
        visitors: city.total_visitors
      } : { contacts: 0, cells: 0, members: 0, visitors: 0 };
    }
  };

  const chartData = getFilteredStats();
  const totalStats = getTotalStats();

  const pieData = [
    { name: 'Membros', value: totalStats.members },
    { name: 'Visitantes', value: totalStats.visitors },
    { name: 'Pendentes', value: totalStats.contacts - totalStats.members - totalStats.visitors }
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro de Cidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Métricas por Cidade
          </CardTitle>
          <CardDescription>
            Visualize os dados filtrados por cidade ou visão geral
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-medium">Filtrar por cidade:</label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecione uma cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cityStats.map((city) => (
                  <SelectItem key={city.city_name} value={city.city_name}>
                    {city.city_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Total Contatos</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{totalStats.contacts}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Células</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{totalStats.cells}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Membros</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{totalStats.members}</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">Visitantes</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">{totalStats.visitors}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras */}
        <Card>
          <CardHeader>
            <CardTitle>Contatos e Células por Cidade</CardTitle>
            <CardDescription>
              {selectedCity === 'all' ? 'Comparação entre todas as cidades' : `Dados de ${selectedCity}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="contacts" fill="#8884d8" name="Contatos" />
                  <Bar dataKey="cells" fill="#82ca9d" name="Células" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Status</CardTitle>
            <CardDescription>
              {selectedCity === 'all' ? 'Status geral dos contatos' : `Status em ${selectedCity}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
