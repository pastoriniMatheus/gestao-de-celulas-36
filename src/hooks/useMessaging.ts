
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface Contact {
  id: string;
  name: string;
  whatsapp: string | null;
  status: string;
  encounter_with_god: boolean;
  cell_id: string | null;
  pipeline_stage_id: string | null;
  neighborhood: string;
}

interface Cell {
  id: string;
  name: string;
}

interface PipelineStage {
  id: string;
  name: string;
}

interface MessageFilter {
  encounterWithGod?: boolean;
  cellId?: string;
  pipelineStageId?: string;
  status?: string;
  searchName?: string;
}

export const useMessaging = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile, isLeader, isAdmin } = useUserPermissions();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let contactsQuery = supabase.from('contacts').select('*').order('name');
      let cellsQuery = supabase.from('cells').select('id, name').eq('active', true).order('name');
      
      // Se for líder, filtrar apenas suas células e contatos
      if (isLeader && !isAdmin && userProfile?.id) {
        cellsQuery = cellsQuery.eq('leader_id', userProfile.id);
        
        // Primeiro buscar as células do líder
        const { data: leaderCells } = await cellsQuery;
        const cellIds = leaderCells?.map(cell => cell.id) || [];
        
        if (cellIds.length > 0) {
          contactsQuery = contactsQuery.in('cell_id', cellIds);
        } else {
          // Se não tem células, não tem contatos
          setContacts([]);
          setCells([]);
          setPipelineStages([]);
          setFilteredContacts([]);
          return;
        }
      }

      const [contactsData, cellsData, stagesData] = await Promise.all([
        contactsQuery,
        cellsQuery,
        supabase.from('pipeline_stages').select('id, name').eq('active', true).order('position')
      ]);

      if (contactsData.error) throw contactsData.error;
      if (cellsData.error) throw cellsData.error;
      if (stagesData.error) throw stagesData.error;

      setContacts(contactsData.data || []);
      setCells(cellsData.data || []);
      setPipelineStages(stagesData.data || []);
      setFilteredContacts(contactsData.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados para mensageria",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (filters: MessageFilter) => {
    let filtered = contacts;

    if (filters.encounterWithGod !== undefined) {
      filtered = filtered.filter(c => c.encounter_with_god === filters.encounterWithGod);
    }

    if (filters.cellId) {
      filtered = filtered.filter(c => c.cell_id === filters.cellId);
    }

    if (filters.pipelineStageId) {
      filtered = filtered.filter(c => c.pipeline_stage_id === filters.pipelineStageId);
    }

    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.searchName) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(filters.searchName!.toLowerCase())
      );
    }

    setFilteredContacts(filtered);
  };

  const sendMessage = async (contactIds: string[], message: string) => {
    try {
      // Buscar webhook de mensagens ativo
      const { data: webhookData, error: webhookError } = await supabase
        .from('webhook_configs')
        .select('webhook_url')
        .eq('event_type', 'messaging')
        .eq('active', true)
        .single();

      if (webhookError || !webhookData) {
        toast({
          title: "Erro",
          description: "Webhook de mensagens não configurado. Configure na seção de webhooks.",
          variant: "destructive"
        });
        return false;
      }

      const contactsToMessage = contacts.filter(c => contactIds.includes(c.id));
      
      // Preparar dados para envio via webhook
      const messageData = contactsToMessage
        .filter(contact => contact.whatsapp) // Apenas contatos com WhatsApp
        .map(contact => ({
          id: contact.id,
          name: contact.name,
          whatsapp: contact.whatsapp,
          message: message
        }));

      if (messageData.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum contato selecionado possui WhatsApp válido.",
          variant: "destructive"
        });
        return false;
      }

      // Enviar para webhook
      const response = await fetch(webhookData.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'messaging',
          contacts: messageData,
          timestamp: new Date().toISOString()
        })
      });

      // Salvar mensagens enviadas no banco
      const messagesToSave = contactsToMessage.map(contact => ({
        contact_id: contact.id,
        message_content: message,
        phone_number: contact.whatsapp,
        status: contact.whatsapp ? 'sent' : 'failed'
      }));

      const { error: saveError } = await supabase
        .from('sent_messages')
        .insert(messagesToSave);

      if (saveError) {
        console.error('Erro ao salvar mensagens:', saveError);
      }

      if (response.ok) {
        toast({
          title: "Mensagens enviadas",
          description: `${messageData.length} mensagens enviadas via webhook`
        });
        return true;
      } else {
        throw new Error(`Webhook retornou status ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagens via webhook",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (userProfile) {
      fetchData();
    }
  }, [userProfile, isLeader, isAdmin]);

  return {
    contacts: filteredContacts,
    cells,
    pipelineStages,
    selectedContacts,
    loading,
    setSelectedContacts,
    applyFilters,
    sendMessage,
    refreshData: fetchData
  };
};
