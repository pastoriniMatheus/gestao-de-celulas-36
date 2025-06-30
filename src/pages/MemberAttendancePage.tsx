
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Users, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Cell {
  id: string;
  name: string;
  address: string;
}

export default function MemberAttendancePage() {
  const { cellId } = useParams();
  const [cell, setCell] = useState<Cell | null>(null);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (cellId) {
      fetchCellData();
    }
  }, [cellId]);

  const fetchCellData = async () => {
    try {
      const { data: cellData, error: cellError } = await supabase
        .from('cells')
        .select('id, name, address')
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

  const markAttendance = async () => {
    if (!attendanceCode.trim()) {
      toast({
        title: "Erro",
        description: "Digite seu código de presença",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Buscar contato pelo código
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select('id, name, cell_id')
        .eq('attendance_code', attendanceCode.toUpperCase())
        .single();

      if (contactError || !contact) {
        toast({
          title: "Erro",
          description: "Código de presença não encontrado",
          variant: "destructive"
        });
        return;
      }

      // Verificar se o contato pertence à célula
      if (contact.cell_id !== cellId) {
        toast({
          title: "Erro",
          description: "Este código não pertence a esta célula",
          variant: "destructive"
        });
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      // Verificar se já foi marcada presença hoje
      const { data: existingAttendance } = await supabase
        .from('attendances')
        .select('id')
        .eq('contact_id', contact.id)
        .eq('cell_id', cellId)
        .eq('attendance_date', today)
        .maybeSingle();

      if (existingAttendance) {
        toast({
          title: "Informação",
          description: "Presença já foi registrada hoje!",
        });
        setSuccess(true);
        return;
      }

      // Marcar presença
      const { error: attendanceError } = await supabase
        .from('attendances')
        .insert({
          contact_id: contact.id,
          cell_id: cellId,
          attendance_date: today,
          present: true,
          visitor: false
        });

      if (attendanceError) throw attendanceError;

      toast({
        title: "Sucesso",
        description: `Presença registrada para ${contact.name}!`,
      });

      setSuccess(true);
      setAttendanceCode('');
    } catch (error: any) {
      console.error('Erro ao marcar presença:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar presença",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      markAttendance();
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <Card className="shadow-xl">
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
              <Badge variant="outline" className="mt-2">
                {new Date().toLocaleDateString('pt-BR')}
              </Badge>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-700 mb-2">
                  Presença Registrada!
                </h3>
                <p className="text-gray-600 mb-4">
                  Sua presença foi registrada com sucesso.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSuccess(false)}
                  className="mt-4"
                >
                  Registrar Outra Presença
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-center">
                      Digite seu código de presença
                    </label>
                    <Input
                      value={attendanceCode}
                      onChange={(e) => setAttendanceCode(e.target.value.toUpperCase())}
                      onKeyPress={handleKeyPress}
                      placeholder="Ex: AB1234C"
                      className="text-center text-lg font-mono"
                      maxLength={10}
                    />
                  </div>
                  
                  <Button 
                    onClick={markAttendance} 
                    disabled={loading || !attendanceCode.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    size="lg"
                  >
                    {loading ? 'Registrando...' : 'Marcar Presença'}
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-500 border-t pt-4">
                  <p>Digite o código que aparece no seu cadastro</p>
                  <p className="mt-1">ou solicite ao líder da célula</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
