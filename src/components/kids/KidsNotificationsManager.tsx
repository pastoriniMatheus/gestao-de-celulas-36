
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bell } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function KidsNotificationsManager() {
  const [formData, setFormData] = useState({
    child_id: '',
    message: ''
  });

  const { data: children = [] } = useQuery({
    queryKey: ['children-for-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('id, name, class')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (notificationData: any) => {
      const selectedChild = children.find(child => child.id === notificationData.child_id);
      const category = selectedChild?.class === 'Adolescentes' || selectedChild?.class === 'Pré-Adolescentes' 
        ? 'Jovens' 
        : 'Kids';

      const { data, error } = await supabase
        .from('child_notifications')
        .insert([{
          child_id: notificationData.child_id,
          message: notificationData.message,
          category: category
        }])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Notificação enviada com sucesso!');
      setFormData({ child_id: '', message: '' });
    },
    onError: (error) => {
      toast.error('Erro ao enviar notificação: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.child_id || !formData.message.trim()) {
      toast.error('Selecione uma criança e digite a mensagem');
      return;
    }

    sendNotificationMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-rose-700">Enviar Notificações</h3>
      
      <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-700">
            <Bell className="w-5 h-5" />
            Nova Notificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="child_id">Selecionar Criança</Label>
              <Select 
                value={formData.child_id} 
                onValueChange={(value) => setFormData({ ...formData, child_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Busque e selecione uma criança..." />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name} - {child.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Digite sua mensagem aqui..."
                rows={4}
                className="resize-none"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-rose-600 hover:bg-rose-700"
              disabled={sendNotificationMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {sendNotificationMutation.isPending ? 'Enviando...' : 'Enviar Notificação'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Como funciona</h4>
              <p className="text-sm text-blue-700 mt-1">
                As notificações enviadas aqui aparecerão na página <strong>/notificacoes</strong> do sistema,
                organizadas por categoria (Kids ou Jovens) e exibindo o nome da criança junto com a mensagem.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
