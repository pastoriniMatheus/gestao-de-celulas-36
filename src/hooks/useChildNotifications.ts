
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ChildNotification {
  id: string;
  child_id: string;
  child_name?: string;
  message: string;
  category: string;
  created_at: string;
}

export const useChildNotifications = () => {
  const [notifications, setNotifications] = useState<ChildNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('child_notifications')
        .select(`
          *,
          children!child_id(name, class)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const notificationsWithChildren = data?.map(notification => ({
        ...notification,
        child_name: notification.children?.name || 'Não informado',
        category: notification.children?.class === 'Berçário' || notification.children?.class === 'Jardim' ? 'Kids' : 'Jovens'
      })) || [];

      setNotifications(notificationsWithChildren);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar notificações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addNotification = async (notificationData: { child_id: string; message: string }) => {
    try {
      const { error } = await supabase
        .from('child_notifications')
        .insert([{ 
          ...notificationData,
          category: 'notification'
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Notificação enviada com sucesso!"
      });

      await fetchNotifications();
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar notificação",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    addNotification,
    refetch: fetchNotifications
  };
};
