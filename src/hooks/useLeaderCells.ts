
import { useState, useEffect, useRef } from 'react';
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
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const mountedRef = useRef(true);

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

      if (mountedRef.current) {
        setCells(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar células:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    if (userProfile) {
      fetchCells();
    }

    // Cleanup function
    return () => {
      mountedRef.current = false;
      console.log('Cleaning up leader cells hook...');
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Error removing channel:', error);
        }
        channelRef.current = null;
      }
      isSubscribedRef.current = false;
    };
  }, [userProfile?.id]);

  // Separate useEffect for subscription
  useEffect(() => {
    if (!userProfile || isSubscribedRef.current || !mountedRef.current) return;

    const setupSubscription = async () => {
      try {
        const channelName = `leader-cells-${userProfile.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log('Creating leader cells subscription:', channelName);

        const channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cells'
            },
            (payload) => {
              console.log('Célula alterada em tempo real:', payload);
              
              if (!mountedRef.current) return;
              
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
          );

        const subscriptionResult = await channel.subscribe();
        console.log('Leader cells subscription result:', subscriptionResult);
        
        if (subscriptionResult === 'SUBSCRIBED') {
          channelRef.current = channel;
          isSubscribedRef.current = true;
        }
      } catch (error) {
        console.error('Error setting up leader cells subscription:', error);
      }
    };

    setupSubscription();
  }, [userProfile, isLeader, isAdmin]);

  return {
    cells,
    loading,
    fetchCells
  };
};
