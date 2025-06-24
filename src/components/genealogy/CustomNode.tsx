
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronRight, Users, Crown } from 'lucide-react';

interface MemberData {
  id: string;
  nome: string;
  lider: string;
  celula: string;
  estagio: string;
  indicador_id: string | null;
  indicados: string[];
}

interface CustomNodeData {
  membro: MemberData;
  indicadosCount: number;
  level: number;
  isExpanded: boolean;
  totalDescendants: number;
}

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

const getLevelIcon = (level: number) => {
  if (level === 0) return Crown;
  return Users;
};

export const CustomNode: React.FC<{ data: CustomNodeData }> = ({ data }) => {
  const { membro, indicadosCount, level, isExpanded, totalDescendants } = data;
  const LevelIcon = getLevelIcon(level);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`
              relative px-4 py-3 shadow-lg rounded-lg border-2 bg-white min-w-[220px] 
              cursor-pointer hover:shadow-xl transition-all duration-200
              ${level === 0 ? 'ring-2 ring-purple-200' : ''}
            `}
            style={{ 
              borderColor: getEstagioColor(membro.estagio),
              transform: `scale(${1 - level * 0.05})` // Nodes menores em níveis mais profundos
            }}
          >
            {/* Indicador de nível */}
            <div className="absolute -top-2 -left-2 flex items-center gap-1">
              <Badge 
                className="text-xs px-2 py-1"
                style={{ 
                  backgroundColor: getEstagioColor(membro.estagio),
                  color: 'white'
                }}
              >
                <LevelIcon className="w-3 h-3 mr-1" />
                N{level}
              </Badge>
            </div>

            {/* Botão de expansão */}
            {indicadosCount > 0 && (
              <div className="absolute -top-2 -right-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0 bg-white border-2 rounded-full"
                  style={{ borderColor: getEstagioColor(membro.estagio) }}
                >
                  {isExpanded ? 
                    <ChevronDown className="w-3 h-3" /> : 
                    <ChevronRight className="w-3 h-3" />
                  }
                </Button>
              </div>
            )}

            {/* Conteúdo do nó */}
            <div className="text-sm font-semibold text-gray-900 mb-1">
              {membro.nome}
            </div>
            
            <div className="text-xs text-gray-600 mb-1">
              Líder: {membro.lider}
            </div>
            
            <div className="text-xs text-gray-600 mb-2">
              {membro.celula}
            </div>
            
            <div className="flex items-center justify-between">
              <Badge 
                className="text-xs"
                style={{ 
                  backgroundColor: getEstagioColor(membro.estagio),
                  color: 'white'
                }}
              >
                {getEstagioLabel(membro.estagio)}
              </Badge>
              
              {totalDescendants > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {totalDescendants}
                </Badge>
              )}
            </div>

            {/* Indicador de profundidade da rede */}
            {totalDescendants > 0 && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="h-1 rounded-full transition-all"
                  style={{ 
                    backgroundColor: getEstagioColor(membro.estagio),
                    width: `${Math.min((totalDescendants / 10) * 100, 100)}%`
                  }}
                />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{membro.nome}</p>
            <div className="text-sm space-y-1">
              <p>Nível hierárquico: {level}</p>
              <p>Indicações diretas: {indicadosCount}</p>
              <p>Total de descendentes: {totalDescendants}</p>
              <p>Estágio: {getEstagioLabel(membro.estagio)}</p>
              <p>Célula: {membro.celula}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
