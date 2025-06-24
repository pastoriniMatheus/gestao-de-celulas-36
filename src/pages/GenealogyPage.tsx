
import React from 'react';
import { GenealogyNetwork } from '@/components/GenealogyNetwork';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Network, Users, TreePine, Target } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useCells } from '@/hooks/useCells';

const GenealogyPage = () => {
  const { contacts } = useContacts();
  const { cells } = useCells();

  // Calcular estatísticas básicas
  const totalMembers = contacts.length;
  const activeConnections = contacts.filter(c => c.referred_by).length;
  const maxDepth = Math.max(
    ...contacts.map(contact => {
      let depth = 0;
      let current = contact;
      const visited = new Set();
      
      while (current.referred_by && !visited.has(current.id)) {
        visited.add(current.id);
        current = contacts.find(c => c.id === current.referred_by) || current;
        depth++;
        if (depth > 10) break; // Prevenir loops infinitos
      }
      
      return depth;
    }),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full">
              <TreePine className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Genealogia da Igreja
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Visualize a rede de discipulado e conexões entre os membros da igreja. 
            Clique nos membros para expandir e ver suas conexões de indicação.
          </p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                Na rede de discipulado
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conexões Ativas</CardTitle>
              <Network className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeConnections}</div>
              <p className="text-xs text-muted-foreground">
                Relacionamentos de indicação
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profundidade Máxima</CardTitle>
              <TreePine className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{maxDepth + 1}</div>
              <p className="text-xs text-muted-foreground">
                Níveis de discipul. máx.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Células Ativas</CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{cells.length}</div>
              <p className="text-xs text-muted-foreground">
                Grupos de discipulado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rede Interativa */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-600" />
              Rede de Discipulado Interativa
            </CardTitle>
            <CardDescription>
              Explore a rede de indicações e discipulado. Use os controles para navegar pelos níveis hierárquicos e expandir as conexões.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <GenealogyNetwork />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenealogyPage;
