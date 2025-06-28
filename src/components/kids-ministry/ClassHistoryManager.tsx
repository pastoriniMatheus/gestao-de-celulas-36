
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { History, Eye } from 'lucide-react';
import { useClassRecords, ChildAttendance } from '@/hooks/useClassRecords';
import { format } from 'date-fns';

export const ClassHistoryManager = () => {
  const { records, loading, getAttendanceByRecord } = useClassRecords();
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [attendanceDetails, setAttendanceDetails] = useState<ChildAttendance[]>([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const handleViewDetails = async (record: any) => {
    setSelectedRecord(record);
    const attendance = await getAttendanceByRecord(record.id);
    setAttendanceDetails(attendance);
    setDetailsDialogOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2">Carregando...</span>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <History className="h-6 w-6 text-indigo-600" />
        <h2 className="text-2xl font-bold">Histórico de Aulas</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aulas Ministradas ({records.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Professora 1</TableHead>
                <TableHead>Professora 2</TableHead>
                <TableHead>Lição</TableHead>
                <TableHead>Presentes</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{format(new Date(record.worship_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{record.class}</TableCell>
                  <TableCell>{record.teacher_1 || '-'}</TableCell>
                  <TableCell>{record.teacher_2 || '-'}</TableCell>
                  <TableCell>{record.lesson_title}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant="default">
                        {record.total_members} Membros
                      </Badge>
                      <Badge variant="secondary">
                        {record.total_visitors} Visitantes
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(record)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    Nenhuma aula registrada ainda
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Aula</DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Data:</strong> {format(new Date(selectedRecord.worship_date), 'dd/MM/yyyy')}
                    </div>
                    <div>
                      <strong>Turma:</strong> {selectedRecord.class}
                    </div>
                    <div>
                      <strong>Professora 1:</strong> {selectedRecord.teacher_1 || 'Não informado'}
                    </div>
                    <div>
                      <strong>Professora 2:</strong> {selectedRecord.teacher_2 || 'Não informado'}
                    </div>
                    <div className="col-span-2">
                      <strong>Lição:</strong> {selectedRecord.lesson_title}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lista de Presença</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {attendanceDetails
                      .filter(att => att.present)
                      .map((attendance) => (
                        <div key={attendance.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>{attendance.child_name}</span>
                          <Badge variant={attendance.type === 'Membro' ? 'default' : 'secondary'}>
                            {attendance.type}
                          </Badge>
                        </div>
                      ))}
                    {attendanceDetails.filter(att => att.present).length === 0 && (
                      <p className="text-center text-gray-500 py-4">
                        Nenhuma presença registrada
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
