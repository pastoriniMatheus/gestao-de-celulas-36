
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Users, Calendar } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  message: string;
  category: string;
  created_at: string;
  child_name: string;
  child_class: string;
}

export function KidsNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['child-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('child_notifications')
        .select(`
          id,
          message,
          category,
          created_at,
          children!child_notifications_child_id_fkey(name, class)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        message: item.message,
        category: item.category,
        created_at: item.created_at,
        child_name: item.children?.name || 'Criança não encontrada',
        child_class: item.children?.class || 'Classe não definida'
      }));
    }
  });

  // Configurar atualização em tempo real
  useEffect(() => {
    console.log('Configurando canal de notificações em tempo real...');
    
    const channel = supabase
      .channel('notifications_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'child_notifications'
        },
        (payload) => {
          console.log('Nova notificação recebida via realtime:', payload);
          // Atualizar as notificações automaticamente
          queryClient.invalidateQueries({ queryKey: ['child-notifications'] });
        }
      )
      .subscribe((status) => {
        console.log('Status da inscrição do canal:', status);
      });

    return () => {
      console.log('Removendo canal de notificações...');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando notificações...</span>
      </div>
    );
  }

  const kidsNotifications = notifications.filter(n => n.category === 'Kids');
  const jovensNotifications = notifications.filter(n => n.category === 'Jovens');

  return (
    <div className="space-y-6 p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Avisos dos Ministérios</h1>
        <p className="text-gray-600">Acompanhe as notificações dos ministérios Kids e Jovens</p>
      </div>

      {/* Notificações Kids */}
      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-700">
            <Users className="w-5 h-5" />
            Ministério Kids ({kidsNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {kidsNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-pink-300 mx-auto mb-4" />
              <p className="text-pink-600">Nenhuma notificação do ministério Kids ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {kidsNotifications.map(notification => (
                <Card key={notification.id} className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                        {notification.child_name} - {notification.child_class}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(notification.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <p className="text-gray-700">{notification.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notificações Jovens */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Users className="w-5 h-5" />
            Ministério Jovens ({jovensNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jovensNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-blue-300 mx-auto mb-4" />
              <p className="text-blue-600">Nenhuma notificação do ministério Jovens ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jovensNotifications.map(notification => (
                <Card key={notification.id} className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {notification.child_name} - {notification.child_class}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(notification.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <p className="text-gray-700">{notification.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {notifications.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma notificação ainda</h3>
            <p className="text-gray-500">
              As notificações dos ministérios Kids e Jovens aparecerão aqui quando enviadas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
