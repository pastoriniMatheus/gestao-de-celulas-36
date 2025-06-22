
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Users } from 'lucide-react';

interface CityData {
  city: string;
  members: number;
  visitors: number;
  total: number;
}

export const DashboardCharts = () => {
  const [cityData, setCityData] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCityData();
  }, []);

  const fetchCityData = async () => {
    setLoading(true);
    try {
      console.log('DashboardCharts: Buscando dados das cidades...');

      // Buscar contatos com informações das cidades
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          id,
          status,
          city_id,
          cities (
            id,
            name,
            state
          )
        `);

      if (contactsError) {
        console.error('Erro ao buscar contatos:', contactsError);
        return;
      }

      console.log('DashboardCharts: Contatos encontrados:', contactsData?.length);

      // Agrupar por cidade
      const cityMap: { [key: string]: { members: number; visitors: number; cityName: string } } = {};

      contactsData?.forEach(contact => {
        if (!contact.cities) return;

        const cityKey = contact.cities.id;
        const cityName = `${contact.cities.name} - ${contact.cities.state}`;

        if (!cityMap[cityKey]) {
          cityMap[cityKey] = { members: 0, visitors: 0, cityName };
        }

        if (contact.status === 'member') {
          cityMap[cityKey].members += 1;
        } else if (contact.status === 'visitor') {
          cityMap[cityKey].visitors += 1;
        } else {
          // Pendentes são contados como potenciais membros
          cityMap[cityKey].members += 1;
        }
      });

      // Converter para array e ordenar
      const formattedData: CityData[] = Object.entries(cityMap)
        .map(([cityId, data]) => ({
          city: data.cityName,
          members: data.members,
          visitors: data.visitors,
          total: data.members + data.visitors
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10); // Top 10 cidades

      console.log('DashboardCharts: Dados das cidades formatados:', formattedData);
      setCityData(formattedData);

    } catch (error) {
      console.error('Erro ao buscar dados das cidades:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-purple-600" />
          Distribuição por Cidade
        </CardTitle>
        <CardDescription>
          Membros e visitantes por cidade (Top 10)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : cityData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Users className="h-12 w-12 mb-4 text-gray-400" />
            <p>Nenhum dado encontrado</p>
            <p className="text-sm">Cadastre contatos com cidades para visualizar o gráfico</p>
          </div>
        ) : (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart 
                data={cityData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="city" 
                  stroke="#666"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="members" 
                  stackId="a" 
                  fill="#3b82f6" 
                  name="Membros"
                  radius={[0, 0, 2, 2]}
                />
                <Bar 
                  dataKey="visitors" 
                  stackId="a" 
                  fill="#10b981" 
                  name="Visitantes"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
