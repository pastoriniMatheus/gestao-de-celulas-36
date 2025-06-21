
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Users, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Cell {
  id: string;
  name: string;
  address: string;
  meeting_day: number;
  meeting_time: string;
}

export default function MemberAttendancePage() {
  const { cellId } = useParams();
  const [cell, setCell] = useState<Cell | null>(null);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [memberName, setMemberName] = useState('');

  useEffect(() => {
    if (cellId) {
      fetchCellData();
    }
  }, [cellId]);

  const fetchCellData = async () => {
    try {
      const { data: cellData, error: cellError } = await supabase
        .from('cells')
        .select('id, name, address, meeting_day, meeting_time')
        .eq('id', cellId)
        .single();

      if (cellError) throw cellError;
      setCell(cellData);
    } catch (error: any) {
      console.error('Erro ao buscar dados da célula:', error);
      toast({
        title: "Erro",
        description: "Célula não encontrada",
        variant: "destructive"
      });
    }
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayNumber] || 'Não definido';
  };

  const isCellMeetingDay = () => {
    if (!cell) return false;
    const today = new Date().getDay();
    return today === cell.meeting_day;
  };

  const markAttendance = async () => {
    if (!attendanceCode.trim() || !cellId) {
      toast({
        title: "Erro",
        description: "Digite seu código de presença",
        variant: "destructive"
      });
      return;
    }

    // Verificar se é o dia da célula
    if (!isCellMeetingDay()) {
      toast({
        title: "Erro",
        description: `A presença só pode ser marcada no dia da reunião da célula (${getDayName(cell?.meeting_day || 0)})`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Buscar o contato pelo código de presença
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .select('id, name, cell_id')
        .eq('attendance_code', attendanceCode.trim())
        .eq('cell_id', cellId)
        .single();

      if (contactError || !contactData) {
        toast({
          title: "Erro",
          description: "Código inválido ou você não pertence a esta célula",
          variant: "destructive"
        });
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      // Verificar se já marcou presença hoje
      const { data: existingAttendance } = await supabase
        .from('attendances')
        .select('id, present')
        .eq('contact_id', contactData.id)
        .eq('attendance_date', today)
        .eq('cell_id', cellId)
        .single();

      if (existingAttendance) {
        if (existingAttendance.present) {
          toast({
            title: "Informação",
            description: "Você já marcou presença hoje!",
          });
          setSuccess(true);
          setMemberName(contactData.name);
          return;
        } else {
          // Atualizar presença existente
          const { error: updateError } = await supabase
            .from('attendances')
            .update({ present: true })
            .eq('id', existingAttendance.id);

          if (updateError) throw updateError;
        }
      } else {
        // Criar nova presença
        const { error: insertError } = await supabase
          .from('attendances')
          .insert({
            contact_id: contactData.id,
            cell_id: cellId,
            attendance_date: today,
            present: true,
            visitor: false
          });

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setMemberName(contactData.name);
      setAttendanceCode('');
      
      toast({
        title: "Sucesso",
        description: `Presença marcada com sucesso, ${contactData.name}!`
      });

    } catch (error: any) {
      console.error('Erro ao marcar presença:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar presença. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setMemberName('');
    setAttendanceCode('');
  };

  if (!cell) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Marcar Presença
          </CardTitle>
          <CardDescription className="text-base">
            <div className="flex items-center justify-center gap-2 mt-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-semibold">{cell.name}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{cell.address}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm">
                Reunião: {getDayName(cell.meeting_day)} às {cell.meeting_time}
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Presença Confirmada!
                </h3>
                <p className="text-green-600 mt-2">
                  Olá, <span className="font-semibold">{memberName}</span>!
                  <br />
                  Sua presença foi registrada com sucesso.
                </p>
              </div>
              <Badge variant="default" className="bg-green-500 text-white px-4 py-2">
                ✓ Presente - {new Date().toLocaleDateString('pt-BR')}
              </Badge>
              <Button 
                onClick={resetForm}
                variant="outline"
                className="w-full"
              >
                Marcar Outra Presença
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {!isCellMeetingDay() && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Atenção:</p>
                      <p>A presença só pode ser marcada no dia da reunião da célula ({getDayName(cell.meeting_day)}).</p>
                      <p className="mt-1">Hoje é {getDayName(new Date().getDay())}.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Como marcar presença:</p>
                    <p>Digite seu código único de 6 dígitos que você recebeu quando se cadastrou na célula.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Seu Código de Presença
                </label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={attendanceCode}
                  onChange={(e) => setAttendanceCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg font-mono tracking-wider"
                  maxLength={6}
                />
              </div>

              <Button 
                onClick={markAttendance}
                disabled={loading || attendanceCode.length !== 6 || !isCellMeetingDay()}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Verificando...
                  </div>
                ) : (
                  'Confirmar Presença'
                )}
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Não sabe seu código? Procure o líder da sua célula.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
