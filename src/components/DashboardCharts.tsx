
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";

interface DashboardChartsProps {
  stats: {
    totalMembers: number;
    totalEncounter: number;
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
  // Pie: Membros cadastrados vs. Encontro com Deus (mostrando proporção)
  const pieData = [
    { name: "Encontro com Deus", value: stats.totalEncounter },
    { name: "Outros Membros", value: stats.totalMembers - stats.totalEncounter },
  ];

  // Bar: Bairros X Cidades X Líderes X Células
  const miscData = [
    {
      name: "Bairros com membros",
      value: stats.neighborhoodsWithMembers,
    },
    {
      name: "Total de Bairros",
      value: stats.totalNeighborhoods,
    },
    {
      name: "Cidades",
      value: stats.totalCities,
    },
    {
      name: "Líderes",
      value: stats.totalLeaders,
    },
    {
      name: "Total de Células",
      value: stats.totalCells,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="rounded-lg bg-white shadow p-4 dark:bg-card flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-center">Membros x Encontro com Deus</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              dataKey="value"
            >
              {pieData.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="col-span-full rounded-lg bg-white shadow p-4 dark:bg-card flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-center">Indicadores Gerais</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={miscData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;
