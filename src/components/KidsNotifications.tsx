
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Users, Calendar, X, Sparkles, Heart } from 'lucide-react';
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
          // Marcar como nova notificação por 15 segundos
          setNewNotifications(prev => new Set([...prev, payload.new.id]));
          
          // Remover o piscar após 15 segundos
          setTimeout(() => {
            setNewNotifications(prev => {
              const newSet = new Set(prev);
              newSet.delete(payload.new.id);
              return newSet;
            });
          }, 15000);
          
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

  const isNotificationBlinking = (notificationId: string) => {
    return newNotifications.has(notificationId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <span className="text-2xl font-semibold text-gray-700">Carregando avisos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Bell className="w-12 h-12 text-blue-600 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Centro de Avisos
            </h1>
            <Bell className="w-12 h-12 text-pink-600 animate-pulse" />
          </div>
          <p className="text-xl text-gray-700 font-medium">Informações importantes para toda comunidade</p>
        </div>

        {notifications.length === 0 ? (
          <Card className="max-w-2xl mx-auto shadow-xl border-2 border-blue-200">
            <CardContent className="text-center py-16">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Bell className="w-24 h-24 text-gray-300" />
                <Heart className="w-16 h-16 text-pink-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-600 mb-4">Nenhum aviso no momento</h3>
              <p className="text-lg text-gray-500">
                Quando houver informações importantes, elas aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notifications.map(notification => (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl transform border-2 ${
                  isNotificationBlinking(notification.id)
                    ? 'ring-4 ring-yellow-400 animate-[pulse_0.8s_ease-in-out_infinite] bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 shadow-2xl border-orange-400 scale-110' 
                    : 'bg-gradient-to-br from-white via-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 shadow-lg border-blue-200'
                }`}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  animation: isNotificationBlinking(notification.id) 
                    ? 'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite, bounce 1.5s infinite' 
                    : undefined
                }}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge 
                      variant="secondary" 
                      className={`text-sm px-3 py-1 font-bold ${
                        notification.category === 'Kids' 
                          ? "bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 border-2 border-pink-400" 
                          : "bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800 border-2 border-blue-400"
                      }`}
                    >
                      {notification.category}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
                      <Calendar className="w-4 h-4" />
                      {new Date(notification.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-center py-3 bg-gradient-to-r from-gray-100 via-white to-gray-100 rounded-lg border-2 border-gray-200 shadow-inner">
                      <div className="font-bold text-lg text-gray-800 mb-1">
                        {notification.child_name}
                      </div>
                      <div className="text-sm text-gray-600 font-semibold">
                        {notification.child_class}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 font-medium">
                      {notification.message}
                    </p>
                  </div>

                  {isNotificationBlinking(notification.id) && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-orange-700 font-bold text-sm bg-gradient-to-r from-yellow-200 to-orange-200 rounded-lg py-2 border-2 border-orange-400">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      NOVO AVISO
                      <Sparkles className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal otimizado para datashow */}
        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] bg-gradient-to-br from-white via-blue-50 to-purple-50 border-4 border-blue-300 shadow-2xl rounded-2xl">
            <DialogHeader className="pb-4 border-b-2 border-blue-300 bg-gradient-to-r from-blue-100 to-purple-100 rounded-t-xl -m-6 mb-4 p-4">
              <DialogTitle className="flex items-center justify-between text-2xl font-bold text-blue-800">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-blue-600" />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Aviso Importante
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-red-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            {selectedNotification && (
              <div className="space-y-4 p-2">
                {/* Cabeçalho com categoria e data */}
                <div className="flex items-center justify-between bg-gradient-to-r from-white via-blue-50 to-white rounded-xl p-3 border-2 border-blue-300 shadow-lg">
                  <Badge 
                    variant="secondary" 
                    className={`text-lg px-4 py-1 font-bold rounded-lg shadow-lg ${
                      selectedNotification.category === 'Kids' 
                        ? "bg-gradient-to-r from-pink-300 to-pink-400 text-pink-900 border-2 border-pink-500" 
                        : "bg-gradient-to-r from-blue-300 to-blue-400 text-blue-900 border-2 border-blue-500"
                    }`}
                  >
                    {selectedNotification.category}
                  </Badge>
                  <div className="text-lg text-gray-700 font-bold flex items-center gap-2 bg-white rounded-lg px-3 py-1 shadow-md border border-gray-200">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    {new Date(selectedNotification.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                
                {/* Nome da criança e classe */}
                <div className="text-center py-6 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-2xl border-3 border-purple-400 shadow-xl">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Users className="w-8 h-8 text-blue-700" />
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
                      {selectedNotification.child_name}
                    </h2>
                    <Users className="w-8 h-8 text-pink-700" />
                  </div>
                  <p className="text-xl text-gray-800 font-bold bg-white rounded-xl py-2 px-3 inline-block border-2 border-purple-300 shadow-lg">
                    {selectedNotification.child_class}
                  </p>
                </div>
                
                {/* Mensagem principal */}
                <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-yellow-100 p-4 rounded-2xl border-l-4 border-orange-500 shadow-xl">
                  <div className="flex items-start gap-3">
                    <Bell className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <p className="text-lg leading-relaxed text-gray-800 font-semibold">
                      {selectedNotification.message}
                    </p>
                  </div>
                </div>

                {/* Rodapé */}
                <div className="text-center pt-3 border-t-2 border-gray-300">
                  <div className="bg-gradient-to-r from-gray-100 via-white to-gray-100 rounded-xl py-2 px-3 inline-block shadow-md border border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">
                      ✨ Aviso gerado automaticamente pelo sistema ✨
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
