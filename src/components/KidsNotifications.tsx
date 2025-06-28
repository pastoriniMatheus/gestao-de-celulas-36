
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Baby, Users, X, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function KidsNotifications() {
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);
  const [recentNotificationId, setRecentNotificationId] = useState<string | null>(null);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['child_notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('child_notifications')
        .select(`
          *,
          child:children(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Detectar nova notificação para fazer piscar
  useEffect(() => {
    if (notifications.length > 0) {
      const mostRecent = notifications[0];
      const now = new Date();
      const notificationTime = new Date(mostRecent.created_at);
      const diffInMinutes = (now.getTime() - notificationTime.getTime()) / (1000 * 60);
      
      // Se a notificação foi criada nos últimos 2 minutos, fazer piscar
      if (diffInMinutes < 2) {
        setRecentNotificationId(mostRecent.id);
        
        // Parar de piscar após 10 segundos
        setTimeout(() => {
          setRecentNotificationId(null);
        }, 10000);
      }
    }
  }, [notifications]);

  // Fechar modal ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpandedNotification(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const kidsNotifications = notifications.filter(n => n.category === 'Kids');
  const jovensNotifications = notifications.filter(n => n.category === 'Jovens');

  const handleNotificationClick = (notificationId: string) => {
    setExpandedNotification(notificationId);
    setRecentNotificationId(null); // Parar de piscar quando clicado
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center py-8">
          <div className="text-gray-500">Carregando notificações...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="space-y-3 sm:space-y-4 px-2 sm:px-4 py-4">
        <div className="text-center mb-4 sm:mb-6 px-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-pink-600 mb-2 flex items-center justify-center gap-2 flex-wrap">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
            <span className="leading-tight">Notificações do Ministério</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">Mensagens e comunicados para crianças e jovens</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-pink-700 text-sm sm:text-base">
                <Baby className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Kids</span>
                <Badge variant="secondary" className="ml-auto bg-pink-100 text-pink-800 text-xs">
                  {kidsNotifications.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6 max-h-96 overflow-y-auto">
              {kidsNotifications.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  Nenhuma notificação para Kids
                </div>
              ) : (
                kidsNotifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`bg-white border-pink-200 cursor-pointer transition-all duration-300 hover:shadow-md ${
                      recentNotificationId === notification.id 
                        ? 'animate-pulse border-pink-400 shadow-lg ring-2 ring-pink-300' 
                        : ''
                    }`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <CardContent className="p-3">
                      <div className="mb-2">
                        <h4 className="font-semibold text-pink-800 text-sm">
                          {notification.child?.name}
                        </h4>
                        <div className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {notification.message}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-purple-200 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700 text-sm sm:text-base">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Jovens</span>
                <Badge variant="secondary" className="ml-auto bg-purple-100 text-purple-800 text-xs">
                  {jovensNotifications.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6 max-h-96 overflow-y-auto">
              {jovensNotifications.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  Nenhuma notificação para Jovens
                </div>
              ) : (
                jovensNotifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`bg-white border-purple-200 cursor-pointer transition-all duration-300 hover:shadow-md ${
                      recentNotificationId === notification.id 
                        ? 'animate-pulse border-purple-400 shadow-lg ring-2 ring-purple-300' 
                        : ''
                    }`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <CardContent className="p-3">
                      <div className="mb-2">
                        <h4 className="font-semibold text-purple-800 text-sm">
                          {notification.child?.name}
                        </h4>
                        <div className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {notification.message}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {notifications.length === 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <Bell className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-gray-700 mb-2">
                Nenhuma notificação encontrada
              </h3>
              <p className="text-gray-500 text-sm">
                As notificações enviadas através do sistema aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de notificação expandida - Versão para Datashow */}
      {expandedNotification && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-white via-pink-50 to-purple-50 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border-4 border-pink-200 relative">
            <button
              onClick={() => setExpandedNotification(null)}
              className="absolute top-6 right-6 p-3 hover:bg-white/50 rounded-full transition-all duration-300 z-10 shadow-lg border border-pink-200"
            >
              <X className="w-8 h-8 text-pink-600" />
            </button>
            
            {(() => {
              const notification = notifications.find(n => n.id === expandedNotification);
              if (!notification) return null;
              
              const isKids = notification.category === 'Kids';
              
              return (
                <div className="p-12 text-center">
                  {/* Header com ícone animado */}
                  <div className="mb-8">
                    <div className="flex justify-center mb-6">
                      <div className={`p-6 rounded-full ${
                        isKids 
                          ? 'bg-gradient-to-br from-pink-100 to-pink-200' 
                          : 'bg-gradient-to-br from-purple-100 to-purple-200'
                      } shadow-lg animate-bounce`}>
                        {isKids ? (
                          <Baby className="w-16 h-16 text-pink-600" />
                        ) : (
                          <Users className="w-16 h-16 text-purple-600" />
                        )}
                      </div>
                    </div>
                    
                    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-xl font-bold mb-4 shadow-lg ${
                      isKids 
                        ? 'bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 border-2 border-pink-400' 
                        : 'bg-gradient-to-r from-purple-200 to-purple-300 text-purple-800 border-2 border-purple-400'
                    }`}>
                      <Heart className="w-6 h-6" />
                      {notification.category}
                    </div>
                  </div>
                  
                  {/* Nome da criança */}
                  <div className="mb-8">
                    <h1 className="text-6xl font-black text-gray-800 mb-4 tracking-wide">
                      {notification.child?.name}
                    </h1>
                    <div className="text-2xl text-gray-600 font-medium">
                      {new Date(notification.created_at).toLocaleString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  {/* Mensagem principal */}
                  <div className={`bg-gradient-to-br ${
                    isKids 
                      ? 'from-pink-50 to-pink-100 border-pink-300' 
                      : 'from-purple-50 to-purple-100 border-purple-300'
                  } rounded-2xl p-12 mb-8 border-4 shadow-inner`}>
                    <p className="text-4xl text-gray-800 leading-relaxed font-medium">
                      {notification.message}
                    </p>
                  </div>
                  
                  {/* Botão de fechar */}
                  <div className="mt-12">
                    <button
                      onClick={() => setExpandedNotification(null)}
                      className="px-12 py-4 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 rounded-2xl transition-all duration-300 text-2xl font-bold shadow-lg border-2 border-gray-400 hover:shadow-xl transform hover:scale-105"
                    >
                      Fechar (ESC)
                    </button>
                  </div>
                  
                  {/* Decoração */}
                  <div className="absolute top-4 left-4 opacity-20">
                    <Bell className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-20">
                    <Heart className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
