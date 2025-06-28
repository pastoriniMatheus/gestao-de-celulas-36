
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Baby } from 'lucide-react';
import { useChildNotifications } from '@/hooks/useChildNotifications';
import { format } from 'date-fns';

export const NotificationsPage = () => {
  const { notifications, loading } = useChildNotifications();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando notificações...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
        </div>
        <p className="text-gray-600">
          Acompanhe todas as notificações do Ministério Kids & Jovens
        </p>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Baby className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma notificação ainda
              </h3>
              <p className="text-gray-600">
                As notificações enviadas pelo sistema aparecerão aqui
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={notification.category === 'Kids' ? 'default' : 'secondary'}
                      className="font-semibold"
                    >
                      {notification.category}
                    </Badge>
                    <CardTitle className="text-lg">
                      {notification.child_name}
                    </CardTitle>
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(new Date(notification.created_at), 'dd/MM/yyyy - HH:mm')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 leading-relaxed">
                    {notification.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
