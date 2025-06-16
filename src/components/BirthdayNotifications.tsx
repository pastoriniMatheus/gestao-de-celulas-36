
import { useState } from 'react';
import { Bell, Gift, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBirthdayNotifications } from '@/hooks/useBirthdayNotifications';
import { toast } from '@/hooks/use-toast';

export const BirthdayNotifications = () => {
  const { todayBirthdays, loading, markNotificationSent } = useBirthdayNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleSendMessage = async (contactId: string, name: string, whatsapp: string | null) => {
    if (!whatsapp) {
      toast({
        title: "WhatsApp não cadastrado",
        description: `${name} não possui WhatsApp cadastrado`,
        variant: "destructive"
      });
      return;
    }

    // Abrir WhatsApp com mensagem de aniversário
    const message = `🎉 Feliz Aniversário, ${name}! 🎂\n\nQue Deus abençoe sua vida com muita saúde, paz e alegria. Desejamos um ano repleto de conquistas e vitórias!\n\nCom carinho,\nEquipe de Células`;
    const whatsappUrl = `https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    await markNotificationSent(contactId);
    
    toast({
      title: "Mensagem enviada",
      description: `Mensagem de aniversário enviada para ${name}`
    });
  };

  if (loading) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {todayBirthdays.length > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
            {todayBirthdays.length}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-orange-500" />
                Aniversariantes Hoje
              </CardTitle>
              <CardDescription>
                {todayBirthdays.length === 0 
                  ? "Nenhum aniversariante hoje" 
                  : `${todayBirthdays.length} pessoa(s) fazendo aniversário`
                }
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayBirthdays.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                🎉 Nenhum aniversariante hoje
              </p>
            ) : (
              todayBirthdays.map((contact) => (
                <div key={contact.contact_id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium">{contact.contact_name}</p>
                    <p className="text-sm text-gray-600">
                      {contact.age ? `${contact.age} anos` : 'Idade não informada'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSendMessage(contact.contact_id, contact.contact_name, contact.whatsapp)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
