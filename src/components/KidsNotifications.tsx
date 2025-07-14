
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Users, X, Sparkles, Heart, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [newNotifications, setNewNotifications] = useState<Set<string>>(new Set());
  const [blinkingNotifications, setBlinkingNotifications] = useState<Set<string>>(new Set());

  const {
    data: notifications = [],
    isLoading
  } = useQuery({
    queryKey: ['child-notifications'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('child_notifications').select(`
          id,
          message,
          category,
          created_at,
          children!child_notifications_child_id_fkey(name, class)
        `).order('created_at', {
        ascending: false
      });
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

  const clearNotificationsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('child_notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-notifications'] });
      toast({
        title: "Avisos limpos",
        description: "Todos os avisos foram removidos com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao limpar avisos",
        description: "Ocorreu um erro ao tentar limpar os avisos.",
        variant: "destructive",
      });
      console.error('Erro ao limpar avisos:', error);
    }
  });

  useEffect(() => {
    console.log('Configurando canal de notificações em tempo real...');
    const channel = supabase.channel('notifications_realtime').on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'child_notifications'
    }, payload => {
      console.log('Nova notificação recebida via realtime:', payload);
      const notificationId = payload.new.id;

      // Adicionar à lista de novas notificações
      setNewNotifications(prev => new Set([...prev, notificationId]));

      // Adicionar à lista de notificações piscando
      setBlinkingNotifications(prev => new Set([...prev, notificationId]));

      // Remover de novas após 30 segundos
      setTimeout(() => {
        setNewNotifications(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
      }, 30000);

      // Remover piscar após 30 segundos
      setTimeout(() => {
        setBlinkingNotifications(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
      }, 30000);
      queryClient.invalidateQueries({
        queryKey: ['child-notifications']
      });
    }).subscribe(status => {
      console.log('Status da inscrição do canal:', status);
    });
    return () => {
      console.log('Removendo canal de notificações...');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);

    // Parar de piscar quando clicado
    setBlinkingNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(notification.id);
      return newSet;
    });
    setNewNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(notification.id);
      return newSet;
    });
  };

  const isNotificationBlinking = (notificationId: string) => {
    return blinkingNotifications.has(notificationId);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <span className="text-2xl font-semibold text-gray-700">Carregando avisos...</span>
        </div>
      </div>;
  }

  return <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bell className="w-10 h-10 text-blue-600 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Centro de Avisos
            </h1>
            <Bell className="w-10 h-10 text-pink-600 animate-pulse" />
          </div>
          <p className="text-xl text-gray-700 font-medium">Informações importantes para toda comunidade</p>
          
          {notifications.length > 0 && (
            <div className="mt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Limpar Todos os Avisos
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar limpeza</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá remover todos os avisos permanentemente. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => clearNotificationsMutation.mutate()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Limpar Avisos
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {notifications.length === 0 ? <Card className="max-w-2xl mx-auto shadow-xl border-2 border-blue-200">
            <CardContent className="text-center py-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Bell className="w-20 h-20 text-gray-300" />
                <Heart className="w-14 h-14 text-pink-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-3">Nenhum aviso no momento</h3>
              <p className="text-lg text-gray-500">
                Quando houver informações importantes, elas aparecerão aqui.
              </p>
            </CardContent>
          </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notifications.map(notification => <Card key={notification.id} className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl transform border-2 ${isNotificationBlinking(notification.id) ? 'ring-4 ring-yellow-400 animate-[pulse_1s_ease-in-out_infinite] bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 shadow-2xl border-orange-400 scale-105' : 'bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 shadow-lg border-blue-200'}`} onClick={() => handleNotificationClick(notification)} style={{
          animation: isNotificationBlinking(notification.id) ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : undefined
        }}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className={`text-sm px-3 py-1 font-bold ${notification.category === 'Kids' ? "bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 border border-pink-400" : "bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800 border border-blue-400"}`}>
                      {notification.category}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-center py-3 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-lg border border-gray-200">
                      <div className="font-bold text-lg text-gray-800 mb-1">
                        {notification.child_name}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        {notification.child_class}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 font-medium">
                      {notification.message}
                    </p>
                  </div>

                  {isNotificationBlinking(notification.id) && <div className="mt-4 flex items-center justify-center gap-2 text-orange-800 font-bold text-sm bg-gradient-to-r from-yellow-200 to-orange-200 rounded-lg py-2 border-2 border-orange-400">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      NOVO AVISO
                      <Sparkles className="w-4 h-4 animate-spin" />
                    </div>}
                </CardContent>
              </Card>)}
          </div>}

        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-white via-blue-50 to-purple-50 border-4 border-blue-400 shadow-2xl rounded-2xl overflow-hidden">
            <DialogHeader className="pb-6 border-b-2 border-blue-300 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 -m-6 mb-6 p-8">
              <DialogTitle className="flex items-center justify-center text-2xl font-bold text-white">
                <div className="flex items-center gap-3">
                  <Bell className="w-8 h-8 text-yellow-300 animate-pulse" />
                  <span className="text-3xl drop-shadow-lg">
                    Aviso Importante
                  </span>
                  <Bell className="w-8 h-8 text-yellow-300 animate-pulse" />
                </div>
              </DialogTitle>
            </DialogHeader>
            
            {selectedNotification && <div className="space-y-6 p-2">
                <div className="text-center py-6 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-2xl border-2 border-purple-300 shadow-lg">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Users className="w-8 h-8 text-blue-700" />
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
                      {selectedNotification.child_name}
                    </h2>
                    <Users className="w-8 h-8 text-pink-700" />
                  </div>
                  <p className="text-2xl text-gray-800 font-bold bg-white rounded-xl py-3 px-6 inline-block border-2 border-purple-400 shadow-md">
                    {selectedNotification.child_class}
                  </p>
                </div>

                <div className="flex justify-center mb-6">
                  <Badge variant="secondary" className={`text-lg px-6 py-3 font-bold rounded-xl shadow-lg ${selectedNotification.category === 'Kids' ? "bg-gradient-to-r from-pink-300 to-pink-400 text-pink-900 border-2 border-pink-500" : "bg-gradient-to-r from-blue-300 to-blue-400 text-blue-900 border-2 border-blue-500"}`}>
                    {selectedNotification.category}
                  </Badge>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-yellow-100 p-8 rounded-2xl border-l-8 border-orange-500 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Bell className="w-8 h-8 text-orange-600 flex-shrink-0 mt-2 animate-bounce" />
                    <p className="text-2xl leading-relaxed text-gray-900 font-semibold text-center">
                      {selectedNotification.message}
                    </p>
                  </div>
                </div>

                <div className="text-center pt-4 border-t-2 border-gray-300">
                  <div className="bg-gradient-to-r from-gray-100 via-white to-gray-100 rounded-xl py-3 px-6 inline-block border-2 border-gray-300 shadow-md">
                    <p className="text-lg text-gray-700 font-semibold">
                      ✨ Sistema de Avisos Kids & Jovens ✨
                    </p>
                  </div>
                </div>
              </div>}
          </DialogContent>
        </Dialog>
      </div>
    </div>;
}
