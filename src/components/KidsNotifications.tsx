
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Baby, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function KidsNotifications() {
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

  // Agrupar notificações por categoria
  const kidsNotifications = notifications.filter(n => n.category === 'Kids');
  const jovensNotifications = notifications.filter(n => n.category === 'Jovens');

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Carregando notificações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-pink-600 mb-2 flex items-center justify-center gap-3">
          <Bell className="w-10 h-10" />
          Notificações do Ministério
        </h1>
        <p className="text-gray-600">Mensagens e comunicados para crianças e jovens</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seção Kids */}
        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-700">
              <Baby className="w-6 h-6" />
              Kids
              <Badge variant="secondary" className="ml-auto bg-pink-100 text-pink-800">
                {kidsNotifications.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {kidsNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma notificação para Kids
              </div>
            ) : (
              kidsNotifications.map((notification) => (
                <Card key={notification.id} className="bg-white border-pink-200">
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <h4 className="font-semibold text-pink-800">
                        {notification.child?.name}
                      </h4>
                      <div className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {notification.message}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Seção Jovens */}
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Users className="w-6 h-6" />
              Jovens
              <Badge variant="secondary" className="ml-auto bg-purple-100 text-purple-800">
                {jovensNotifications.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {jovensNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma notificação para Jovens
              </div>
            ) : (
              jovensNotifications.map((notification) => (
                <Card key={notification.id} className="bg-white border-purple-200">
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <h4 className="font-semibold text-purple-800">
                        {notification.child?.name}
                      </h4>
                      <div className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
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
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Nenhuma notificação encontrada
            </h3>
            <p className="text-gray-500">
              As notificações enviadas através do sistema aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
