
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const CLASS_OPTIONS = ['Todos', 'Berçário', 'Jardim', 'Pré-Adolescentes', 'Adolescentes'];

export const AttendanceChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('Todos');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const fetchChartData = async () => {
    try {
      setLoading(true);
      
      const startDate = startOfMonth(new Date(selectedMonth + '-01'));
      const endDate = endOfMonth(new Date(selectedMonth + '-01'));

      let query = supabase
        .from('class_records')
        .select('*')
        .gte('worship_date', format(startDate, 'yyyy-MM-dd'))
        .lte('worship_date', format(endDate, 'yyyy-MM-dd'))
        .order('worship_date');

      if (selectedClass !== 'Todos') {
        query = query.eq('class', selectedClass);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Agrupar dados por data
      const groupedData = data?.reduce((acc: any, record: any) => {
        const date = record.worship_date;
        if (!acc[date]) {
          acc[date] = {
            date: format(new Date(date), 'dd/MM'),
            membros: 0,
            visitantes: 0
          };
        }
        acc[date].membros += record.total_members;
        acc[date].visitantes += record.total_visitors;
        return acc;
      }, {}) || {};

      const chartArray = Object.values(groupedData).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setChartData(chartArray);
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [selectedClass, selectedMonth]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold">Gráfico de Presença</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Turma</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Mês/Ano</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Presença por Data</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Carregando...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="membros" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Membros"
                />
                <Line 
                  type="monotone" 
                  dataKey="visitantes" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Visitantes"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          {!loading && chartData.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Nenhum dado encontrado para o período selecionado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
