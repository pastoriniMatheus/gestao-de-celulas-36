
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PipelineStage {
  id: string;
  name: string;
  position: number;
  messages: PipelineMessage[];
}

interface PipelineMessage {
  id: string;
  content: string;
  delayAmount: number;
  delayUnit: 'minutes' | 'hours' | 'days';
  active: boolean;
}

export const Pipeline = () => {
  const [stages, setStages] = useState<PipelineStage[]>([
    {
      id: '1',
      name: 'Boas-vindas',
      position: 1,
      messages: [
        {
          id: '1',
          content: 'Olá! Seja bem-vindo(a) à nossa igreja. Ficamos felizes com sua presença!',
          delayAmount: 0,
          delayUnit: 'minutes',
          active: true
        }
      ]
    },
    {
      id: '2',
      name: 'Convite',
      position: 2,
      messages: [
        {
          id: '2',
          content: 'Gostaríamos de convidá-lo(a) para participar de uma de nossas células. É uma ótima oportunidade de comunhão!',
          delayAmount: 2,
          delayUnit: 'days',
          active: true
        }
      ]
    },
    {
      id: '3',
      name: 'Follow-up',
      position: 3,
      messages: [
        {
          id: '3',
          content: 'Como tem estado? Estamos aqui para apoiá-lo(a) em sua jornada espiritual.',
          delayAmount: 1,
          delayUnit: 'hours',
          active: true
        }
      ]
    }
  ]);

  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [stageFormData, setStageFormData] = useState({ name: '' });
  const [messageFormData, setMessageFormData] = useState({
    content: '',
    delayAmount: 0,
    delayUnit: 'minutes' as 'minutes' | 'hours' | 'days'
  });

  const handleAddStage = () => {
    const newStage: PipelineStage = {
      id: Date.now().toString(),
      name: stageFormData.name,
      position: stages.length + 1,
      messages: []
    };
    setStages([...stages, newStage]);
    setStageFormData({ name: '' });
    setIsStageDialogOpen(false);
  };

  const handleAddMessage = () => {
    const newMessage: PipelineMessage = {
      id: Date.now().toString(),
      ...messageFormData,
      active: true
    };

    setStages(stages.map(stage => 
      stage.id === selectedStageId 
        ? { ...stage, messages: [...stage.messages, newMessage] }
        : stage
    ));

    setMessageFormData({
      content: '',
      delayAmount: 0,
      delayUnit: 'minutes'
    });
    setIsMessageDialogOpen(false);
  };

  const toggleMessageActive = (stageId: string, messageId: string) => {
    setStages(stages.map(stage => 
      stage.id === stageId 
        ? {
            ...stage,
            messages: stage.messages.map(msg => 
              msg.id === messageId ? { ...msg, active: !msg.active } : msg
            )
          }
        : stage
    ));
  };

  const deleteMessage = (stageId: string, messageId: string) => {
    setStages(stages.map(stage => 
      stage.id === stageId 
        ? {
            ...stage,
            messages: stage.messages.filter(msg => msg.id !== messageId)
          }
        : stage
    ));
  };

  const getDelayText = (amount: number, unit: string) => {
    const unitText = {
      minutes: amount === 1 ? 'minuto' : 'minutos',
      hours: amount === 1 ? 'hora' : 'horas',
      days: amount === 1 ? 'dia' : 'dias'
    };
    return `${amount} ${unitText[unit as keyof typeof unitText]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pipeline de Nutrição</h1>
          <p className="text-gray-600">Gerencie mensagens automáticas por estágio</p>
        </div>
        <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Estágio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Estágio do Pipeline</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="stageName">Nome do Estágio</Label>
                <Input
                  id="stageName"
                  value={stageFormData.name}
                  onChange={(e) => setStageFormData({ name: e.target.value })}
                  placeholder="Ex: Boas-vindas, Convite, Follow-up"
                />
              </div>
              <Button onClick={handleAddStage} className="w-full">
                Criar Estágio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {stages.map((stage, index) => (
          <Card key={stage.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {stage.position}
                  </div>
                  <CardTitle className="text-xl">{stage.name}</CardTitle>
                </div>
                <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedStageId(stage.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Mensagem
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Mensagem - {stage.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="messageContent">Conteúdo da Mensagem</Label>
                        <Textarea
                          id="messageContent"
                          value={messageFormData.content}
                          onChange={(e) => setMessageFormData({ ...messageFormData, content: e.target.value })}
                          placeholder="Digite a mensagem que será enviada..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="delayAmount">Aguardar</Label>
                          <Input
                            id="delayAmount"
                            type="number"
                            min="0"
                            value={messageFormData.delayAmount}
                            onChange={(e) => setMessageFormData({ 
                              ...messageFormData, 
                              delayAmount: parseInt(e.target.value) || 0 
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="delayUnit">Unidade</Label>
                          <Select 
                            value={messageFormData.delayUnit} 
                            onValueChange={(value: 'minutes' | 'hours' | 'days') => 
                              setMessageFormData({ ...messageFormData, delayUnit: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minutes">Minutos</SelectItem>
                              <SelectItem value="hours">Horas</SelectItem>
                              <SelectItem value="days">Dias</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button onClick={handleAddMessage} className="w-full">
                        Adicionar Mensagem
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stage.messages.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-4">
                    Nenhuma mensagem cadastrada neste estágio
                  </p>
                ) : (
                  stage.messages.map((message) => (
                    <div key={message.id} className={`p-4 rounded-lg border ${message.active ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Enviar após: {getDelayText(message.delayAmount, message.delayUnit)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${message.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                              {message.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleMessageActive(stage.id, message.id)}
                          >
                            {message.active ? 'Desativar' : 'Ativar'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMessage(stage.id, message.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            {index < stages.length - 1 && (
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-600 text-white p-2 rounded-full">
                  <ArrowRight size={16} className="rotate-90" />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
