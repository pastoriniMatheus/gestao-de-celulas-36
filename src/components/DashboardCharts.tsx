
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";

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
  // Pie: Membros x Encontro com Deus
  const encounterData = [
    { name: "Encontro com Deus", value: stats.totalEncounter },
    { name: "Outros Membros", value: Math.max(0, stats.totalMembers - stats.totalEncounter) },
  ];

  // Pie: Membros x Batizados
  const baptizedData = [
    { name: "Batizados", value: stats.totalBaptized },
    { name: "Não Batizados", value: Math.max(0, stats.totalMembers - stats.totalBaptized) },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-lg bg-white shadow p-4 dark:bg-card flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-center">Membros x Encontro com Deus</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={encounterData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              dataKey="value"
            >
              {encounterData.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg bg-white shadow p-4 dark:bg-card flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-center">Membros x Batizados</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={baptizedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              dataKey="value"
            >
              {baptizedData.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[(idx + 2) % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;
