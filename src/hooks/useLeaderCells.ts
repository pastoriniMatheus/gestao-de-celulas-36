
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

  const fetchCells = async () => {
    try {
      setLoading(true);
      
      if (!permissions.userProfile?.id) {
        setLoading(false);
        return;
      }

      if (!permissions.isLeader) {
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
    if (!permissions.userProfile?.id) {
      setLoading(false);
      return;
    }

    if (!permissions.isLeader) {
      setLoading(false);
      return;
    }

    console.log('useLeaderCells: Initializing for user:', permissions.userProfile.id);
    mountedRef.current = true;
    fetchCells();

    return () => {
      console.log('useLeaderCells: Cleaning up...');
      mountedRef.current = false;
    };
  }, [permissions.userProfile?.id, permissions.isLeader]);

  return {
    cells,
    loading,
    fetchCells
  };
};
