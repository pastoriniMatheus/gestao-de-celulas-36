
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Home, Users, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NeighborhoodStats {
  id: string;
  neighborhood_name: string;
  city_name: string | null;
  total_cells: number;
  total_contacts: number;
  total_leaders: number;
  total_people: number;
}

export const NeighborhoodStatsCards = () => {
  const [stats, setStats] = useState<NeighborhoodStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('neighborhood_stats')
      .select('*')
      .order('neighborhood_name');
    if (!error) {
      setStats(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando métricas...</span>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="text-center text-gray-600 py-12">
        <MapPin className="h-8 w-8 mx-auto mb-2" />
        Nenhum bairro cadastrado.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {stats.map((bairro) => (
        <Card key={bairro.id} className="hover:scale-[1.02] transition-all shadow-lg border-blue-200 bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-pink-600" />
              {bairro.neighborhood_name}
              <span className="text-xs text-gray-400 font-normal">({bairro.city_name || 'Cidade desconhecida'})</span>
            </CardTitle>
            <CardDescription>
              <span className="font-semibold">{bairro.total_cells}</span> célula(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 pl-1">
              <div className="flex items-center gap-2 text-blue-700">
                <Home className="h-4 w-4" /> 
                <span>{bairro.total_cells} célula(s) ativas</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <Users className="h-4 w-4" />
                <span>{bairro.total_contacts} pessoas (contatos)</span>
              </div>
              <div className="flex items-center gap-2 text-purple-700">
                <Users className="h-4 w-4" />
                <span>{bairro.total_leaders} líderes</span>
              </div>
              <div className="flex items-center gap-2 text-pink-700 font-semibold mt-2">
                <Users className="h-4 w-4" />
                Total: {bairro.total_people}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
