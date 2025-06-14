import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, Users, UserCheck, UserPlus, BarChart3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CellDetailsProps {
  cellId: string;
  cellName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Contact {
  id: string;
  name: string;
  whatsapp?: string;
  neighborhood: string;
}

interface Attendance {
  id: string;
  contact_id: string;
  attendance_date: string;
  present: boolean;
  visitor: boolean;
}

export const CellDetails = ({ cellId, cellName, isOpen, onOpenChange }: CellDetailsProps) => {
  const [cell, setCell] = useState<any>(null);
  const [members, setMembers] = useState<Contact[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newVisitorName, setNewVisitorName] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const channelsRef = useRef<any[]>([]);

  const fetchCellData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados da célula
      const { data: cellData, error: cellError } = await supabase
        .from('cells')
        .select('*')
        .eq('id', cellId)
        .single();

      if (cellError) {
        console.error('Erro ao buscar célula:', cellError);
        return;
      }

      setCell(cellData);

      // Buscar membros da célula
      const { data: membersData, error: membersError } = await supabase
        .from('contacts')
        .select('id, name, whatsapp, neighborhood')
        .eq('cell_id', cellId);

      if (membersError) {
        console.error('Erro ao buscar membros:', membersError);
        return;
      }

      setMembers(membersData || []);

      // Buscar presenças da célula - including visitor column
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendances')
        .select('id, contact_id, attendance_date, present, visitor')
        .eq('cell_id', cellId);

      if (attendanceError) {
        console.error('Erro ao buscar presenças:', attendanceError);
        return;
      }

      setAttendances(attendanceData || []);
      setFilteredAttendances(attendanceData || []);
    } catch (error) {
      console.error('Erro ao buscar dados da célula:', error);
    } finally {
      setLoading(false);
    }
  };

  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCellData();

      // Clean up existing channels before creating new ones
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];

      // Create unique channel names to avoid conflicts
      const attendanceChannelName = `attendance-changes-${cellId}-${Date.now()}`;
      const contactChannelName = `contact-changes-${cellId}-${Date.now()}`;

      // Configurar atualização em tempo real
      const attendanceChannel = supabase
        .channel(attendanceChannelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'attendances',
            filter: `cell_id=eq.${cellId}`
          },
          (payload) => {
            console.log('Presença alterada:', payload);
            fetchCellData();
          }
        )
        .subscribe();

      const contactChannel = supabase
        .channel(contactChannelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'contacts',
            filter: `cell_id=eq.${cellId}`
          },
          (payload) => {
            console.log('Contato alterado:', payload);
            fetchCellData();
          }
        )
        .subscribe();

      // Store channels for cleanup
      channelsRef.current = [attendanceChannel, contactChannel];

      return () => {
        channelsRef.current.forEach(channel => {
          supabase.removeChannel(channel);
        });
        channelsRef.current = [];
      };
    }
  }, [cellId, isOpen]);

  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const filtered = attendances.filter(att => att.attendance_date === dateStr);
    setFilteredAttendances(filtered);
  }, [selectedDate, attendances]);

  const toggleAttendance = async (contactId: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existing = filteredAttendances.find(att => att.contact_id === contactId);

    try {
      if (existing) {
        // Atualizar presença existente
        const { error } = await supabase
          .from('attendances')
          .update({ present: !existing.present })
          .eq('id', existing.id);

        if (error) {
          console.error('Erro ao atualizar presença:', error);
          return;
        }
      } else {
        // Criar nova presença
        const { error } = await supabase
          .from('attendances')
          .insert([{
            cell_id: cellId,
            contact_id: contactId,
            attendance_date: dateStr,
            present: true,
            visitor: false
          }]);

        if (error) {
          console.error('Erro ao criar presença:', error);
          return;
        }
      }

      toast({
        title: "Sucesso",
        description: "Presença atualizada com sucesso!"
      });

      // Os dados serão atualizados automaticamente via real-time
    } catch (error) {
      console.error('Erro ao alterar presença:', error);
    }
  };

  const addVisitor = async () => {
    if (!newVisitorName.trim()) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    try {
      // Criar contato visitante
      const { data: visitorData, error: visitorError } = await supabase
        .from('contacts')
        .insert([{
          name: newVisitorName.trim(),
          neighborhood: 'Visitante',
          status: 'visitor',
          cell_id: cellId
        }])
        .select()
        .single();

      if (visitorError) {
        console.error('Erro ao criar visitante:', visitorError);
        return;
      }

      // Marcar presença do visitante
      const { error: attendanceError } = await supabase
        .from('attendances')
        .insert([{
          cell_id: cellId,
          contact_id: visitorData.id,
          attendance_date: dateStr,
          present: true,
          visitor: true
        }]);

      if (attendanceError) {
        console.error('Erro ao marcar presença do visitante:', attendanceError);
        return;
      }

      toast({
        title: "Sucesso",
        description: "Visitante adicionado com sucesso!"
      });

      setNewVisitorName('');
      // Os dados serão atualizados automaticamente via real-time
    } catch (error) {
      console.error('Erro ao adicionar visitante:', error);
    }
  };

  const getChartData = () => {
    const weeklyData: { [key: string]: { week: string; members: number; visitors: number } } = {};

    attendances.forEach(att => {
      const date = parseISO(att.attendance_date);
      const weekKey = format(date, 'yyyy-ww', { locale: ptBR });
      const weekLabel = format(date, "'Semana' w", { locale: ptBR });

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { week: weekLabel, members: 0, visitors: 0 };
      }

      if (att.present) {
        if (att.visitor) {
          weeklyData[weekKey].visitors++;
        } else {
          weeklyData[weekKey].members++;
        }
      }
    });

    return Object.values(weeklyData).sort((a, b) => a.week.localeCompare(b.week));
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!cell) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="text-center py-8">
            <p className="text-gray-500">Célula não encontrada.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const todayAttendances = filteredAttendances;
  const presentCount = todayAttendances.filter(att => att.present).length;
  const visitorCount = todayAttendances.filter(att => att.present && att.visitor).length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cellName}</DialogTitle>
          <DialogDescription>{cell.address}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total de Membros</p>
                    <p className="text-2xl font-bold">{members.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Presentes Hoje</p>
                    <p className="text-2xl font-bold">{presentCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Visitantes Hoje</p>
                    <p className="text-2xl font-bold">{visitorCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Frequência */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Frequência Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="members" fill="#3b82f6" name="Membros" />
                  <Bar dataKey="visitors" fill="#f59e0b" name="Visitantes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Controle de Presença */}
          <Card>
            <CardHeader>
              <CardTitle>Controle de Presença</CardTitle>
              <CardDescription>
                Selecione uma data e marque a presença dos membros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seletor de Data */}
              <div className="flex items-center gap-4">
                <label className="font-medium">Data da Reunião:</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[240px] justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, 'dd/MM/yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Lista de Membros */}
              <div className="space-y-2">
                <h4 className="font-medium">Membros:</h4>
                {members.length === 0 ? (
                  <p className="text-gray-500">Nenhum membro cadastrado nesta célula.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {members.map((member) => {
                      const attendance = todayAttendances.find(att => att.contact_id === member.id);
                      const isPresent = attendance?.present || false;
                      
                      return (
                        <div
                          key={member.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isPresent 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-600">{member.neighborhood}</p>
                          </div>
                          <Button
                            size="sm"
                            variant={isPresent ? "default" : "outline"}
                            onClick={() => toggleAttendance(member.id)}
                            className={isPresent ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            {isPresent ? <UserCheck className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Adicionar Visitante */}
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-medium">Adicionar Visitante:</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do visitante"
                    value={newVisitorName}
                    onChange={(e) => setNewVisitorName(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addVisitor} disabled={!newVisitorName.trim()}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Visitantes do Dia */}
              {visitorCount > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="font-medium">Visitantes Presentes:</h4>
                  <div className="space-y-1">
                    {todayAttendances
                      .filter(att => att.visitor && att.present)
                      .map(att => {
                        const visitor = members.find(m => m.id === att.contact_id);
                        return visitor ? (
                          <div key={att.id} className="flex items-center gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                            <UserPlus className="h-4 w-4 text-orange-600" />
                            <span>{visitor.name}</span>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              Visitante
                            </Badge>
                          </div>
                        ) : null;
                      })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
