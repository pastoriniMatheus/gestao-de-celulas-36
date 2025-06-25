
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Network, Eye, EyeOff, UserPlus, TreePine, List } from 'lucide-react';
import { HierarchicalGenealogyNode } from './genealogy/HierarchicalGenealogyNode';
import { StandbyPanel } from './genealogy/StandbyPanel';
import { NetworkMetrics } from './genealogy/NetworkMetrics';
import { useContacts } from '@/hooks/useContacts';
import { useCells } from '@/hooks/useCells';

interface MemberNode {
  id: string;
  name: string;
  leader: string;
  cell: string;
  status: string;
  referredBy: string | null;
  referrals: string[];
  whatsapp?: string | null;
  neighborhood?: string;
  baptized: boolean;
  encounterWithGod: boolean;
  level: number;
  totalDescendants: number;
  photo_url: string | null;
}

export const GenealogyNetwork = () => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showStandby, setShowStandby] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('list');
  
  const { contacts, loading: contactsLoading } = useContacts();
  const { cells, loading: cellsLoading } = useCells();

  // Processar dados dos contatos em estrutura hierárquica
  const { connectedMembers, standbyMembers, hierarchicalData } = useMemo(() => {
    if (contactsLoading || cellsLoading || !contacts.length) {
      return { connectedMembers: [], standbyMembers: [], hierarchicalData: [] };
    }

    const cellsMap = new Map(cells.map(cell => [cell.id, cell]));

    // Transformar contatos em membros
    const allMembers: MemberNode[] = contacts.map(contact => {
      const cell = contact.cell_id ? cellsMap.get(contact.cell_id) : null;
      
      return {
        id: contact.id,
        name: contact.name,
        leader: cell?.leader_name || 'Sem líder',
        cell: cell?.name || 'Sem célula',
        status: contact.status,
        referredBy: contact.referred_by || null,
        referrals: [],
        whatsapp: contact.whatsapp,
        neighborhood: contact.neighborhood,
        baptized: contact.baptized || false,
        encounterWithGod: contact.encounter_with_god || false,
        level: 0,
        totalDescendants: 0,
        photo_url: contact.photo_url || null
      };
    });

    // Preencher referrals e calcular níveis
    allMembers.forEach(member => {
      member.referrals = allMembers
        .filter(m => m.referredBy === member.id)
        .map(m => m.id);
      
      member.level = calculateMemberLevel(member.id, allMembers);
      member.totalDescendants = calculateTotalDescendants(member.id, allMembers);
    });

    // Separar membros conectados dos em standby
    const connected = allMembers.filter(member => 
      member.referredBy || member.referrals.length > 0
    );
    
    const standby = allMembers.filter(member => 
      !member.referredBy && member.referrals.length === 0
    );

    // Criar estrutura hierárquica
    const hierarchical = buildHierarchicalStructure(connected);

    return { connectedMembers: connected, standbyMembers: standby, hierarchicalData: hierarchical };
  }, [contacts, cells, contactsLoading, cellsLoading]);

  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (prev.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // Inicializar com nós raiz expandidos
  useEffect(() => {
    if (connectedMembers.length > 0) {
      const rootMembers = connectedMembers.filter(m => !m.referredBy);
      setExpandedNodes(new Set(rootMembers.slice(0, 3).map(m => m.id)));
    }
  }, [connectedMembers]);

  // Calcular métricas por nível
  const levelMetrics = useMemo(() => {
    const metrics: { [level: number]: { count: number; baptized: number; withEncounter: number } } = {};
    
    connectedMembers.forEach(member => {
      if (!metrics[member.level]) {
        metrics[member.level] = { count: 0, baptized: 0, withEncounter: 0 };
      }
      metrics[member.level].count++;
      if (member.baptized) metrics[member.level].baptized++;
      if (member.encounterWithGod) metrics[member.level].withEncounter++;
    });
    
    return metrics;
  }, [connectedMembers]);

  const expandAll = () => {
    setExpandedNodes(new Set(connectedMembers.map(m => m.id)));
  };

  const collapseAll = () => {
    const rootMembers = connectedMembers.filter(m => !m.referredBy);
    setExpandedNodes(new Set(rootMembers.map(m => m.id)));
  };

  if (contactsLoading || cellsLoading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando rede de genealogia...</p>
        </div>
      </div>
    );
  }

  if (!connectedMembers.length && !standbyMembers.length) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum membro encontrado para a rede de genealogia.</p>
          <p className="text-sm text-gray-500 mt-2">
            Adicione contatos para visualizar a rede de discipulado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] relative border rounded-lg overflow-hidden bg-white">
      {/* Header com controles */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="text-xs h-8"
            >
              <List className="w-4 h-4 mr-1" />
              Lista
            </Button>
            
            {viewMode === 'list' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={expandAll}
                  className="text-xs h-8"
                >
                  <Network className="w-4 h-4 mr-1" />
                  Expandir
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={collapseAll}
                  className="text-xs h-8"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Colapsar
                </Button>
              </>
            )}
          </div>

          <Button
            variant={showStandby ? "default" : "outline"}
            size="sm"
            onClick={() => setShowStandby(!showStandby)}
            className="text-xs h-8"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Standby ({standbyMembers.length})
          </Button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="pt-16 pb-2 h-full overflow-y-auto">
        {hierarchicalData.map(rootMember => (
          <HierarchicalTreeView 
            key={rootMember.id}
            member={rootMember}
            allMembers={connectedMembers}
            expandedNodes={expandedNodes}
            onToggleExpansion={toggleNodeExpansion}
            level={0}
          />
        ))}
      </div>

      {/* Métricas da Rede */}
      <div className="absolute bottom-2 left-2 z-10">
        <NetworkMetrics 
          levelMetrics={levelMetrics}
          totalConnected={connectedMembers.length}
          totalStandby={standbyMembers.length}
        />
      </div>

      {/* Painel de Standby */}
      {showStandby && (
        <div className="absolute bottom-2 right-2 z-10">
          <StandbyPanel members={standbyMembers} />
        </div>
      )}
    </div>
  );
};

// Componente para renderizar árvore hierárquica
interface HierarchicalTreeViewProps {
  member: MemberNode;
  allMembers: MemberNode[];
  expandedNodes: Set<string>;
  onToggleExpansion: (nodeId: string) => void;
  level: number;
}

const HierarchicalTreeView: React.FC<HierarchicalTreeViewProps> = ({
  member,
  allMembers,
  expandedNodes,
  onToggleExpansion,
  level
}) => {
  // Encontrar filhos diretos
  const children = allMembers.filter(m => m.referredBy === member.id);
  const isExpanded = expandedNodes.has(member.id);

  return (
    <div>
      <HierarchicalGenealogyNode
        member={member}
        children={children}
        isExpanded={isExpanded}
        onToggleExpansion={onToggleExpansion}
        level={level}
      />
      
      {/* Renderizar filhos recursivamente */}
      {isExpanded && children.map(child => (
        <HierarchicalTreeView
          key={child.id}
          member={child}
          allMembers={allMembers}
          expandedNodes={expandedNodes}
          onToggleExpansion={onToggleExpansion}
          level={level + 1}
        />
      ))}
    </div>
  );
};

// Funções auxiliares
function calculateMemberLevel(memberId: string, members: MemberNode[]): number {
  const member = members.find(m => m.id === memberId);
  if (!member || !member.referredBy) return 0;
  return 1 + calculateMemberLevel(member.referredBy, members);
}

function calculateTotalDescendants(memberId: string, members: MemberNode[]): number {
  const member = members.find(m => m.id === memberId);
  if (!member) return 0;
  
  let total = member.referrals.length;
  member.referrals.forEach(childId => {
    total += calculateTotalDescendants(childId, members);
  });
  
  return total;
}

function buildHierarchicalStructure(members: MemberNode[]): MemberNode[] {
  // Retornar apenas os membros raiz (sem referredBy)
  return members.filter(member => !member.referredBy);
}
