import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, MapPin, Clock, UserPlus, QrCode, BarChart3, Edit, UserCheck, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Cell } from '@/hooks/useCells';
import { EditContactDialog } from './EditContactDialog';
import { ContactNotesDialog } from './ContactNotesDialog';
import { CellLeaderInfo } from './CellLeaderInfo';
import QRCode from 'qrcode.react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Contact {
  id: string;
  name: string;
  whatsapp: string | null;
  status: string;
  encounter_with_god: boolean;
  cell_id: string | null;
  neighborhood: string;
  attendance_code: string | null;
}

interface Attendance {
  id: string;
  contact_id: string;
  cell_id: string;
  attendance_date: string;
  present: boolean;
  visitor: boolean;
  created_at: string;
}

interface CellModalProps {
  cell: Cell | null;
  isOpen: boolean;
  onClose: () => void;
  onCellUpdated: () => void;
}

export const CellModal = ({ cell, isOpen, onClose, onCellUpdated }: CellModalProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newVisitorName, setNewVisitorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedContactForNotes, setSelectedContactForNotes] = useState<Contact | null>(null);
  const mountedRef = useRef(true);

  const generateAttendanceCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const fetchCellData = async () => {
    if (!cell) return;
    
    setLoading(true);
    try {
      // Buscar contatos da célula
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('cell_id', cell.id);

      if (contactsError) throw contactsError;

      // Buscar presenças
      const { data: attendancesData, error: attendancesError } = await supabase
        .from('attendances')
        .select('*')
        .eq('cell_id', cell.id)
        .order('attendance_date', { ascending: false });

      if (attendancesError) throw attendancesError;

      if (mountedRef.current) {
        setContacts(contactsData || []);
        setAttendances(attendancesData || []);
        generateWeeklyStats(attendancesData || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados da célula:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da célula",
        variant: "destructive"
      });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const generateWeeklyStats = (attendancesData: Attendance[]) => {
    const last8Weeks = [];
    const now = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekAttendances = attendancesData.filter(att => {
        const attDate = new Date(att.attendance_date);
        return attDate >= weekStart && attDate <= weekEnd && att.present;
      });
      
      const membersCount = weekAttendances.filter(att => !att.visitor).length;
      const visitorsCount = weekAttendances.filter(att => att.visitor).length;
      
      last8Weeks.push({
        semana: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
        Membros: membersCount,
        Visitantes: visitorsCount,
        Total: membersCount + visitorsCount
      });
    }
    
    setWeeklyStats(last8Weeks);
  };

  const addVisitor = async () => {
    if (!newVisitorName.trim() || !cell) return;
    
    try {
      const attendanceCode = generateAttendanceCode();
      
      // Criar contato visitante
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .insert({
          name: newVisitorName,
          cell_id: cell.id,
          status: 'visitor',
          neighborhood: 'Visitante',
          attendance_code: attendanceCode
        })
        .select()
        .single();

      if (contactError) throw contactError;

      // Adicionar presença automática para a data selecionada
      const { error: attendanceError } = await supabase
        .from('attendances')
        .insert({
          cell_id: cell.id,
          contact_id: contactData.id,
          attendance_date: selectedDate,
          present: true,
          visitor: true
        });

      if (attendanceError) throw attendanceError;

      setNewVisitorName('');
      fetchCellData();
      toast({
        title: "Sucesso",
        description: "Visitante adicionado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao adicionar visitante:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar visitante",
        variant: "destructive"
      });
    }
  };

  const togglePresence = async (contactId: string, currentPresent: boolean) => {
    if (!cell) return;
    
    try {
      const existingAttendance = attendances.find(
        att => att.contact_id === contactId && att.attendance_date === selectedDate
      );

      if (existingAttendance) {
        const { error } = await supabase
          .from('attendances')
          .update({ present: !currentPresent })
          .eq('id', existingAttendance.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('attendances')
          .insert({
            cell_id: cell.id,
            contact_id: contactId,
            attendance_date: selectedDate,
            present: true,
            visitor: false
          });

        if (error) throw error;
      }

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

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setEditDialogOpen(true);
  };

  const handleContactUpdated = () => {
    fetchCellData();
    setEditDialogOpen(false);
    setEditingContact(null);
  };

  const handleOpenNotes = (contact: Contact) => {
    setSelectedContactForNotes(contact);
    setNotesDialogOpen(true);
  };

  useEffect(() => {
    if (cell && isOpen) {
      mountedRef.current = true;
      fetchCellData();
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [cell, isOpen]);

  if (!cell) return null;

  const todayAttendances = attendances.filter(att => att.attendance_date === selectedDate);
  const presentToday = todayAttendances.filter(att => att.present).length;
  const visitorsToday = todayAttendances.filter(att => att.visitor && att.present).length;
  const totalMembers = contacts.filter(c => c.status !== 'visitor').length;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-between text-xl">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                {cell.name}
              </div>
              {/* Informações do líder na mesma linha */}
              {cell.leader_id && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Líder:</span>
                  <CellLeaderInfo leader_id={cell.leader_id} />
                </div>
              )}
            </DialogTitle>
            <p className="text-sm text-gray-600">{cell.address}</p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {/* Estatísticas principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total de Membros</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <Users className="h-8 w-8 text-blue-500" />
                    <span className="text-2xl font-bold">{totalMembers}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Presentes na Data</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <Users className="h-8 w-8 text-green-500" />
                    <span className="text-2xl font-bold">{presentToday}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Visitantes na Data</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-8 w-8 text-orange-500" />
                    <span className="text-2xl font-bold">{visitorsToday}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de frequência */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Comparativo de Frequência - Membros vs Visitantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semana" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Membros" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Visitantes" 
                      stroke="#F59E0B" 
                      strokeWidth={3}
                      dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Controle de presença */}
            <Card>
              <CardHeader>
                <CardTitle>Controle de Presença</CardTitle>
                <p className="text-sm text-gray-600">Selecione uma data e marque a presença dos membros</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Data da Reunião:</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Membros:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {contacts.filter(c => c.status !== 'visitor').map((contact) => {
                      const attendance = todayAttendances.find(att => att.contact_id === contact.id);
                      const isPresent = attendance?.present || false;
                      
                      return (
                        <div
                          key={contact.id}
                          className={`p-3 rounded-lg border transition-colors ${
                            isPresent ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => togglePresence(contact.id, isPresent)}
                            >
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-xs text-gray-500">{contact.neighborhood}</p>
                              {contact.attendance_code && (
                                <p className="text-xs text-blue-600 font-mono">
                                  Código: {contact.attendance_code}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenNotes(contact)}
                                className="p-1"
                                title="Anotações"
                              >
                                <MessageSquare className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditContact(contact)}
                                className="p-1"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4 text-gray-500" />
                              </Button>
                              {contact.encounter_with_god && (
                                <Badge variant="outline" className="text-xs">Encontro</Badge>
                              )}
                              <div className={`w-4 h-4 rounded-full ${
                                isPresent ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Adicionar Visitante:</h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nome do visitante"
                      value={newVisitorName}
                      onChange={(e) => setNewVisitorName(e.target.value)}
                    />
                    <Button onClick={addVisitor} disabled={!newVisitorName.trim()}>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Visitantes da célula */}
                {contacts.filter(c => c.status === 'visitor').length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Visitantes da Célula:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {contacts.filter(c => c.status === 'visitor').map((visitor) => (
                        <div key={visitor.id} className="p-3 rounded bg-orange-50 border border-orange-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <span className="font-medium">{visitor.name}</span>
                              {visitor.attendance_code && (
                                <p className="text-xs text-blue-600 font-mono mt-1">
                                  Código: {visitor.attendance_code}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenNotes(visitor)}
                                className="p-1"
                                title="Anotações"
                              >
                                <MessageSquare className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditContact(visitor)}
                                className="p-1"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4 text-gray-500" />
                              </Button>
                              <Badge variant="secondary" className="text-xs">Visitante</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* QR Codes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QR Code para Líderes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <QrCode className="h-5 w-5" />
                    QR Code - Acesso do Líder
                  </CardTitle>
                  <p className="text-sm text-gray-600">Para controle completo da célula</p>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="inline-block p-4 bg-white rounded-lg border">
                    <QRCode 
                      value={`${window.location.origin}/cells/${cell.id}/attendance`}
                      size={180}
                      fgColor="#059669"
                    />
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/cells/${cell.id}/attendance`);
                        toast({ title: "Link copiado!" });
                      }}
                    >
                      Copiar Link
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 break-all">
                    {window.location.origin}/cells/{cell.id}/attendance
                  </p>
                </CardContent>
              </Card>

              {/* QR Code para Membros */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <UserCheck className="h-5 w-5" />
                    QR Code - Presença dos Membros
                  </CardTitle>
                  <p className="text-sm text-gray-600">Para membros marcarem presença</p>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="inline-block p-4 bg-white rounded-lg border">
                    <QRCode 
                      value={`${window.location.origin}/attendance/${cell.id}`}
                      size={180}
                      fgColor="#2563EB"
                    />
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/attendance/${cell.id}`);
                        toast({ title: "Link copiado!" });
                      }}
                    >
                      Copiar Link
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 break-all">
                    {window.location.origin}/attendance/{cell.id}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {editingContact && (
        <EditContactDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          contact={editingContact}
          context="cell"
          onContactUpdated={handleContactUpdated}
        />
      )}

      {selectedContactForNotes && (
        <ContactNotesDialog
          isOpen={notesDialogOpen}
          onOpenChange={setNotesDialogOpen}
          contactId={selectedContactForNotes.id}
          contactName={selectedContactForNotes.name}
          cellId={cell.id}
        />
      )}
    </>
  );
};
