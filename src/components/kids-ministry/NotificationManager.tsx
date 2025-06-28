
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare } from 'lucide-react';
import { useChildren } from '@/hooks/useChildren';
import { useChildNotifications } from '@/hooks/useChildNotifications';

export const NotificationManager = () => {
  const { children } = useChildren();
  const { addNotification } = useChildNotifications();
  const [formData, setFormData] = useState({
    child_id: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.child_id || !formData.message.trim()) {
      return;
    }

    setSending(true);
    try {
      await addNotification(formData);
      setFormData({
        child_id: '',
        message: ''
      });
    } finally {
      setSending(false);
    }
  };

  const selectedChild = children.find(child => child.id === formData.child_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Notificações</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enviar Notificação</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="child">Selecionar Criança *</Label>
              <Select 
                value={formData.child_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, child_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Buscar criança..." />
                </SelectTrigger>
                <SelectContent>
                  {children.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name} ({child.class})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedChild && (
              <Card className="bg-blue-50">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><strong>Nome:</strong> {selectedChild.name}</p>
                    <p><strong>Turma:</strong> {selectedChild.class}</p>
                    <p><strong>Tipo:</strong> {selectedChild.type}</p>
                    <p><strong>Pais:</strong> {selectedChild.parent_name}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <Label htmlFor="message">Mensagem *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Digite sua mensagem..."
                rows={4}
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={sending || !formData.child_id || !formData.message.trim()}
              className="w-full"
            >
              {sending ? 'Enviando...' : 'Enviar Notificação'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-yellow-50">
        <CardContent className="pt-4">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> As notificações enviadas podem ser visualizadas na página 
            <span className="font-mono bg-yellow-200 px-1 rounded"> /notificacoes</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
