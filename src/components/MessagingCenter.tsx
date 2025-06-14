
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Users, User, Clock } from 'lucide-react';

export const MessagingCenter = () => {
  const [messageType, setMessageType] = useState('');
  const [target, setTarget] = useState('');
  const [message, setMessage] = useState('');

  const cells = [
    'Célula Esperança',
    'Célula Fé', 
    'Célula Amor'
  ];

  const contacts = [
    'Maria Silva',
    'João Santos',
    'Ana Costa',
    'Pedro Lima',
    'Sofia Oliveira'
  ];

  const handleSendMessage = () => {
    console.log('Enviando mensagem:', { messageType, target, message });
    // Aqui implementaríamos a lógica de envio
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Central de Mensagens</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MessageSquare size={16} />
          <span>Sistema de Nutrição Ativo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Envio de Mensagens */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send size={20} />
                Enviar Mensagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="messageType">Tipo de Envio</Label>
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de envio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cell">Por Célula</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {messageType === 'cell' && (
                <div>
                  <Label htmlFor="cellSelect">Selecionar Célula</Label>
                  <Select value={target} onValueChange={setTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha uma célula" />
                    </SelectTrigger>
                    <SelectContent>
                      {cells.map((cell) => (
                        <SelectItem key={cell} value={cell}>
                          {cell}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {messageType === 'individual' && (
                <div>
                  <Label htmlFor="contactSelect">Selecionar Contato</Label>
                  <Select value={target} onValueChange={setTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um contato" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact} value={contact}>
                          {contact}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem aqui..."
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSendMessage}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!messageType || !message || (messageType !== 'pending' && !target)}
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensagem
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-500" />
                  <span className="text-sm">Total de Contatos</span>
                </div>
                <span className="font-bold">247</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-yellow-500" />
                  <span className="text-sm">Pendentes</span>
                </div>
                <span className="font-bold">48</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-green-500" />
                  <span className="text-sm">Mensagens Hoje</span>
                </div>
                <span className="font-bold">23</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock size={16} />
                Pipeline de Nutrição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-sm">Estágio 1: Boas-vindas</p>
                  <p className="text-xs text-gray-600">Envio imediato</p>
                  <p className="text-xs text-blue-600">12 contatos ativos</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="font-medium text-sm">Estágio 2: Convite</p>
                  <p className="text-xs text-gray-600">Após 2 dias</p>
                  <p className="text-xs text-yellow-600">8 contatos ativos</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-sm">Estágio 3: Follow-up</p>
                  <p className="text-xs text-gray-600">Após 1 semana</p>
                  <p className="text-xs text-green-600">5 contatos ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
