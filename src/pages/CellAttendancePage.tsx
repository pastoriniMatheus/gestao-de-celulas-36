
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, UserCheck, UserPlus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Cell {
  id: string;
  name: string;
  address: string;
}

interface Contact {
  id: string;
  name: string;
  whatsapp: string | null;
  attendance_code: string | null;
}

interface Attendance {
  id: string;
  contact_id: string;
  present: boolean;
  visitor: boolean;
  attendance_date: string;
}

export default function CellAttendancePage() {
  const { cellId } = useParams();
  const navigate = useNavigate();
  const [cell, setCell] = useState<Cell | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [visitorName, setVisitorName] = useState('');
  const [loading, setLoading] = useState(true);

  // Estatísticas
  const totalMembers = contacts.length;
  const presentToday = attendances.filter(a => a.present && a.attendance_date === selectedDate).length;
  const visitorsToday = attendances.filter(a => a.visitor && a.attendance_date === selectedDate).length;

  useEffect(() => {
    if (cellId) {
      fetchCellData();
    }
  }, [cellId]);

  useEffect(() => {
    if (cellId && selectedDate) {
      fetchAttendances();
    }
  }, [cellId, selectedDate]);

  const fetchCellData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados da célula
      const { data: cellData, error: cellError } = await supabase
        .from('cells')
        .select('id, name, address')
        .eq('id', cellId)
        .single();

      if (cellError) throw cellError;
      setCell(cellData);

      // Buscar membros da célula
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('id, name, whatsapp, attendance_code')
        .eq('cell_id', cellId);

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);

    } catch (error: any) {
      console.error('Erro ao buscar dados da célula:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da célula",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendances = async () => {
    try {
      const { data, error } = await supabase
        .from('attendances')
        .select('*')
        .eq('cell_id', cellId)
        .eq('attendance_date', selectedDate);

      if (error) throw error;
      setAttendances(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar presenças:', error);
    }
  };

  const toggleAttendance = async (contactId: string, isPresent: boolean) => {
    try {
      const existingAttendance = attendances.find(
        a => a.contact_id === contactId && a.attendance_date === selectedDate
      );

      if (existingAttendance) {
        // Atualizar presença existente
        const { error } = await supabase
          .from('attendances')
          .update({ present: isPresent })
          .eq('id', existingAttendance.id);

        if (error) throw error;
      } else {
        // Criar nova presença
        const { error } = await supabase
          .from('attendances')
          .insert({
            contact_id: contactId,
            cell_id: cellId,
            present: isPresent,
            visitor: false,
            attendance_date: selectedDate
          });

        if (error) throw error;
      }

      await fetchAttendances();
      toast({
        title: "Sucesso",
        description: `Presença ${isPresent ? 'marcada' : 'desmarcada'} com sucesso!`
      });
    } catch (error: any) {
      console.error('Erro ao marcar presença:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar presença",
        variant: "destructive"
      });
    }
  };

  const addVisitor = async () => {
    if (!visitorName.trim()) return;

    try {
      const { error } = await supabase
        .from('attendances')
        .insert({
          contact_id: null,
          cell_id: cellId,
          present: true,
          visitor: true,
          attendance_date: selectedDate
        });

      if (error) throw error;

      setVisitorName('');
      await fetchAttendances();
      toast({
        title: "Sucesso",
        description: "Visitante adicionado com sucesso!"
      });
    } catch (error: any) {
      console.error('Erro ao adicionar visitante:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar visitante",
        variant: "destructive"
      });
    }
  };

  const isContactPresent = (contactId: string) => {
    return attendances.some(a => a.contact_id === contactId && a.present && a.attendance_date === selectedDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  if (!cell) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Célula não encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/cells')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{cell.name}</h1>
          <p className="text-gray-600">{cell.address}</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Membros</p>
                <p className="text-2xl font-bold">{totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Presentes na Data</p>
                <p className="text-2xl font-bold">{presentToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Visitantes na Data</p>
                <p className="text-2xl font-bold">{visitorsToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controle de Presença */}
      <Card>
        <CardHeader>
          <CardTitle>Controle de Presença</CardTitle>
          <CardDescription>
            Selecione uma data e marque a presença dos membros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Data da Reunião:</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Membros:</h3>
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      {contact.attendance_code && (
                        <p className="text-sm text-blue-600">Código: {contact.attendance_code}</p>
                      )}
                    </div>
                    {isContactPresent(contact.id) && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Presente
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant={isContactPresent(contact.id) ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleAttendance(contact.id, !isContactPresent(contact.id))}
                  >
                    {isContactPresent(contact.id) ? 'Desmarcar' : 'Marcar Presente'}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Adicionar Visitante:</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Nome do visitante"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
              />
              <Button onClick={addVisitor}>
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {visitorsToday > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Visitantes da Célula:</h3>
              <div className="space-y-2">
                {attendances
                  .filter(a => a.visitor && a.attendance_date === selectedDate)
                  .map((attendance, index) => (
                    <div key={attendance.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-orange-600" />
                        <span className="font-medium">Visitante {index + 1}</span>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Visitante
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
