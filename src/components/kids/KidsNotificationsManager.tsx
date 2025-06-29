import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bell, Users } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMinistries } from '@/hooks/useMinistries';
export function KidsNotificationsManager() {
  const {
    ministries
  } = useMinistries();
  const [formData, setFormData] = useState({
    child_id: '',
    message: ''
  });

  // Buscar ministérios Kids e Jovens
  const kidsMinistries = ministries.filter(m => m.name.toLowerCase().includes('kids') || m.name.toLowerCase().includes('jovens'));
  const {
    data: children = []
  } = useQuery({
    queryKey: ['children-for-notifications'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('children').select('id, name, class').order('name');
      if (error) throw error;
      return data;
    }
  });
  const {
    data: ministryTeachers = []
  } = useQuery({
    queryKey: ['ministry-teachers'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('ministry_teachers').select(`
          *,
          contact:contacts!ministry_teachers_contact_id_fkey(id, name),
          ministry:ministries!ministry_teachers_ministry_id_fkey(name)
        `).eq('active', true);
      if (error) throw error;
      return data;
    }
  });
  const sendNotificationMutation = useMutation({
    mutationFn: async (notificationData: any) => {
      const selectedChild = children.find(child => child.id === notificationData.child_id);
      const category = selectedChild?.class === 'Adolescentes' || selectedChild?.class === 'Pré-Adolescentes' ? 'Jovens' : 'Kids';
      const {
        data,
        error
      } = await supabase.from('child_notifications').insert([{
        child_id: notificationData.child_id,
        message: notificationData.message,
        category: category
      }]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Notificação enviada com sucesso!');
      setFormData({
        child_id: '',
        message: ''
      });
    },
    onError: error => {
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
  return <div className="space-y-6">
      {/* Seção dos Ministérios Kids e Jovens */}
      {kidsMinistries.length > 0 && <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kidsMinistries.map(ministry => <Card key={ministry.id} className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{ministry.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Membros: {ministry.member_count || 0}
                      </p>
                      
                      {/* Mostrar professoras do ministério */}
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Professoras:</p>
                        {ministryTeachers.filter(teacher => teacher.ministry_id === ministry.id).map(teacher => <div key={teacher.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {teacher.contact.name} ({teacher.teacher_type === 'teacher_1' ? 'Professora 1' : 'Professora 2'})
                            </div>)}
                        {ministryTeachers.filter(teacher => teacher.ministry_id === ministry.id).length === 0 && <p className="text-xs text-gray-500">Nenhuma professora cadastrada</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </CardContent>
        </Card>}

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
              <Select value={formData.child_id} onValueChange={value => setFormData({
              ...formData,
              child_id: value
            })}>
                <SelectTrigger>
                  <SelectValue placeholder="Busque e selecione uma criança..." />
                </SelectTrigger>
                <SelectContent>
                  {children.map(child => <SelectItem key={child.id} value={child.id}>
                      {child.name} - {child.class}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="message">Mensagem</Label>
              <Textarea id="message" value={formData.message} onChange={e => setFormData({
              ...formData,
              message: e.target.value
            })} placeholder="Digite sua mensagem aqui..." rows={4} className="resize-none" />
            </div>
            
            <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={sendNotificationMutation.isPending}>
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
                As notificações enviadas aqui aparecerão na página <a href="/avisos"><strong>/avisos</strong></a> do sistema,
                organizadas por categoria (Kids ou Jovens) e exibindo o nome da criança junto com a mensagem.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
}