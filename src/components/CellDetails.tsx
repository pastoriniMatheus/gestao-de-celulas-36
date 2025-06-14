import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, UserPlus, CheckCircle, Calendar, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface CellDetailsProps {
  cellId: string;
  cellName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CellMember {
  id: string;
  name: string;
  whatsapp?: string;
  neighborhood: string;
  status: string;
  created_at: string;
}

interface Attendance {
  id: string;
  contact_id: string;
  attendance_date: string;
  present: boolean;
  visitor: boolean;
}

interface AttendanceChart {
  date: string;
  members: number;
  visitors: number;
  total: number;
}

export const CellDetails = ({ cellId, cellName, isOpen, onOpenChange }: CellDetailsProps) => {
  const [members, setMembers] = useState<CellMember[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [chartData, setChartData] = useState<AttendanceChart[]>([]);
  const [loading, setLoading] = useState(false);
  const [newVisitorName, setNewVisitorName] = useState('');
  const [newVisitorWhatsapp, setNewVisitorWhatsapp] = useState('');
  const [newVisitorNeighborhood, setNewVisitorNeighborhood] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const fetchCellData = async () => {
    if (!cellId || !isOpen) return;
    
    setLoading(true);
    try {
      // Buscar membros da célula
      const { data: membersData, error: membersError } = await supabase
        .from('contacts')
        .select('*')
        .eq('cell_id', cellId)
        .order('name');

      if (membersError) {
        console.error('Erro ao buscar membros:', membersError);
        throw membersError;
      }

      setMembers(membersData || []);

      // Buscar presenças da célula - now including visitor column
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendances')
        .select('*')
        .eq('cell_id', cellId)
        .order('attendance_date', { ascending: false });

      if (attendanceError) {
        console.error('Erro ao buscar presenças:', attendanceError);
        throw attendanceError;
      }

      setAttendances(attendanceData || []);
      generateChartData(attendanceData || []);
    } catch (error) {
      console.error('Erro ao carregar dados da célula:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da célula",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (attendanceData: Attendance[]) => {
    // Agrupar por data
    const groupedData = attendanceData.reduce((acc, attendance) => {
      const date = attendance.attendance_date;
      if (!acc[date]) {
        acc[date] = { members: 0, visitors: 0 };
      }
      if (attendance.present) {
        if (attendance.visitor) {
          acc[date].visitors++;
        } else {
          acc[date].members++;
        }
      }
      return acc;
    }, {} as Record<string, { members: number; visitors: number }>);

    // Converter para array e ordenar
    const chartData = Object.entries(groupedData)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('pt-BR'),
        members: data.members,
        visitors: data.visitors,
        total: data.members + data.visitors
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-8); // Últimas 8 semanas

    setChartData(chartData);
  };

  const markAttendance = async (contactId: string, present: boolean, visitor: boolean = false) => {
    try {
      // Verificar se já existe presença para esta data
      const { data: existingAttendance } = await supabase
        .from('attendances')
        .select('id')
        .eq('contact_id', contactId)
        .eq('cell_id', cellId)
        .eq('attendance_date', selectedDate)
        .maybeSingle();

      if (existingAttendance) {
        // Atualizar presença existente
        const { error } = await supabase
          .from('attendances')
          .update({ present, visitor })
          .eq('id', existingAttendance.id);

        if (error) throw error;
      } else {
        // Criar nova presença
        const { error } = await supabase
          .from('attendances')
          .insert([{
            contact_id: contactId,
            cell_id: cellId,
            attendance_date: selectedDate,
            present,
            visitor
          }]);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: present ? "Presença confirmada!" : "Presença removida!",
      });

      // Recarregar dados
      fetchCellData();
    } catch (error) {
      console.error('Erro ao marcar presença:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar presença",
        variant: "destructive"
      });
    }
  };

  const addVisitor = async () => {
    if (!newVisitorName.trim() || !newVisitorNeighborhood.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha pelo menos nome e bairro",
        variant: "destructive"
      });
      return;
    }

    try {
      // Criar visitante como contato temporário
      const { data: visitorData, error: visitorError } = await supabase
        .from('contacts')
        .insert([{
          name: newVisitorName.trim(),
          whatsapp: newVisitorWhatsapp.trim() || null,
          neighborhood: newVisitorNeighborhood.trim(),
          cell_id: cellId,
          status: 'visitor'
        }])
        .select()
        .single();

      if (visitorError) throw visitorError;

      // Marcar presença automaticamente
      await markAttendance(visitorData.id, true, true);

      // Limpar formulário
      setNewVisitorName('');
      setNewVisitorWhatsapp('');
      setNewVisitorNeighborhood('');

      toast({
        title: "Sucesso",
        description: "Visitante adicionado e presença marcada!",
      });

      // Recarregar dados
      fetchCellData();
    } catch (error) {
      console.error('Erro ao adicionar visitante:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar visitante",
        variant: "destructive"
      });
    }
  };

  const getTodayAttendance = (contactId: string) => {
    return attendances.find(
      att => att.contact_id === contactId && 
             att.attendance_date === selectedDate
    );
  };

  useEffect(() => {
    fetchCellData();
  }, [cellId, isOpen]);

  const chartConfig = {
    members: {
      label: "Membros",
      color: "hsl(var(--chart-1))",
    },
    visitors: {
      label: "Visitantes", 
      color: "hsl(var(--chart-2))",
    },
    total: {
      label: "Total",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            {cellName}
          </DialogTitle>
          <DialogDescription>
            Gerenciamento de membros e frequência da célula
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{members.length}</p>
                    <p className="text-sm text-gray-600">Total de Membros</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {members.filter(m => m.status === 'active').length}
                    </p>
                    <p className="text-sm text-gray-600">Membros Ativos</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {members.filter(m => m.status === 'visitor').length}
                    </p>
                    <p className="text-sm text-gray-600">Visitantes</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Frequência */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Frequência das Últimas Semanas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="members" stroke="var(--color-members)" strokeWidth={2} />
                        <Line type="monotone" dataKey="visitors" stroke="var(--color-visitors)" strokeWidth={2} />
                        <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Controle de Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Controle de Presença
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-center mb-4">
                  <label className="text-sm font-medium">Data:</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                </div>

                {/* Adicionar Visitante */}
                <div className="border rounded-lg p-4 mb-4 bg-orange-50">
                  <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Adicionar Visitante
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Input
                      placeholder="Nome do visitante"
                      value={newVisitorName}
                      onChange={(e) => setNewVisitorName(e.target.value)}
                    />
                    <Input
                      placeholder="WhatsApp (opcional)"
                      value={newVisitorWhatsapp}
                      onChange={(e) => setNewVisitorWhatsapp(e.target.value)}
                    />
                    <Input
                      placeholder="Bairro"
                      value={newVisitorNeighborhood}
                      onChange={(e) => setNewVisitorNeighborhood(e.target.value)}
                    />
                    <Button onClick={addVisitor} className="bg-orange-600 hover:bg-orange-700">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Lista de Membros */}
                <div className="space-y-2">
                  {members.map((member) => {
                    const attendance = getTodayAttendance(member.id);
                    const isPresent = attendance?.present || false;
                    const isVisitor = member.status === 'visitor';

                    return (
                      <div
                        key={member.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isVisitor ? 'bg-orange-50 border-orange-200' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-600">{member.neighborhood}</p>
                            {member.whatsapp && (
                              <p className="text-xs text-gray-500">{member.whatsapp}</p>
                            )}
                          </div>
                          {isVisitor && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              Visitante
                            </Badge>
                          )}
                        </div>
                        <Button
                          onClick={() => markAttendance(member.id, !isPresent, isVisitor)}
                          variant={isPresent ? "default" : "outline"}
                          size="sm"
                          className={isPresent ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {isPresent ? "Presente" : "Marcar"}
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {members.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Nenhum membro cadastrado nesta célula ainda.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
