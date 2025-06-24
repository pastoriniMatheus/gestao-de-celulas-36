
import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Users, Network, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { HierarchyLevelControls } from './genealogy/HierarchyLevelControls';
import { LevelMetrics } from './genealogy/LevelMetrics';
import { CustomNode } from './genealogy/CustomNode';
import { useContacts } from '@/hooks/useContacts';
import { useCells } from '@/hooks/useCells';

// Interface para os dados dos membros baseada nos contatos reais
interface MemberData {
  id: string;
  nome: string;
  lider: string;
  celula: string;
  estagio: string;
  indicador_id: string | null;
  indicados: string[];
  whatsapp?: string | null;
  neighborhood?: string;
  status?: string;
}

// Interface para os dados do nó customizado
interface CustomNodeData extends Record<string, unknown> {
  membro: MemberData;
  indicadosCount: number;
  level: number;
  isExpanded: boolean;
  totalDescendants: number;
}

const nodeTypes = {
  customNode: CustomNode,
};

export const GenealogyNetwork = () => {
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [visibleLevels, setVisibleLevels] = useState<Set<number>>(new Set([0, 1, 2, 3, 4]));
  const [focusedLevel, setFocusedLevel] = useState<number | null>(null);
  
  // Hooks para dados reais
  const { contacts, loading: contactsLoading } = useContacts();
  const { cells, loading: cellsLoading } = useCells();

  // Transformar contatos em dados de membros com hierarquia por indicação
  const membersData = useMemo(() => {
    if (contactsLoading || cellsLoading || !contacts.length) return [];

    // Criar mapa de células para busca rápida
    const cellsMap = new Map(cells.map(cell => [cell.id, cell]));

    // Transformar contatos em membros
    const members: MemberData[] = contacts.map(contact => {
      const cell = contact.cell_id ? cellsMap.get(contact.cell_id) : null;
      
      // Mapear status/estágio do contato para estágios da genealogia
      let estagio = 'novo_convertido';
      if (contact.status === 'member' && contact.baptized && contact.encounter_with_god) {
        estagio = 'discipulador';
      } else if (contact.status === 'member' && contact.baptized) {
        estagio = 'em_formacao';
      } else if (contact.status === 'member') {
        estagio = 'lider';
      }

      return {
        id: contact.id,
        nome: contact.name,
        lider: cell?.leader_name || 'Sem líder',
        celula: cell?.name || 'Sem célula',
        estagio,
        indicador_id: contact.referred_by || null,
        indicados: [], // Será preenchido abaixo
        whatsapp: contact.whatsapp,
        neighborhood: contact.neighborhood,
        status: contact.status
      };
    });

    // Preencher array de indicados para cada membro
    members.forEach(member => {
      member.indicados = members
        .filter(m => m.indicador_id === member.id)
        .map(m => m.id);
    });

    // Se não há dados de referência, criar uma hierarquia básica por células
    if (members.every(m => !m.indicador_id)) {
      const leaderMembers = members.filter(m => m.status === 'member' && m.celula !== 'Sem célula');
      const otherMembers = members.filter(m => m.status !== 'member' || m.celula === 'Sem célula');
      
      // Conectar membros sem célula aos líderes de célula
      leaderMembers.forEach((leader, index) => {
        const membersToAssign = otherMembers.slice(index * 2, (index + 1) * 2);
        leader.indicados = membersToAssign.map(m => m.id);
        membersToAssign.forEach(member => {
          member.indicador_id = leader.id;
        });
      });
    }

    return members;
  }, [contacts, cells, contactsLoading, cellsLoading]);

  // Inicializar com alguns nós expandidos
  useEffect(() => {
    if (membersData.length > 0) {
      const rootMembers = membersData.filter(m => !m.indicador_id);
      setExpandedNodes(new Set(rootMembers.slice(0, 3).map(m => m.id)));
    }
  }, [membersData]);

  // Calcular métricas por nível
  const levelMetrics = useMemo(() => {
    const metrics: { [level: number]: { count: number; stages: { [stage: string]: number } } } = {};
    
    membersData.forEach(member => {
      const level = getNodeLevel(member.id, membersData);
      if (!metrics[level]) {
        metrics[level] = { count: 0, stages: {} };
      }
      metrics[level].count++;
      metrics[level].stages[member.estagio] = (metrics[level].stages[member.estagio] || 0) + 1;
    });
    
    return metrics;
  }, [membersData]);

  const { nodes, edges } = useMemo(() => {
    if (!membersData.length) return { nodes: [], edges: [] };

    const allMembers = membersData.map(member => ({
      ...member,
      level: getNodeLevel(member.id, membersData),
      totalDescendants: getTotalDescendants(member.id, membersData)
    }));

    // Filtrar por níveis visíveis e nós expandidos
    const visibleMembers = allMembers.filter(member => {
      const shouldShowByLevel = visibleLevels.has(member.level);
      const shouldShowByExpansion = member.level === 0 || // Sempre mostrar raiz
        expandedNodes.has(member.id) || 
        (member.indicador_id && expandedNodes.has(member.indicador_id));
      
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
          zIndex: 1000 - membro.level,
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
  }, [membersData, expandedNodes, visibleLevels, focusedLevel]);

  const [flowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const toggleNodeExpansion = useCallback((nodeId: string) => {
    const member = membersData.find(m => m.id === nodeId);
    if (member && member.indicados.length > 0) {
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        
        if (prev.has(nodeId)) {
          // Contrair: remover este nó da lista de expandidos
          newSet.delete(nodeId);
        } else {
          // Expandir: adicionar este nó à lista de expandidos
          newSet.add(nodeId);
        }
        
        return newSet;
      });
    }
  }, [membersData]);

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
      const levelMembers = membersData.filter(m => getNodeLevel(m.id, membersData) === level);
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
    event.preventDefault();
    toggleNodeExpansion(node.id);
  }, [toggleNodeExpansion]);

  if (contactsLoading || cellsLoading) {
    return (
      <div className="w-full h-[800px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados da genealogia...</p>
        </div>
      </div>
    );
  }

  if (!membersData.length) {
    return (
      <div className="w-full h-[800px] flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum dado de genealogia encontrado.</p>
          <p className="text-sm text-gray-500 mt-2">
            Adicione contatos com referências para visualizar a rede de discipulado.
          </p>
        </div>
      </div>
    );
  }

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
          onClick={() => setExpandedNodes(new Set(membersData.map(m => m.id)))}
          className="bg-white shadow-md"
        >
          <Network className="w-4 h-4 mr-2" />
          Expandir Tudo
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const rootMembers = membersData.filter(m => !m.indicador_id);
            setExpandedNodes(new Set(rootMembers.map(m => m.id)));
          }}
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

      {/* Controles de Nível - movido para baixo para não sobrepor */}
      <div className="absolute top-16 right-4 z-10 space-y-2 max-w-sm">
        <HierarchyLevelControls
          levelMetrics={levelMetrics}
          visibleLevels={visibleLevels}
          focusedLevel={focusedLevel}
          onToggleLevel={toggleLevel}
          onFocusLevel={focusOnLevel}
        />
      </div>

      {/* Métricas detalhadas - lado esquerdo para não sobrepor */}
      <div className="absolute bottom-4 left-4 z-10">
        <LevelMetrics 
          levelMetrics={levelMetrics}
          totalMembers={membersData.length}
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
        attributionPosition="bottom-right"
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

function calculateNodePosition(nodeId: string, level: number, allMembers: MemberData[]) {
  const baseX = 400;
  const baseY = 100;  // Reduzido para dar mais espaço
  const levelSpacing = 200;  // Reduzido para compactar
  const siblingSpacing = 280;
  
  const member = allMembers.find(m => m.id === nodeId);
  const siblings = allMembers.filter(m => m.indicador_id === member?.indicador_id);
  const siblingIndex = siblings.findIndex(s => s.id === nodeId);
  
  const x = baseX + (siblingIndex - (siblings.length - 1) / 2) * siblingSpacing;
  const y = baseY + level * levelSpacing;
  
  return { x, y };
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
