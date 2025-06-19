
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserPermissions } from '@/hooks/useUserPermissions';

export interface Cell {
  id: string;
  name: string;
  address: string;
  meeting_day: number;
  meeting_time: string;
  leader_id?: string;
  neighborhood_id?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useLeaderCells = () => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile, isLeader, isAdmin } = useUserPermissions();

  const fetchCells = async () => {
    try {
      setLoading(true);
      let query = supabase.from('cells').select('*').order('name');

      // Se for líder, mostrar apenas suas células
      if (isLeader && !isAdmin && userProfile?.id) {
        query = query.eq('leader_id', userProfile.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar células:', error);
        return;
      }

      setCells(data || []);
    } catch (error) {
      console.error('Erro ao buscar células:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile) {
      fetchCells();

      // Real-time updates
      const channel = supabase
        .channel(`leader-cells-${userProfile.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cells'
          },
          (payload) => {
            console.log('Célula alterada em tempo real:', payload);
            
            // Se for líder, filtrar apenas suas células
            if (isLeader && !isAdmin) {
              if (payload.new && (payload.new as any).leader_id !== userProfile.id) {
                return; // Não processar se não for célula do líder
              }
            }

            if (payload.eventType === 'INSERT') {
              setCells(prev => [...prev, payload.new as Cell]);
            } else if (payload.eventType === 'UPDATE') {
              setCells(prev => prev.map(cell => 
                cell.id === (payload.new as any).id ? payload.new as Cell : cell
              ));
            } else if (payload.eventType === 'DELETE') {
              setCells(prev => prev.filter(cell => cell.id !== (payload.old as any).id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userProfile, isLeader, isAdmin]);

  return {
    cells,
    loading,
    fetchCells
  };
};
