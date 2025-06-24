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
import { Users, Network, Eye, EyeOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
interface CustomNodeData {
  membro: MemberData;
  indicadosCount: number;
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

const getEstagioColor = (estagio: string) => {
  const colors = {
    pastor: '#8B5CF6',
    lider: '#3B82F6',
    discipulador: '#10B981',
    em_formacao: '#F59E0B',
    novo_convertido: '#EF4444'
  };
  return colors[estagio as keyof typeof colors] || '#6B7280';
};

const getEstagioLabel = (estagio: string) => {
  const labels = {
    pastor: 'Pastor',
    lider: 'Líder',
    discipulador: 'Discipulador',
    em_formacao: 'Em Formação',
    novo_convertido: 'Novo Convertido'
  };
  return labels[estagio as keyof typeof labels] || estagio;
};

const CustomNode = ({ data }: { data: CustomNodeData }) => {
  const { membro, indicadosCount } = data;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="px-4 py-3 shadow-lg rounded-lg border-2 bg-white min-w-[200px] cursor-pointer hover:shadow-xl transition-all duration-200"
            style={{ borderColor: getEstagioColor(membro.estagio) }}
          >
            <div className="text-sm font-semibold text-gray-900 mb-1">
              {membro.nome}
            </div>
            <div className="text-xs text-gray-600 mb-1">
              Líder: {membro.lider}
            </div>
            <div className="text-xs text-gray-600 mb-2">
              {membro.celula}
            </div>
            <Badge 
              className="text-xs"
              style={{ 
                backgroundColor: getEstagioColor(membro.estagio),
                color: 'white'
              }}
            >
              {getEstagioLabel(membro.estagio)}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{membro.nome}</p>
          <p className="text-sm">Indicou {indicadosCount} pessoa(s)</p>
          <p className="text-sm">Estágio: {getEstagioLabel(membro.estagio)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const nodeTypes = {
  customNode: CustomNode,
};

export const GenealogyNetwork = () => {
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2', '3', '4']));

  const { nodes, edges } = useMemo(() => {
    const visibleMembers = mockMembersData.filter(member => 
      expandedNodes.has(member.id) || 
      (member.indicador_id && expandedNodes.has(member.indicador_id))
    );

    const nodes: Node[] = visibleMembers.map((membro, index) => {
      const level = membro.indicador_id ? getNodeLevel(membro.id, mockMembersData) : 0;
      const position = calculateNodePosition(membro.id, level, index, mockMembersData);
      
      return {
        id: membro.id,
        type: 'customNode',
        position,
        data: { 
          membro, 
          indicadosCount: membro.indicados.length 
        } as CustomNodeData,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      };
    });

    const edges: Edge[] = [];
    visibleMembers.forEach(membro => {
      if (membro.indicador_id && expandedNodes.has(membro.indicador_id)) {
        edges.push({
          id: `${membro.indicador_id}-${membro.id}`,
          source: membro.indicador_id,
          target: membro.id,
          type: 'smoothstep',
          animated: false,
          style: { strokeWidth: 2, stroke: '#6B7280' },
        });
      }
    });

    return { nodes, edges };
  }, [expandedNodes]);

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
          // Contrair: remover este nó e seus descendentes
          const toRemove = getDescendants(nodeId, mockMembersData);
          toRemove.forEach(id => newSet.delete(id));
        } else {
          // Expandir: adicionar este nó
          newSet.add(nodeId);
          // Adicionar filhos diretos
          member.indicados.forEach(childId => newSet.add(childId));
        }
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
      </div>

      <div className="absolute top-4 right-4 z-10">
        <Card className="w-64 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Network className="w-4 h-4" />
              Legenda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries({
              pastor: 'Pastor',
              lider: 'Líder',
              discipulador: 'Discipulador',
              em_formacao: 'Em Formação',
              novo_convertido: 'Novo Convertido'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getEstagioColor(key) }}
                />
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
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
              const nodeData = node.data as CustomNodeData;
              return getEstagioColor(nodeData.membro.estagio);
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

function calculateNodePosition(nodeId: string, level: number, index: number, members: MemberData[]) {
  const baseX = 400;
  const baseY = 100;
  const levelSpacing = 200;
  const siblingSpacing = 300;
  
  // Encontrar irmãos (outros nós no mesmo nível com o mesmo pai)
  const member = members.find(m => m.id === nodeId);
  const siblings = members.filter(m => m.indicador_id === member?.indicador_id);
  const siblingIndex = siblings.findIndex(s => s.id === nodeId);
  
  const x = baseX + (siblingIndex - siblings.length / 2) * siblingSpacing;
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
