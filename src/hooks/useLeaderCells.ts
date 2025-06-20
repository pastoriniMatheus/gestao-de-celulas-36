
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
  const mountedRef = useRef(true);
  const channelRef = useRef<any>(null);
  const subscriptionActiveRef = useRef(false);

  const fetchCells = async () => {
    try {
      setLoading(true);
      
      // Aguardar o perfil do usuário estar disponível
      if (!permissions.userProfile?.id) {
        setLoading(false);
        return;
      }

      let query = supabase
        .from('cells')
        .select('*')
        .eq('active', true)
        .order('name');

      if (permissions.isLeader && !permissions.isAdmin) {
        query = query.eq('leader_id', permissions.userProfile.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (mountedRef.current) {
        setCells(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar células:', error);
      if (mountedRef.current) {
        toast({
          title: "Erro",
          description: "Erro ao carregar células",
          variant: "destructive"
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Só inicializar se as permissões estiverem carregadas
    if (!permissions.userProfile?.id) {
      setLoading(false);
      return;
    }

    // Se não é líder, retornar vazio
    if (!permissions.isLeader) {
      setLoading(false);
      return;
    }

    console.log('useLeaderCells: Initializing for user:', permissions.userProfile.id);
    mountedRef.current = true;
    fetchCells();

    // Setup realtime subscription
    const setupSubscription = () => {
      if (subscriptionActiveRef.current) {
        console.log('useLeaderCells: Subscription already active, skipping...');
        return;
      }

      try {
        // Clean up any existing channel
        if (channelRef.current) {
          console.log('useLeaderCells: Cleaning up existing channel...');
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        // Create unique channel name
        const uniqueId = Math.random().toString(36).substr(2, 9);
        const channelName = `leader-cells-${permissions.userProfile?.id}-${Date.now()}-${uniqueId}`;
        console.log('useLeaderCells: Creating channel:', channelName);
        
        const channel = supabase.channel(channelName);
        channelRef.current = channel;

        // Subscribe to changes
        channel
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'cells' },
            (payload) => {
              if (!mountedRef.current) return;
              
              console.log('useLeaderCells: Realtime update:', payload);
              fetchCells();
            }
          )
          .subscribe((status) => {
            console.log('useLeaderCells: Subscription status:', status);
            if (status === 'SUBSCRIBED') {
              subscriptionActiveRef.current = true;
            } else if (status === 'CHANNEL_ERROR') {
              subscriptionActiveRef.current = false;
              console.error('useLeaderCells: Channel error');
            }
          });

      } catch (error) {
        console.error('useLeaderCells: Error setting up subscription:', error);
        subscriptionActiveRef.current = false;
      }
    };

    // Delay subscription setup to avoid conflicts
    const timeoutId = setTimeout(setupSubscription, 400);

    return () => {
      console.log('useLeaderCells: Cleaning up...');
      clearTimeout(timeoutId);
      mountedRef.current = false;
      subscriptionActiveRef.current = false;
      
      if (channelRef.current) {
        console.log('useLeaderCells: Removing channel on cleanup...');
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.warn('useLeaderCells: Error removing channel:', error);
        }
        channelRef.current = null;
      }
    };
  }, [permissions.userProfile?.id, permissions.isLeader]); // Only depend on stable values

  return {
    cells,
    loading,
    fetchCells
  };
};
