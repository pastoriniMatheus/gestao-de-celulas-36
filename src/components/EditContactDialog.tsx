
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useContacts } from '@/hooks/useContacts';
import { useContactDialogData } from '@/hooks/useContactDialogData';
import { useCells } from '@/hooks/useCells';
import { EncounterWithGodField } from './contact-form/EncounterWithGodField';
import { BaptizedField } from './contact-form/BaptizedField';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserCheck, ArrowRightLeft, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EditContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: any;
  context?: 'cell' | 'contacts';
}

export function EditContactDialog({ open, onOpenChange, contact, context = 'contacts' }: EditContactDialogProps) {
  const { updateContact } = useContacts();
  const { neighborhoods, cities } = useContactDialogData(open);
  const { cells, fetchCells } = useCells();

  const [form, setForm] = useState({
    name: contact?.name ?? '',
    whatsapp: contact?.whatsapp ?? '',
    neighborhood: contact?.neighborhood ?? '',
    city_id: contact?.city_id ?? '',
    birth_date: contact?.birth_date ?? '',
    encounter_with_god: contact?.encounter_with_god ?? false,
    baptized: contact?.baptized ?? false,
    status: contact?.status ?? 'pending',
    cell_id: contact?.cell_id ?? '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let city_id = contact?.city_id;
    if (!city_id && contact?.neighborhood && neighborhoods.length > 0) {
      const nb = neighborhoods.find(nb => nb.name === contact.neighborhood);
      city_id = nb?.city_id ?? '';
    }
    setForm({
      name: contact?.name ?? '',
      whatsapp: contact?.whatsapp ?? '',
      neighborhood: contact?.neighborhood ?? '',
      city_id: city_id ?? '',
      birth_date: contact?.birth_date ?? '',
      encounter_with_god: contact?.encounter_with_god ?? false,
      baptized: contact?.baptized ?? false,
      status: contact?.status ?? 'pending',
      cell_id: contact?.cell_id ?? '',
    });
  }, [contact, neighborhoods]);

  const filteredNeighborhoods = form.city_id
    ? neighborhoods.filter(nb => nb.city_id === form.city_id)
    : neighborhoods;

  const handleSave = async () => {
    if (!form.name || !form.whatsapp || !form.neighborhood) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios (Nome, WhatsApp e Bairro).",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      console.log('EditContactDialog: Salvando contato com dados:', form);
      
      const updateData = {
        name: form.name,
        whatsapp: form.whatsapp,
        neighborhood: form.neighborhood,
        city_id: form.city_id || null,
        birth_date: form.birth_date || null,
        encounter_with_god: !!form.encounter_with_god,
        baptized: !!form.baptized,
        // Manter os valores atuais do contato para estes campos
        status: contact.status,
        cell_id: contact.cell_id,
      };

      console.log('EditContactDialog: Dados de atualização:', updateData);
      
      await updateContact(contact.id, updateData);
      onOpenChange(false);
    } catch (error) {
      console.error('EditContactDialog: Erro ao atualizar contato:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar contato",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTransformToMember = async () => {
    setSaving(true);
    try {
      console.log('EditContactDialog: Transformando visitante em membro');
      
      await updateContact(contact.id, {
        status: 'member'
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('EditContactDialog: Erro ao transformar em membro:', error);
      toast({
        title: "Erro",
        description: "Erro ao transformar visitante em membro",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTransferCell = async () => {
    setSaving(true);
    try {
      console.log('EditContactDialog: Transferindo membro para nova célula');
      
      await updateContact(contact.id, {
        cell_id: form.cell_id || null,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('EditContactDialog: Erro ao transferir célula:', error);
      toast({
        title: "Erro",
        description: "Erro ao transferir membro para célula",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getCellName = (cellId: string) => {
    const cell = cells.find(c => c.id === cellId);
    return cell ? cell.name : 'Célula não encontrada';
  };

  const isVisitor = contact?.status === 'visitor';
  const isMember = contact?.status === 'member';
  const isPending = contact?.status === 'pending';
  
  const showTransformButton = context === 'cell' && isVisitor;
  const showTransferButton = isMember && contact?.cell_id !== form.cell_id && form.cell_id;
  const showCellField = isMember || context === 'contacts';

  const getStatusBadge = () => {
    if (isMember) return { variant: 'default', text: 'Membro' };
    if (isVisitor) return { variant: 'secondary', text: 'Visitante' };
    return { variant: 'outline', text: 'Pendente' };
  };

  const statusBadge = getStatusBadge();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar {statusBadge.text}
            <Badge variant={statusBadge.variant as any}>
              {statusBadge.text}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-contact-name">Nome *</Label>
            <Input
              id="edit-contact-name"
              placeholder="Nome"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-contact-whatsapp">Whatsapp *</Label>
            <Input
              id="edit-contact-whatsapp"
              placeholder="Whatsapp"
              value={form.whatsapp}
              onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-contact-city">Cidade</Label>
            <Select
              value={form.city_id || "placeholder-city"}
              onValueChange={value => {
                setForm(f => ({
                  ...f,
                  city_id: value === "placeholder-city" ? "" : value,
                  neighborhood: "",
                }));
              }}
            >
              <SelectTrigger id="edit-contact-city">
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder-city">Selecione uma cidade</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name} - {city.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-contact-neighborhood">Bairro *</Label>
            <Select
              value={form.neighborhood || "placeholder-neighborhood"}
              onValueChange={value =>
                setForm(f => ({
                  ...f,
                  neighborhood: value === "placeholder-neighborhood" ? "" : value,
                }))
              }
            >
              <SelectTrigger id="edit-contact-neighborhood">
                <SelectValue placeholder="Selecione o bairro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder-neighborhood">Selecione um bairro</SelectItem>
                {filteredNeighborhoods.map(nb => (
                  <SelectItem key={nb.id} value={nb.name}>
                    {nb.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showCellField && (
            <div>
              <Label htmlFor="edit-contact-cell">Célula</Label>
              <Select
                value={form.cell_id || "placeholder-cell"}
                onValueChange={value =>
                  setForm(f => ({
                    ...f,
                    cell_id: value === "placeholder-cell" ? "" : value,
                  }))
                }
              >
                <SelectTrigger id="edit-contact-cell">
                  <SelectValue placeholder="Selecione a célula" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder-cell">Sem célula</SelectItem>
                  {cells.map(cell => (
                    <SelectItem key={cell.id} value={cell.id}>
                      {cell.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {contact.cell_id && (
                <p className="text-xs text-gray-500 mt-1">
                  Atual: {getCellName(contact.cell_id)}
                </p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="edit-contact-birth-date">Data de Nascimento</Label>
            <Input
              id="edit-contact-birth-date"
              type="date"
              value={form.birth_date}
              onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <EncounterWithGodField
              checked={!!form.encounter_with_god}
              onChange={checked =>
                setForm(f => ({ ...f, encounter_with_god: checked }))
              }
            />
            <BaptizedField
              checked={!!form.baptized}
              onChange={checked =>
                setForm(f => ({ ...f, baptized: checked }))
              }
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2">
          {showTransformButton && (
            <Button 
              onClick={handleTransformToMember} 
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              {saving ? "Transformando..." : "Transformar em Membro"}
            </Button>
          )}

          {showTransferButton && (
            <Button 
              onClick={handleTransferCell} 
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              {saving ? "Transferindo..." : "Transferir para Nova Célula"}
            </Button>
          )}

          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
