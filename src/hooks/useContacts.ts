
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  name: string;
  whatsapp?: string;
  neighborhood: string;
  status: string;
  age?: number;
  city_id?: string;
  cell_id?: string;
  created_at: string;
  updated_at: string;
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

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
      setContacts(data || []);
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
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

      // Adicionar o novo contato à lista local
      setContacts(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Erro ao criar contato:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return {
    contacts,
    loading,
    addContact,
    fetchContacts
  };
};
