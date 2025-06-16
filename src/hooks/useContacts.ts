import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  name: string;
  whatsapp?: string;
  neighborhood: string;
  status: string;
  birth_date?: string;
  city_id?: string;
  cell_id?: string;
  pipeline_stage_id?: string;
  created_at: string;
  updated_at: string;
  encounter_with_god: boolean;
  attendance_code?: string;
}

function generateCode() {
  const length = 6;
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      console.log('Buscando contatos...');
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao buscar contatos:', error);
        throw error;
      }

      console.log('Contatos encontrados:', data);
      const formattedContacts = await Promise.all(
        (data || []).map(async (contact) => {
          let attendance_code = contact.attendance_code;
          if (!attendance_code) {
            attendance_code = generateCode();
            await supabase.from('contacts').update({ attendance_code }).eq('id', contact.id);
          }
          return {
            ...contact,
            attendance_code: attendance_code,
            status: contact.status || 'pending',
            neighborhood: contact.neighborhood || '',
            name: contact.name || '',
            encounter_with_god: !!contact.encounter_with_god
          };
        })
      );
      
      setContacts(formattedContacts);
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar contatos. Tente recarregar a página.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Adicionando contato:', contactData);
      
      const { data, error } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar contato:', error);
        throw error;
      }

      console.log('Contato criado com sucesso:', data);
      
      toast({
        title: "Sucesso",
        description: "Contato adicionado com sucesso!",
      });

      await fetchContacts();
      return data;
    } catch (error) {
      console.error('Erro ao criar contato:', error);
      throw error;
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      console.log('Atualizando contato:', id, updates);
      
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar contato:', error);
        throw error;
      }

      console.log('Contato atualizado com sucesso:', data);
      
      await fetchContacts();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar contato:', error);
      throw error;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      console.log('Deletando contato:', id);
      
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar contato:', error);
        throw error;
      }

      console.log('Contato deletado com sucesso');
      
      toast({
        title: "Sucesso",
        description: "Contato removido com sucesso!",
      });

      await fetchContacts();
    } catch (error) {
      console.error('Erro ao deletar contato:', error);
      throw error;
    }
  };

  const canDeleteCell = async (cellId: string) => {
    try {
      const { count, error } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('cell_id', cellId);

      if (error) {
        console.error('Erro ao verificar contatos vinculados à célula:', error);
        return false;
      }
      return (count ?? 0) === 0;
    } catch (err) {
      return false;
    }
  };

  const canDeleteCity = async (cityId: string) => {
    try {
      const { count: contactsCount, error: contactsError } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('city_id', cityId);

      if (contactsError) {
        console.error('Erro ao verificar contatos da cidade:', contactsError);
        return false;
      }

      const { count: neighborhoodsCount, error: neighborhoodsError } = await supabase
        .from('neighborhoods')
        .select('id', { count: 'exact', head: true })
        .eq('city_id', cityId);

      if (neighborhoodsError) {
        console.error('Erro ao verificar bairros da cidade:', neighborhoodsError);
        return false;
      }

      return (contactsCount ?? 0) === 0 && (neighborhoodsCount ?? 0) === 0;
    } catch (err) {
      console.error('Erro ao verificar se cidade pode ser deletada:', err);
      return false;
    }
  };

  const canDeleteNeighborhood = async (neighborhoodName: string) => {
    try {
      const { count, error } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('neighborhood', neighborhoodName);

      if (error) {
        console.error('Erro ao verificar contatos do bairro:', error);
        return false;
      }

      return (count ?? 0) === 0;
    } catch (err) {
      console.error('Erro ao verificar se bairro pode ser deletado:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchContacts();

    if (channelRef.current) {
      console.log('Removing existing contacts channel...');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    if (!isSubscribedRef.current) {
      const channelName = `contacts-changes-${Date.now()}-${Math.random()}`;
      console.log('Creating new contacts channel:', channelName);

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'contacts'
          },
          (payload) => {
            console.log('Contato alterado:', payload);
            fetchContacts();
          }
        );

      channel.subscribe((status) => {
        console.log('Contacts channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });
      
      channelRef.current = channel;
    }

    return () => {
      console.log('Cleaning up contacts channel...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, []);

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    fetchContacts,
    canDeleteCell,
    canDeleteCity,
    canDeleteNeighborhood
  };
};
