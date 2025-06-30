
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
import { ContactAvatar } from './ContactAvatar';
import { CellVisitorActions } from './CellVisitorActions';
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
  photo_url?: string | null;
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
      console.log('CellModal: Buscando dados da célula:', cell.id);
      
      // Buscar contatos da célula
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('cell_id', cell.id);

      if (contactsError) throw contactsError;
      console.log('CellModal: Contatos encontrados:', contactsData?.length || 0);

      // Buscar presenças
      const { data: attendancesData, error: attendancesError } = await supabase
        .from('attendances')
        .select('*')
        .eq('cell_id', cell.id)
        .order('attendance_date', { ascending: false });

      if (attendancesError) throw attendancesError;
      console.log('CellModal: Presenças encontradas:', attendancesData?.length || 0);

      if (mountedRef.current) {
        setContacts(contactsData || []);
        setAttendances(attendancesData || []);
        generateWeeklyStats(contactsData || [], attendancesData || []);
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

  const generateWeeklyStats = (contactsData: Contact[], attendancesData: Attendance[]) => {
    console.log('CellModal: ===== GERANDO ESTATÍSTICAS SEMANAIS =====');
    
    const contactsMap = new Map(contactsData.map(c => [c.id, c]));
    const last8Weeks = [];
    const now = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekAttendances = attendancesData.filter(att => {
        const attDate = new Date(att.attendance_date);
        const isInWeek = attDate >= weekStart && attDate <= weekEnd;
        const isPresent = att.present;
        return isInWeek && isPresent;
      });
      
      let membersCount = 0;
      let visitorsCount = 0;
      
      weekAttendances.forEach(att => {
        if (att.visitor === true) {
          visitorsCount++;
        } else {
          const contact = contactsMap.get(att.contact_id);
          if (contact) {
            if (contact.status === 'visitor') {
              visitorsCount++;
            } else {
              membersCount++;
            }
          } else {
            membersCount++;
          }
        }
      });
      
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

      // Adicionar presença automática para a data selecionada com visitor = true
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

      const contact = contacts.find(c => c.id === contactId);
      const isVisitorContact = contact?.status === 'visitor';

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
            visitor: isVisitorContact
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

  // URLs para QR codes
  const cellAttendanceUrl = `${window.location.origin}/cells/${cell.id}/attendance`;

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

                <div className="flex items-center gap-4">
                  <Input
                    placeholder="Nome do visitante"
                    value={newVisitorName}
                    onChange={(e) => setNewVisitorName(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addVisitor} disabled={!newVisitorName.trim()}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Visitante
                  </Button>
                </div>

                <div className="space-y-2">
                  {contacts.map(contact => {
                    const attendance = todayAttendances.find(att => att.contact_id === contact.id);
                    const isPresent = attendance?.present || false;
                    
                    return (
                      <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <ContactAvatar
                            name={contact.name}
                            photoUrl={contact.photo_url}
                            size="sm"
                          />
                          <div>
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-sm text-gray-500">{contact.neighborhood}</div>
                            {contact.attendance_code && (
                              <div className="text-xs text-blue-600">Código: {contact.attendance_code}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={contact.status === 'visitor' ? 'secondary' : 'default'}>
                              {contact.status === 'visitor' ? 'Visitante' : 'Membro'}
                            </Badge>
                            {contact.attendance_code && (
                              <div className="flex items-center gap-1">
                                <QrCode className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-blue-600">QR</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {contact.status === 'visitor' && (
                            <CellVisitorActions 
                              visitor={contact} 
                              cellId={cell.id} 
                              onUpdate={fetchCellData}
                            />
                          )}
                          <Button
                            variant={isPresent ? "default" : "outline"}
                            size="sm"
                            onClick={() => togglePresence(contact.id, isPresent)}
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            {isPresent ? 'Presente' : 'Marcar'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditContact(contact)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenNotes(contact)}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          {contact.attendance_code && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const qrUrl = `${window.location.origin}/attendance/${contact.attendance_code}`;
                                window.open(qrUrl, '_blank');
                              }}
                            >
                              <QrCode className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* QR Codes Section - RESTAURADO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QR Code para Líder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-blue-600" />
                    QR Code - Controle do Líder
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Use este QR code para acessar o controle de presença da célula
                  </p>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="flex justify-center">
                    <QRCode
                      value={cellAttendanceUrl}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  <div className="text-xs text-gray-500 break-all">
                    {cellAttendanceUrl}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(cellAttendanceUrl, '_blank')}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Abrir Controle
                  </Button>
                </CardContent>
              </Card>

              {/* QR Code para Membros */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    QR Codes - Presença Individual
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Cada membro tem seu próprio código para marcar presença
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {contacts.filter(c => c.attendance_code && c.status !== 'visitor').map(contact => (
                      <div key={contact.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <ContactAvatar
                            name={contact.name}
                            photoUrl={contact.photo_url}
                            size="xs"
                          />
                          <div>
                            <div className="text-sm font-medium">{contact.name}</div>
                            <div className="text-xs text-blue-600">
                              Código: {contact.attendance_code}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const qrUrl = `${window.location.origin}/attendance/${contact.attendance_code}`;
                            window.open(qrUrl, '_blank');
                          }}
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {contacts.filter(c => c.attendance_code && c.status !== 'visitor').length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      Nenhum membro com código de presença
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {editingContact && (
        <EditContactDialog
          contact={editingContact}
          isOpen={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setEditingContact(null);
          }}
          onUpdate={handleContactUpdated}
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
