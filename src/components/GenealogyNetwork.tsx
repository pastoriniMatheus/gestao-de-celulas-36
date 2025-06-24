
import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Position,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Network, Eye, EyeOff, ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HierarchyLevelControls } from './genealogy/HierarchyLevelControls';
import { LevelMetrics } from './genealogy/LevelMetrics';
import { CustomNode } from './genealogy/CustomNode';

// Interface para os dados dos membros
interface MemberData {
  id: string;
  nome: string;
  lider: string;
  celula: string;
  estagio: string;
  indicador_id: string | null;
  indicados: string[];
}

// Interface para os dados do nó customizado
interface CustomNodeData extends Record<string, unknown> {
  membro: MemberData;
  indicadosCount: number;
  level: number;
  isExpanded: boolean;
  totalDescendants: number;
}

// Dados simulados para a genealogia
const mockMembersData: MemberData[] = [
  {
    id: '1',
    nome: 'Pastor João Silva',
    lider: 'Pastor Principal',
    celula: 'Liderança Central',
    estagio: 'pastor',
    indicador_id: null,
    indicados: ['2', '3', '4']
  },
  {
    id: '2',
    nome: 'Maria Santos',
    lider: 'Pastor João',
    celula: 'Célula Esperança',
    estagio: 'discipulador',
    indicador_id: '1',
    indicados: ['5', '6']
  },
  {
    id: '3',
    nome: 'Pedro Lima',
    lider: 'Pastor João',
    celula: 'Célula Fé',
    estagio: 'discipulador',
    indicador_id: '1',
    indicados: ['7', '8', '9']
  },
  {
    id: '4',
    nome: 'Ana Costa',
    lider: 'Pastor João',
    celula: 'Célula Amor',
    estagio: 'lider',
    indicador_id: '1',
    indicados: ['10']
  },
  {
    id: '5',
    nome: 'Carlos Oliveira',
    lider: 'Maria Santos',
    celula: 'Célula Esperança',
    estagio: 'em_formacao',
    indicador_id: '2',
    indicados: ['11']
  },
  {
    id: '6',
    nome: 'Sofia Almeida',
    lider: 'Maria Santos',
    celula: 'Célula Esperança',
    estagio: 'novo_convertido',
    indicador_id: '2',
    indicados: []
  },
  {
    id: '7',
    nome: 'Roberto Silva',
    lider: 'Pedro Lima',
    celula: 'Célula Fé',
    estagio: 'discipulador',
    indicador_id: '3',
    indicados: ['12']
  },
  {
    id: '8',
    nome: 'Carla Souza',
    lider: 'Pedro Lima',
    celula: 'Célula Fé',
    estagio: 'em_formacao',
    indicador_id: '3',
    indicados: []
  },
  {
    id: '9',
    nome: 'Lucas Martins',
    lider: 'Pedro Lima',
    celula: 'Célula Fé',
    estagio: 'novo_convertido',
    indicador_id: '3',
    indicados: []
  },
  {
    id: '10',
    nome: 'Julia Ferreira',
    lider: 'Ana Costa',
    celula: 'Célula Amor',
    estagio: 'em_formacao',
    indicador_id: '4',
    indicados: []
  },
  {
    id: '11',
    nome: 'Diego Santos',
    lider: 'Carlos Oliveira',
    celula: 'Célula Esperança',
    estagio: 'novo_convertido',
    indicador_id: '5',
    indicados: []
  },
  {
    id: '12',
    nome: 'Fernanda Lima',
    lider: 'Roberto Silva',
    celula: 'Célula Fé',
    estagio: 'novo_convertido',
    indicador_id: '7',
    indicados: []
  }
];

const nodeTypes = {
  customNode: CustomNode,
};

export const GenealogyNetwork = () => {
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1']));
  const [visibleLevels, setVisibleLevels] = useState<Set<number>>(new Set([0, 1, 2, 3, 4]));
  const [focusedLevel, setFocusedLevel] = useState<number | null>(null);

  // Calcular métricas por nível
  const levelMetrics = useMemo(() => {
    const metrics: { [level: number]: { count: number; stages: { [stage: string]: number } } } = {};
    
    mockMembersData.forEach(member => {
      const level = getNodeLevel(member.id, mockMembersData);
      if (!metrics[level]) {
        metrics[level] = { count: 0, stages: {} };
      }
      metrics[level].count++;
      metrics[level].stages[member.estagio] = (metrics[level].stages[member.estagio] || 0) + 1;
    });
    
    return metrics;
  }, []);

  const { nodes, edges } = useMemo(() => {
    const allMembers = mockMembersData.map(member => ({
      ...member,
      level: getNodeLevel(member.id, mockMembersData),
      totalDescendants: getTotalDescendants(member.id, mockMembersData)
    }));

    // Filtrar por níveis visíveis e nós expandidos
    const visibleMembers = allMembers.filter(member => {
      const shouldShowByLevel = visibleLevels.has(member.level);
      const shouldShowByExpansion = expandedNodes.has(member.id) || 
        (member.indicador_id && expandedNodes.has(member.indicador_id)) || 
        member.level === 0;
      
      if (focusedLevel !== null) {
        return member.level === focusedLevel;
      }
      
      return shouldShowByLevel && shouldShowByExpansion;
    });

    const nodes: Node[] = visibleMembers.map((membro) => {
      const position = calculateNodePosition(membro.id, membro.level, allMembers);
      const isExpanded = expandedNodes.has(membro.id);
      
      return {
        id: membro.id,
        type: 'customNode',
        position,
        data: {
          membro: {
            id: membro.id,
            nome: membro.nome,
            lider: membro.lider,
            celula: membro.celula,
            estagio: membro.estagio,
            indicador_id: membro.indicador_id,
            indicados: membro.indicados
          },
          indicadosCount: membro.indicados.length,
          level: membro.level,
          isExpanded,
          totalDescendants: membro.totalDescendants
        } satisfies CustomNodeData,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        style: {
          zIndex: 1000 - membro.level, // Níveis superiores ficam por cima
        }
      };
    });

    const edges: Edge[] = [];
    visibleMembers.forEach(membro => {
      if (membro.indicador_id && visibleMembers.find(m => m.id === membro.indicador_id)) {
        edges.push({
          id: `${membro.indicador_id}-${membro.id}`,
          source: membro.indicador_id,
          target: membro.id,
          type: 'smoothstep',
          animated: false,
          style: { 
            strokeWidth: 2, 
            stroke: getLevelColor(membro.level),
            opacity: focusedLevel !== null ? (membro.level === focusedLevel ? 1 : 0.3) : 1
          },
        });
      }
    });

    return { nodes, edges };
  }, [expandedNodes, visibleLevels, focusedLevel]);

  const [flowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const toggleNodeExpansion = (nodeId: string) => {
    const member = mockMembersData.find(m => m.id === nodeId);
    if (member && member.indicados.length > 0) {
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        if (prev.has(nodeId)) {
          // Contrair: remover descendentes
          const descendants = getDescendants(nodeId, mockMembersData);
          descendants.forEach(id => newSet.delete(id));
        } else {
          // Expandir: adicionar filhos diretos
          newSet.add(nodeId);
          member.indicados.forEach(childId => newSet.add(childId));
        }
        return newSet;
      });
    }
  };

  const toggleLevel = (level: number) => {
    setVisibleLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  };

  const focusOnLevel = (level: number | null) => {
    setFocusedLevel(level);
    if (level !== null) {
      // Expandir todos os nós do nível focado
      const levelMembers = mockMembersData.filter(m => getNodeLevel(m.id, mockMembersData) === level);
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        levelMembers.forEach(member => {
          newSet.add(member.id);
          if (member.indicador_id) newSet.add(member.indicador_id);
        });
        return newSet;
      });
    }
  };

  React.useEffect(() => {
    setNodes(nodes);
    setEdges(edges);
  }, [nodes, edges, setNodes, setEdges]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    toggleNodeExpansion(node.id);
  }, []);

  return (
    <div className="w-full h-[800px] relative">
      {/* Controles superiores */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMiniMap(!showMiniMap)}
          className="bg-white shadow-md"
        >
          {showMiniMap ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {showMiniMap ? 'Ocultar' : 'Mostrar'} Minimap
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpandedNodes(new Set(mockMembersData.map(m => m.id)))}
          className="bg-white shadow-md"
        >
          <Network className="w-4 h-4 mr-2" />
          Expandir Tudo
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpandedNodes(new Set(['1']))}
          className="bg-white shadow-md"
        >
          <Users className="w-4 h-4 mr-2" />
          Contrair Tudo
        </Button>

        <Button
          variant={focusedLevel !== null ? "default" : "outline"}
          size="sm"
          onClick={() => focusOnLevel(focusedLevel !== null ? null : 0)}
          className="bg-white shadow-md"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          {focusedLevel !== null ? 'Ver Todos' : 'Foco por Nível'}
        </Button>
      </div>

      {/* Controles de Nível */}
      <div className="absolute top-4 right-4 z-10 space-y-2 max-w-sm">
        <HierarchyLevelControls
          levelMetrics={levelMetrics}
          visibleLevels={visibleLevels}
          focusedLevel={focusedLevel}
          onToggleLevel={toggleLevel}
          onFocusLevel={focusOnLevel}
        />
      </div>

      {/* Métricas detalhadas */}
      <div className="absolute bottom-4 right-4 z-10">
        <LevelMetrics 
          levelMetrics={levelMetrics}
          totalMembers={mockMembersData.length}
        />
      </div>

      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-gradient-to-br from-blue-50 to-purple-50"
      >
        <Controls className="bg-white shadow-lg rounded-lg" />
        {showMiniMap && (
          <MiniMap 
            className="bg-white shadow-lg rounded-lg border"
            nodeStrokeWidth={3}
            nodeColor={(node) => {
              const nodeData = node.data as unknown as CustomNodeData;
              return getLevelColor(nodeData.level);
            }}
          />
        )}
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
    </div>
  );
};

// Funções auxiliares
function getNodeLevel(nodeId: string, members: MemberData[]): number {
  const member = members.find(m => m.id === nodeId);
  if (!member || !member.indicador_id) return 0;
  return 1 + getNodeLevel(member.indicador_id, members);
}

function getTotalDescendants(nodeId: string, members: MemberData[]): number {
  const member = members.find(m => m.id === nodeId);
  if (!member) return 0;
  
  let total = member.indicados.length;
  member.indicados.forEach(childId => {
    total += getTotalDescendants(childId, members);
  });
  
  return total;
}

function calculateNodePosition(nodeId: string, level: number, allMembers: typeof mockMembersData) {
  const baseX = 400;
  const baseY = 150;
  const levelSpacing = 250;
  const siblingSpacing = 350;
  
  // Encontrar irmãos no mesmo nível
  const member = allMembers.find(m => m.id === nodeId);
  const siblings = allMembers.filter(m => m.indicador_id === member?.indicador_id);
  const siblingIndex = siblings.findIndex(s => s.id === nodeId);
  
  // Calcular posição com base no nível e posição entre irmãos
  const x = baseX + (siblingIndex - (siblings.length - 1) / 2) * siblingSpacing;
  const y = baseY + level * levelSpacing;
  
  return { x, y };
}

function getDescendants(nodeId: string, members: MemberData[]): string[] {
  const descendants: string[] = [];
  const member = members.find(m => m.id === nodeId);
  
  if (member) {
    member.indicados.forEach(childId => {
      descendants.push(childId);
      descendants.push(...getDescendants(childId, members));
    });
  }
  
  return descendants;
}

function getLevelColor(level: number): string {
  const colors = [
    '#8B5CF6', // Nível 0 - Roxo
    '#3B82F6', // Nível 1 - Azul
    '#10B981', // Nível 2 - Verde
    '#F59E0B', // Nível 3 - Amarelo
    '#EF4444', // Nível 4 - Vermelho
    '#6B7280', // Outros níveis - Cinza
  ];
  return colors[level] || colors[colors.length - 1];
}
