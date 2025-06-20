
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, MapPin, Calendar, Clock, User, Edit, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EditCellDialog } from './EditCellDialog';
import { CellQrCode } from './CellQrCode';

interface CellDetails {
  id: string;
  name: string;
  address: string;
  meeting_day: number;
  meeting_time: string;
  leader_id: string | null;
  neighborhood_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: string;
  name: string;
  whatsapp: string | null;
  status: string;
  encounter_with_god: boolean;
  cell_id: string | null;
  pipeline_stage_id: string | null;
  neighborhood: string;
}

export const CellDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cell, setCell] = useState<CellDetails | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const mountedRef = useRef(true);

  const fetchCellDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data: cellData, error: cellError } = await supabase
        .from('cells')
        .select('*')
        .eq('id', id)
        .single();

      if (cellError) {
        throw new Error(`Erro ao buscar detalhes da célula: ${cellError.message}`);
      }

      if (!cellData) {
        throw new Error('Célula não encontrada');
      }

      setCell(cellData);

      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('cell_id', id);

      if (contactsError) {
        throw new Error(`Erro ao buscar contatos da célula: ${contactsError.message}`);
      }

      setContacts(contactsData || []);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    console.log('CellDetails: Initializing for cell ID:', id);
    mountedRef.current = true;
    fetchCellDetails();

    return () => {
      console.log('CellDetails: Cleaning up...');
      mountedRef.current = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando detalhes da célula...</span>
      </div>
    );
  }

  if (!cell) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card>
          <CardContent className="p-4">
            Célula não encontrada.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate('/cells')} className="flex items-center">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Células
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {cell.active ? (
              <Badge variant="default">Ativa</Badge>
            ) : (
              <Badge variant="destructive">Inativa</Badge>
            )}
            {cell.name}
          </CardTitle>
          <CardDescription>
            Detalhes e membros da célula
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700">Endereço</div>
              <div className="text-gray-500 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {cell.address}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Horário de Reunião</div>
              <div className="text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {new Date(`2000-01-01T${cell.meeting_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                ({['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][cell.meeting_day]})
              </div>
            </div>
            {cell.leader_id && (
              <div>
                <div className="text-sm font-medium text-gray-700">Líder</div>
                <div className="text-gray-500 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {cell.leader_id}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <CellQrCode cellId={cell.id} />
            <EditCellDialog 
              cell={cell} 
              onCellUpdated={fetchCellDetails}
              isOpen={editDialogOpen}
              onClose={() => setEditDialogOpen(false)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Membros da Célula
          </CardTitle>
          <CardDescription>
            Lista de membros pertencentes a esta célula
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Nenhum membro cadastrado nesta célula.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="border rounded-md p-3 bg-gray-50">
                  <div className="text-sm font-semibold text-gray-700">{contact.name}</div>
                  <div className="text-xs text-gray-500">
                    {contact.whatsapp ? contact.whatsapp : 'Sem WhatsApp'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
