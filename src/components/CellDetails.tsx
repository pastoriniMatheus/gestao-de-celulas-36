import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, Users, UserCheck, UserPlus, BarChart3, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CellQrCode } from "./CellQrCode";
import { EditContactDialog } from "./EditContactDialog";

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
  status: string;
  attendance_code?: string;
  encounter_with_god?: boolean;
}

interface Attendance {
  id: string;
  contact_id: string;
  attendance_date: string;
  present: boolean;
  visitor: boolean;
}

export function CellDetails({ cellId, cellName, isOpen, onOpenChange }: any) {
  const [cell, setCell] = useState<any>(null);
  const [members, setMembers] = useState<Contact[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newVisitorName, setNewVisitorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [editContact, setEditContact] = useState(null);
  const { toast } = useToast();
  const channelsRef = useRef<any[]>([]);
  const isSubscribedRef = useRef(false);
  const mountedRef = useRef(true);

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

      if (mountedRef.current) {
        setCell(cellData);
      }

      // Buscar membros da célula (incluindo visitantes)
      const { data: membersData, error: membersError } = await supabase
        .from('contacts')
        .select('id, name, whatsapp, neighborhood, status, attendance_code, encounter_with_god')
        .eq('cell_id', cellId);

      if (membersError) {
        console.error('Erro ao buscar membros:', membersError);
        return;
      }

      if (mountedRef.current) {
        setMembers(membersData || []);
      }

      // Buscar presenças da célula
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendances')
        .select('id, contact_id, attendance_date, present, visitor')
        .eq('cell_id', cellId);

      if (attendanceError) {
        console.error('Erro ao buscar presenças:', attendanceError);
        return;
      }

      if (mountedRef.current) {
        setAttendances(attendanceData || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados da célula:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (isOpen && cellId) {
      fetchCellData();
    }

    return () => {
      mountedRef.current = false;
      console.log('Cleaning up cell detail channels on unmount...');
      channelsRef.current.forEach(channel => {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.error('Error removing channel:', error);
        }
      });
      channelsRef.current = [];
      isSubscribedRef.current = false;
    };
  }, [cellId, isOpen]);

  // Separate useEffect for subscriptions
  useEffect(() => {
    if (!isOpen || !cellId || isSubscribedRef.current || !mountedRef.current) return;

    const setupSubscriptions = async () => {
      try {
        // Clean up any existing channels first
        if (channelsRef.current.length > 0) {
          console.log('Cleaning up existing cell detail channels...');
          channelsRef.current.forEach(channel => {
            try {
              supabase.removeChannel(channel);
            } catch (error) {
              console.error('Error removing channel:', error);
            }
          });
          channelsRef.current = [];
          isSubscribedRef.current = false;
        }

        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const attendanceChannelName = `attendance-${cellId}-${timestamp}-${random}`;
        const contactChannelName = `contact-${cellId}-${timestamp}-${random}`;
        
        console.log('Creating cell detail subscriptions:', { attendanceChannelName, contactChannelName });

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
              if (mountedRef.current) {
                fetchCellData();
              }
            }
          );

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
              if (mountedRef.current) {
                fetchCellData();
              }
            }
          );

        // Subscribe channels
        const attendanceResult = await attendanceChannel.subscribe();
        const contactResult = await contactChannel.subscribe();
        
        console.log('Subscription results:', { attendanceResult, contactResult });
        
        if (attendanceResult === 'SUBSCRIBED' && contactResult === 'SUBSCRIBED') {
          channelsRef.current = [attendanceChannel, contactChannel];
          isSubscribedRef.current = true;
        }
      } catch (error) {
        console.error('Error setting up cell detail subscriptions:', error);
      }
    };

    setupSubscriptions();
  }, [cellId, isOpen]);

  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const filtered = attendances.filter(att => att.attendance_date === dateStr);
    setFilteredAttendances(filtered);
  }, [selectedDate, attendances]);

  const toggleAttendance = async (contactId: string) => {
    if (isUpdating === contactId) return;
    
    setIsUpdating(contactId);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existing = attendances.find(att => 
      att.contact_id === contactId && att.attendance_date === dateStr
    );

    try {
      console.log('Marcando presença para contato:', contactId, 'na data:', dateStr);
      
      if (existing) {
        // Atualizar presença existente
        const { data, error } = await supabase
          .from('attendances')
          .update({ present: !existing.present })
          .eq('id', existing.id)
          .select();

        if (error) {
          console.error('Erro ao atualizar presença:', error);
          toast({
            title: "Erro",
            description: "Erro ao atualizar presença. Tente novamente.",
            variant: "destructive"
          });
          return;
        }

        console.log('Presença atualizada:', data);
      } else {
        // Criar nova presença
        const { data, error } = await supabase
          .from('attendances')
          .insert([{
            cell_id: cellId,
            contact_id: contactId,
            attendance_date: dateStr,
            present: true,
            visitor: false
          }])
          .select();

        if (error) {
          console.error('Erro ao criar presença:', error);
          toast({
            title: "Erro",
            description: "Erro ao marcar presença. Tente novamente.",
            variant: "destructive"
          });
          return;
        }

        console.log('Presença criada:', data);
      }

      toast({
        title: "Sucesso",
        description: "Presença atualizada com sucesso!"
      });

      // Recarregar dados
      await fetchCellData();
    } catch (error) {
      console.error('Erro ao alterar presença:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao marcar presença.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const addVisitor = async () => {
    if (!newVisitorName.trim()) {
      toast({
        title: "Atenção",
        description: "Por favor, insira o nome do visitante.",
        variant: "destructive"
      });
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    try {
      console.log('Adicionando visitante:', newVisitorName);

      // Corrigir insert: garantir campos obrigatórios e status válidos
      const { data: visitorData, error: visitorError } = await supabase
        .from('contacts')
        .insert([{
          name: newVisitorName.trim(),
          neighborhood: 'Visitante',
          status: 'visitor',
          cell_id: cellId // vincula visitante como membro dessa célula
        }])
        .select()
        .single();

      if (visitorError) {
        console.error('Erro ao criar visitante:', visitorError);
        toast({
          title: "Erro",
          description: visitorError.message?.includes('violates not-null')
            ? "Erro ao criar visitante: divulgação inválida (campos obrigatórios ausentes ou valor inválido)."
            : "Erro ao criar visitante. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Marcar presença do visitante
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendances')
        .insert([{
          cell_id: cellId,
          contact_id: visitorData.id,
          attendance_date: dateStr,
          present: true,
          visitor: true
        }])
        .select();

      if (attendanceError) {
        console.error('Erro ao marcar presença do visitante:', attendanceError);
        toast({
          title: "Erro",
          description: "Erro ao marcar presença do visitante.",
          variant: "destructive"
        });
        return;
      }

      console.log('Visitante adicionado e presença marcada:', { visitorData, attendanceData });

      toast({
        title: "Sucesso",
        description: "Visitante adicionado com sucesso!"
      });

      setNewVisitorName('');
      await fetchCellData();
    } catch (error) {
      console.error('Erro ao adicionar visitante:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar visitante.",
        variant: "destructive"
      });
    }
  };

  const getChartData = () => {
    const weeklyData: { [key: string]: { week: string; members: number; visitors: number } } = {};

    attendances.forEach(att => {
      if (att.present) {
        const date = parseISO(att.attendance_date);
        const weekKey = format(date, 'yyyy-ww', { locale: ptBR });
        const weekLabel = format(date, "'Semana' w/yyyy", { locale: ptBR });

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { week: weekLabel, members: 0, visitors: 0 };
        }

        if (att.visitor) {
          weeklyData[weekKey].visitors++;
        } else {
          weeklyData[weekKey].members++;
        }
      }
    });

    return Object.values(weeklyData).sort((a, b) => a.week.localeCompare(b.week)).slice(-8); // Últimas 8 semanas
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

  const todayAttendances = filteredAttendances;
  const presentCount = todayAttendances.filter(att => att.present).length;
  const visitorCount = todayAttendances.filter(att => att.present && att.visitor).length;

  // Separar membros efetivos de visitantes - membros que viraram member não devem aparecer como visitantes
  const actualMembers = members.filter(m => m.status === 'member');
  const actualVisitors = members.filter(m => m.status === 'visitor');

  return (
    <>
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
                      <p className="text-2xl font-bold">{actualMembers.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Presentes na Data</p>
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
                      <p className="text-sm text-gray-600">Visitantes na Data</p>
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
                  {actualMembers.length === 0 ? (
                    <p className="text-gray-500">Nenhum membro cadastrado nesta célula.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {actualMembers.map((member) => {
                        const attendance = todayAttendances.find(att => att.contact_id === member.id);
                        const isPresent = attendance?.present || false;
                        const isLoading = isUpdating === member.id;
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
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{member.name}</p>
                                {member.attendance_code && (
                                  <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                    Código: {member.attendance_code}
                                  </span>
                                )}
                                {/* Indicador de Encontro */}
                                {member.encounter_with_god && (
                                  <span className="flex items-center gap-1 ml-1 text-green-700 bg-green-100 px-2 py-0.5 rounded text-xs">
                                    <CheckCircle2 className="w-3 h-3 mr-0.5" />
                                    Encontro
                                  </span>
                                )}
                                <Button size="icon" variant="ghost" className="ml-1" onClick={() => setEditContact(member)} title="Editar membro">
                                  <svg width="16" height="16" fill="none" stroke="currentColor"><path d="M15.232 2.12a3 3 0 0 1 0 4.243l-8.61 8.611a2 2 0 0 1-1.049.555l-4.077.68.68-4.078a2 2 0 0 1 .555-1.048l8.61-8.611a3 3 0 0 1 4.244 0Z"></path></svg>
                                </Button>
                              </div>
                              <p className="text-sm text-gray-600">{member.neighborhood}</p>
                            </div>
                            <Button
                              size="sm"
                              variant={isPresent ? "default" : "outline"}
                              onClick={() => toggleAttendance(member.id)}
                              disabled={isLoading}
                              className={isPresent ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : isPresent ? (
                                <UserCheck className="h-4 w-4" />
                              ) : (
                                <Users className="h-4 w-4" />
                              )}
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
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addVisitor();
                        }
                      }}
                    />
                    <Button onClick={addVisitor} disabled={!newVisitorName.trim()}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Visitantes do Dia */}
                {actualVisitors.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="font-medium">Visitantes da Célula:</h4>
                    <div className="space-y-1">
                      {actualVisitors.map(visitor => {
                        const attendance = todayAttendances.find(att => att.contact_id === visitor.id);
                        const isPresent = attendance?.present || false;
                        const isLoading = isUpdating === visitor.id;
                        
                        return (
                          <div key={visitor.id} className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-200">
                            <div className="flex items-center gap-2">
                              <UserPlus className="h-4 w-4 text-orange-600" />
                              <span>{visitor.name}</span>
                              {visitor.attendance_code && (
                                <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                  Código: {visitor.attendance_code}
                                </span>
                              )}
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                Visitante
                              </Badge>
                              <Button size="icon" variant="ghost" className="ml-1" onClick={() => setEditContact(visitor)} title="Editar visitante">
                                <svg width="16" height="16" fill="none" stroke="currentColor"><path d="M15.232 2.12a3 3 0 0 1 0 4.243l-8.61 8.611a2 2 0 0 1-1.049.555l-4.077.68.68-4.078a2 2 0 0 1 .555-1.048l8.61-8.611a3 3 0 0 1 4.244 0Z"></path></svg>
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant={isPresent ? "default" : "outline"}
                              onClick={() => toggleAttendance(visitor.id)}
                              disabled={isLoading}
                              className={isPresent ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : isPresent ? (
                                <UserCheck className="h-4 w-4" />
                              ) : (
                                <Users className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-4">
            <h3 className="font-bold text-blue-800 mb-2">QR Code de Presença da Célula</h3>
            <p className="text-xs text-gray-600 mb-2">
              Escaneie, copie ou baixe este QR code.<br />
              Ele leva para a página pública onde os membros podem marcar presença apenas no dia da célula!
            </p>
            <CellQrCode cellId={cellId} />
            <div className="text-xs text-gray-700 mt-2">
              Dia da célula: <b className="text-blue-700">{/* Renderizar nome do dia da semana */}</b>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Adiciona o Dialog para Edição de Membro/Visitante - passando contexto 'cell' */}
      {editContact && (
        <EditContactDialog
          open={!!editContact}
          contact={editContact}
          context="cell"
          onOpenChange={(open) => setEditContact(open ? editContact : null)}
        />
      )}
    </>
  );
}

export default CellDetails;
