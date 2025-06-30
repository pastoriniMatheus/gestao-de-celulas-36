
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Users, Calendar, X, Sparkles } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <span className="text-lg">Carregando notificações...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <Bell className="w-10 h-10 text-blue-600" />
            Centro de Avisos
            <Bell className="w-10 h-10 text-blue-600" />
          </h1>
          <p className="text-xl text-gray-600">Notificações e avisos importantes</p>
        </div>

        {notifications.length === 0 ? (
          <Card className="max-w-2xl mx-auto shadow-xl">
            <CardContent className="text-center py-16">
              <Bell className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-medium text-gray-600 mb-4">Nenhuma notificação ainda</h3>
              <p className="text-lg text-gray-500">
                As notificações do sistema aparecerão aqui quando enviadas.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notifications.map(notification => (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl transform ${
                  newNotifications.has(notification.id) 
                    ? 'ring-4 ring-blue-500 animate-pulse bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl' 
                    : 'bg-white hover:bg-gray-50 shadow-lg'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge 
                      variant="secondary" 
                      className={`text-sm px-3 py-1 ${
                        notification.category === 'Kids' 
                          ? "bg-pink-100 text-pink-700 border-pink-200" 
                          : "bg-blue-100 text-blue-700 border-blue-200"
                      }`}
                    >
                      {notification.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(notification.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-center py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                      <div className="font-bold text-lg text-gray-800">
                        {notification.child_name}
                      </div>
                      <div className="text-md text-gray-600 font-medium">
                        {notification.child_class}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                      {notification.message}
                    </p>
                  </div>

                  {newNotifications.has(notification.id) && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 rounded-lg py-2">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      NOVA NOTIFICAÇÃO
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal otimizado para datashow */}
        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] bg-gradient-to-br from-white to-blue-50 border-4 border-blue-200 shadow-2xl">
            <DialogHeader className="pb-8 border-b-2 border-blue-200">
              <DialogTitle className="flex items-center justify-between text-3xl font-bold text-blue-800">
                <div className="flex items-center gap-4">
                  <Bell className="w-8 h-8 text-blue-600" />
                  <span>Aviso Importante</span>
                  <Bell className="w-8 h-8 text-blue-600" />
                </div>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-red-50"
                >
                  <X className="w-8 h-8" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            {selectedNotification && (
              <div className="space-y-8 p-8">
                {/* Cabeçalho com categoria e data */}
                <div className="flex items-center justify-between bg-white rounded-xl p-6 border-2 border-blue-200 shadow-lg">
                  <Badge 
                    variant="secondary" 
                    className={`text-2xl px-6 py-3 font-bold ${
                      selectedNotification.category === 'Kids' 
                        ? "bg-pink-200 text-pink-800 border-2 border-pink-300" 
                        : "bg-blue-200 text-blue-800 border-2 border-blue-300"
                    }`}
                  >
                    {selectedNotification.category}
                  </Badge>
                  <div className="text-2xl text-gray-700 font-bold flex items-center gap-2">
                    <Calendar className="w-8 h-8 text-blue-600" />
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
                <div className="text-center py-12 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-2xl border-4 border-blue-300 shadow-xl">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Users className="w-12 h-12 text-blue-600" />
                    <h2 className="text-6xl font-bold text-gray-800">
                      {selectedNotification.child_name}
                    </h2>
                    <Users className="w-12 h-12 text-blue-600" />
                  </div>
                  <p className="text-3xl text-gray-700 font-bold bg-white rounded-lg py-3 px-6 inline-block border-2 border-blue-200">
                    {selectedNotification.child_class}
                  </p>
                </div>
                
                {/* Mensagem principal */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-2xl border-l-8 border-orange-400 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Bell className="w-8 h-8 text-orange-500 flex-shrink-0 mt-2" />
                    <p className="text-2xl leading-relaxed text-gray-800 font-medium">
                      {selectedNotification.message}
                    </p>
                  </div>
                </div>

                {/* Rodapé com informações adicionais */}
                <div className="text-center pt-6 border-t-2 border-gray-200">
                  <p className="text-lg text-gray-500 bg-gray-50 rounded-lg py-3 px-6 inline-block">
                    Este aviso foi gerado automaticamente pelo sistema
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
