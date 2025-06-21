
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CellLeader {
  id: string;
  name: string;
  photo_url?: string | null;
}

export const useCellLeader = (leaderId: string | null) => {
  const [leader, setLeader] = useState<CellLeader | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!leaderId) {
      setLeader(null);
      return;
    }

    const fetchLeader = async () => {
      setLoading(true);
      try {
        console.log('Buscando dados do líder:', leaderId);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, photo_url')
          .eq('id', leaderId)
          .single();

        if (error) {
          console.error('Erro ao buscar líder:', error);
          return;
        }

        console.log('Líder encontrado:', data);
        setLeader(data);
      } catch (error) {
        console.error('Erro ao buscar dados do líder:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeader();
  }, [leaderId]);

  return { leader, loading };
};
