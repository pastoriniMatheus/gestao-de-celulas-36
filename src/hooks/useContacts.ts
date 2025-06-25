import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useUniqueAttendanceCode } from './useUniqueAttendanceCode';

interface Contact {
  id: string;
  name: string;
  whatsapp: string | null;
  neighborhood: string;
  city_id: string | null;
  cell_id: string | null;
  status: string;
  encounter_with_god: boolean;
  baptized: boolean;
  pipeline_stage_id: string | null;
  age: number | null;
  birth_date: string | null;
  attendance_code: string | null;
  referred_by: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { generateUniqueAttendanceCode } = useUniqueAttendanceCode();

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

      // Transform the data to ensure all fields are properly typed
      const transformedData: Contact[] = (data || []).map(contact => ({
        id: contact.id,
        name: contact.name,
        whatsapp: contact.whatsapp,
        neighborhood: contact.neighborhood,
        city_id: contact.city_id,
        cell_id: contact.cell_id,
        status: contact.status,
        encounter_with_god: contact.encounter_with_god,
        baptized: contact.baptized || false,
        pipeline_stage_id: contact.pipeline_stage_id,
        age: contact.age,
        birth_date: contact.birth_date,
        attendance_code: contact.attendance_code,
        referred_by: (contact as any).referred_by || null,
        photo_url: contact.photo_url || null,
        created_at: contact.created_at,
        updated_at: contact.updated_at
      }));

      setContacts(transformedData);
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('useContacts: Criando contato com dados:', contactData);
      
      // Sempre gerar código único para cada novo contato
      const uniqueCode = await generateUniqueAttendanceCode();
      
      const dataWithCode = {
        ...contactData,
        attendance_code: uniqueCode
      };

      console.log('useContacts: Dados finais com código único:', dataWithCode);

      const { data, error } = await supabase
        .from('contacts')
        .insert([dataWithCode])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar contato:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: `Contato criado com código de presença: ${uniqueCode}`
      });

      // Transform and update state
      const transformedContact: Contact = {
        id: data.id,
        name: data.name,
        whatsapp: data.whatsapp,
        neighborhood: data.neighborhood,
        city_id: data.city_id,
        cell_id: data.cell_id,
        status: data.status,
        encounter_with_god: data.encounter_with_god,
        baptized: data.baptized || false,
        pipeline_stage_id: data.pipeline_stage_id,
        age: data.age,
        birth_date: data.birth_date,
        attendance_code: data.attendance_code,
        referred_by: (data as any).referred_by || null,
        photo_url: data.photo_url || null,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setContacts(prev => [transformedContact, ...prev]);
      return transformedContact;
    } catch (error) {
      console.error('Erro ao criar contato:', error);
      throw error;
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      console.log('useContacts: Atualizando contato com dados:', { id, updates });
      
      // Lógica para atualizar status baseado na célula
      if (updates.cell_id !== undefined) {
        if (updates.cell_id && updates.cell_id !== null) {
          // Se está atribuindo uma célula, mudar para membro
          updates.status = 'member';
          console.log('useContacts: Atribuindo célula, mudando status para member');
        } else if (updates.cell_id === null) {
          // Se está removendo a célula, voltar para pendente
          updates.status = 'pending';
          console.log('useContacts: Removendo célula, mudando status para pending');
        }
      }

      // Gerar código único se não tiver
      if (!updates.attendance_code) {
        const contact = contacts.find(c => c.id === id);
        if (contact && !contact.attendance_code) {
          updates.attendance_code = await generateUniqueAttendanceCode();
          console.log('useContacts: Gerando código único para contato existente:', updates.attendance_code);
        }
      }

      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useContacts: Erro ao atualizar contato:', error);
        throw error;
      }

      console.log('useContacts: Contato atualizado com sucesso:', data);

      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso!"
      });

      // Transform and update state
      const transformedContact: Contact = {
        id: data.id,
        name: data.name,
        whatsapp: data.whatsapp,
        neighborhood: data.neighborhood,
        city_id: data.city_id,
        cell_id: data.cell_id,
        status: data.status,
        encounter_with_god: data.encounter_with_god,
        baptized: data.baptized || false,
        pipeline_stage_id: data.pipeline_stage_id,
        age: data.age,
        birth_date: data.birth_date,
        attendance_code: data.attendance_code,
        referred_by: (data as any).referred_by || null,
        photo_url: data.photo_url || null,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setContacts(prev => prev.map(contact => contact.id === id ? transformedContact : contact));
      return transformedContact;
    } catch (error) {
      console.error('useContacts: Erro ao atualizar contato:', error);
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

      setContacts(prev => prev.filter(contact => contact.id !== id));
    } catch (error) {
      console.error('Erro ao deletar contato:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchContacts();

    // Create a unique channel name to prevent conflicts
    const channelName = `contacts-realtime-changes-${Date.now()}-${Math.random()}`;
    console.log('Creating contacts channel:', channelName);

    // Real-time updates
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
          console.log('Contato alterado em tempo real:', payload);
          
          if (payload.eventType === 'INSERT') {
            const transformedContact: Contact = {
              id: payload.new.id,
              name: payload.new.name,
              whatsapp: payload.new.whatsapp,
              neighborhood: payload.new.neighborhood,
              city_id: payload.new.city_id,
              cell_id: payload.new.cell_id,
              status: payload.new.status,
              encounter_with_god: payload.new.encounter_with_god,
              baptized: payload.new.baptized || false,
              pipeline_stage_id: payload.new.pipeline_stage_id,
              age: payload.new.age,
              birth_date: payload.new.birth_date,
              attendance_code: payload.new.attendance_code,
              referred_by: (payload.new as any).referred_by || null,
              photo_url: payload.new.photo_url || null,
              created_at: payload.new.created_at,
              updated_at: payload.new.updated_at
            };
            setContacts(prev => [transformedContact, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const transformedContact: Contact = {
              id: payload.new.id,
              name: payload.new.name,
              whatsapp: payload.new.whatsapp,
              neighborhood: payload.new.neighborhood,
              city_id: payload.new.city_id,
              cell_id: payload.new.cell_id,
              status: payload.new.status,
              encounter_with_god: payload.new.encounter_with_god,
              baptized: payload.new.baptized || false,
              pipeline_stage_id: payload.new.pipeline_stage_id,
              age: payload.new.age,
              birth_date: payload.new.birth_date,
              attendance_code: payload.new.attendance_code,
              referred_by: (payload.new as any).referred_by || null,
              photo_url: payload.new.photo_url || null,
              created_at: payload.new.created_at,
              updated_at: payload.new.updated_at
            };
            setContacts(prev => prev.map(contact => 
              contact.id === payload.new.id ? transformedContact : contact
            ));
          } else if (payload.eventType === 'DELETE') {
            setContacts(prev => prev.filter(contact => contact.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Contacts channel subscription status:', status);
      });

    return () => {
      console.log('Cleaning up contacts channel...');
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
