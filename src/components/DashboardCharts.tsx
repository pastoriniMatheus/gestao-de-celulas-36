
import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardChartsProps {
  stats: {
    totalMembers: number;
    totalEncounter: number;
    totalBaptized: number;
    totalCells: number;
    activeCells: number;
    neighborhoodsWithMembers: number;
    totalNeighborhoods: number;
    totalCities: number;
    totalLeaders: number;
  };
}

const COLORS = [
  "#2563eb", // blue-600
  "#22d3ee", // cyan-400
  "#34d399", // green-400
  "#6366f1", // indigo-500
  "#f472b6", // pink-400
  "#fb7185", // rose-400
  "#fbbf24", // yellow-400
];

const DashboardCharts: React.FC<DashboardChartsProps> = ({ stats }) => {
  const [selectedChart, setSelectedChart] = useState<'encounter' | 'baptized'>('encounter');

  // Dados para Encontro com Deus
  const encounterData = [
    { name: "Com Encontro", value: stats.totalEncounter },
    { name: "Sem Encontro", value: Math.max(0, stats.totalMembers - stats.totalEncounter) },
  ];

  // Dados para Batizados
  const baptizedData = [
    { name: "Batizados", value: stats.totalBaptized },
    { name: "Não Batizados", value: Math.max(0, stats.totalMembers - stats.totalBaptized) },
  ];

  const currentData = selectedChart === 'encounter' ? encounterData : baptizedData;
  const currentTitle = selectedChart === 'encounter' ? 'Membros x Encontro com Deus' : 'Membros x Batizados';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Análise dos Discípulos</CardTitle>
          <Select value={selectedChart} onValueChange={(value: 'encounter' | 'baptized') => setSelectedChart(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="encounter">Encontro com Deus</SelectItem>
              <SelectItem value="baptized">Batizados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <h3 className="font-semibold mb-4 text-center">{currentTitle}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={currentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                dataKey="value"
              >
                {currentData.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCharts;
