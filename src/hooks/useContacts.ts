
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  created_at: string;
  updated_at: string;
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar contatos:', error);
        return;
      }

      setContacts(data || []);
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar contato:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Contato criado com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar contato:', error);
      throw error;
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
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

      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar contato:', error);
      throw error;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar contato:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Contato deletado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao deletar contato:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchContacts();

    // Configurar real-time updates
    const channel = supabase
      .channel('contacts-changes')
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
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    fetchContacts
  };
};
