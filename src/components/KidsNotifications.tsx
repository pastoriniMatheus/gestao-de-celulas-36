
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Users, Calendar, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [newNotifications, setNewNotifications] = useState<Set<string>>(new Set());

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
          event: 'INSERT',
          schema: 'public',
          table: 'child_notifications'
        },
        (payload) => {
          console.log('Nova notificação recebida via realtime:', payload);
          // Marcar como nova notificação
          setNewNotifications(prev => new Set([...prev, payload.new.id]));
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

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    // Remover da lista de novas notificações
    setNewNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(notification.id);
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando notificações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Centro de Avisos</h1>
        <p className="text-gray-600">Notificações e avisos importantes</p>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma notificação ainda</h3>
            <p className="text-gray-500">
              As notificações do sistema aparecerão aqui quando enviadas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notifications.map(notification => (
            <Card 
              key={notification.id} 
              className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 ${
                newNotifications.has(notification.id) 
                  ? 'ring-2 ring-blue-500 animate-pulse bg-blue-50' 
                  : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <Badge 
                    variant="secondary" 
                    className={
                      notification.category === 'Kids' 
                        ? "bg-pink-100 text-pink-700" 
                        : "bg-blue-100 text-blue-700"
                    }
                  >
                    {notification.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(notification.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium text-gray-800">
                    {notification.child_name} - {notification.child_class}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {notification.message}
                  </p>
                </div>

                {newNotifications.has(notification.id) && (
                  <div className="mt-3 flex items-center gap-2 text-blue-600 text-sm font-medium">
                    <Bell className="w-4 h-4" />
                    Nova notificação
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal otimizado para datashow */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-white">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center justify-between text-2xl font-bold">
              <span>Aviso Importante</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNotification(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-6 p-6">
              {/* Cabeçalho com categoria e data */}
              <div className="flex items-center justify-between border-b pb-4">
                <Badge 
                  variant="secondary" 
                  className={`text-lg px-4 py-2 ${
                    selectedNotification.category === 'Kids' 
                      ? "bg-pink-100 text-pink-700" 
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {selectedNotification.category}
                </Badge>
                <div className="text-lg text-gray-600 font-medium">
                  {new Date(selectedNotification.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              {/* Nome da criança e classe - destaque principal */}
              <div className="text-center py-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {selectedNotification.child_name}
                </h2>
                <p className="text-xl text-gray-600 font-medium">
                  {selectedNotification.child_class}
                </p>
              </div>
              
              {/* Mensagem principal */}
              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
                <p className="text-lg leading-relaxed text-gray-800 font-medium">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Rodapé com informações adicionais */}
              <div className="text-center pt-4 border-t">
                <p className="text-gray-500 text-sm">
                  Este aviso foi gerado automaticamente pelo sistema
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
