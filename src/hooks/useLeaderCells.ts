
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserPermissions } from './useUserPermissions';
import { toast } from '@/hooks/use-toast';

export interface LeaderCell {
  id: string;
  name: string;
  address: string;
  meeting_day: number;
  meeting_time: string;
  leader_id: string | null;
  neighborhood_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useLeaderCells = () => {
  const [cells, setCells] = useState<LeaderCell[]>([]);
  const [loading, setLoading] = useState(true);
  const permissions = useUserPermissions();
  const channelRef = useRef<any>(null);
  const mountedRef = useRef(true);

  const fetchCells = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('cells')
        .select('*')
        .eq('active', true)
        .order('name');

      if (permissions.isLeader && !permissions.isAdmin) {
        query = query.eq('leader_id', permissions.userProfile?.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setCells(data || []);
    } catch (error) {
      console.error('Erro ao buscar células:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar células",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!permissions.userProfile?.id) return;

    mountedRef.current = true;
    fetchCells();

    // Setup realtime subscription
    const setupSubscription = async () => {
      try {
        // Remove existing channel if it exists
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        // Create new channel with unique name
        const channelName = `leader-cells-${permissions.userProfile?.id}-${Date.now()}-${Math.random()}`;
        const channel = supabase.channel(channelName);
        channelRef.current = channel;

        // Subscribe to changes
        channel
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'cells' },
            (payload) => {
              if (!mountedRef.current) return;
              
              console.log('Leader cells realtime update:', payload);
              fetchCells(); // Refresh data when changes occur
            }
          )
          .subscribe((status) => {
            console.log('Leader cells subscription status:', status);
          });

      } catch (error) {
        console.error('Error setting up leader cells subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      mountedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [permissions.userProfile?.id]);

  return {
    cells,
    loading,
    fetchCells
  };
};
