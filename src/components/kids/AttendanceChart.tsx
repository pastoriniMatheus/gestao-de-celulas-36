
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function AttendanceChart() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data: chartData = [], isLoading } = useQuery({
    queryKey: ['attendance_chart', selectedClass, selectedMonth],
    queryFn: async () => {
      let query = supabase
        .from('class_records')
        .select('worship_date, class, total_members, total_visitors')
        .order('worship_date');

      if (selectedClass) {
        query = query.eq('class', selectedClass);
      }

      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        const startDate = `${year}-${month}-01`;
        const endDate = `${year}-${month}-31`;
        query = query.gte('worship_date', startDate).lte('worship_date', endDate);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Formatar dados para o gráfico
      return data.map(record => ({
        date: new Date(record.worship_date).toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        membros: record.total_members || 0,
        visitantes: record.total_visitors || 0,
        class: record.class
      }));
    }
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['distinct_classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_records')
        .select('class')
        .order('class');
      
      if (error) throw error;
      
      // Obter classes únicas
      const uniqueClasses = [...new Set(data.map(record => record.class))];
      return uniqueClasses;
    }
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-teal-700">Gráfico de Presença</h3>
      
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todas as turmas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as turmas</SelectItem>
              {classes.map((className) => (
                <SelectItem key={className} value={className}>
                  {className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Presença por Data
            {selectedClass && (
              <span className="text-sm font-normal text-gray-600">
                - {selectedClass}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-gray-500">Carregando gráfico...</div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-gray-500">Nenhum dado encontrado para o período selecionado</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => `Data: ${value}`}
                  formatter={(value, name) => [value, name === 'membros' ? 'Membros' : 'Visitantes']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="membros" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  name="Membros"
                />
                <Line 
                  type="monotone" 
                  dataKey="visitantes" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  name="Visitantes"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {chartData.reduce((sum, record) => sum + record.membros, 0)}
              </div>
              <div className="text-sm text-gray-600">Total de Membros</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {chartData.reduce((sum, record) => sum + record.visitantes, 0)}
              </div>
              <div className="text-sm text-gray-600">Total de Visitantes</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {chartData.reduce((sum, record) => sum + record.membros + record.visitantes, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Geral</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
