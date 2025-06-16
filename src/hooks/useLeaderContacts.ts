
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface Contact {
  id: string;
  name: string;
  whatsapp: string | null;
  neighborhood: string;
  city_id: string | null;
  cell_id: string | null;
  status: string;
  encounter_with_god: boolean;
  pipeline_stage_id: string | null;
  age: number | null;
  birth_date: string | null;
  attendance_code: string | null;
  created_at: string;
  updated_at: string;
}

export const useLeaderContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile, isLeader, isAdmin } = useUserPermissions();

  const fetchContacts = async () => {
    try {
      setLoading(true);
      
      if (isLeader && !isAdmin && userProfile?.id) {
        // Buscar contatos apenas das células do líder
        const { data: leaderCells } = await supabase
          .from('cells')
          .select('id')
          .eq('leader_id', userProfile.id);

        if (!leaderCells || leaderCells.length === 0) {
          setContacts([]);
          return;
        }

        const cellIds = leaderCells.map(cell => cell.id);
        
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .in('cell_id', cellIds)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar contatos do líder:', error);
          return;
        }

        setContacts(data || []);
      } else if (isAdmin) {
        // Admin vê todos os contatos
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar contatos:', error);
          return;
        }

        setContacts(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile) {
      fetchContacts();

      // Real-time updates
      const channel = supabase
        .channel(`leader-contacts-${userProfile.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'contacts'
          },
          async (payload) => {
            console.log('Contato alterado em tempo real:', payload);
            
            // Se for líder, verificar se o contato pertence às suas células
            if (isLeader && !isAdmin) {
              const { data: leaderCells } = await supabase
                .from('cells')
                .select('id')
                .eq('leader_id', userProfile.id);

              const cellIds = leaderCells?.map(cell => cell.id) || [];
              
              const newData = payload.new as any;
              if (newData && !cellIds.includes(newData.cell_id)) {
                return; // Não processar se não for contato das células do líder
              }
            }

            if (payload.eventType === 'INSERT') {
              setContacts(prev => [payload.new as Contact, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setContacts(prev => prev.map(contact => 
                contact.id === payload.new.id ? payload.new as Contact : contact
              ));
            } else if (payload.eventType === 'DELETE') {
              setContacts(prev => prev.filter(contact => contact.id !== payload.old.id));
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
    contacts,
    loading,
    fetchContacts
  };
};
