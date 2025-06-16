
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useContacts } from '@/hooks/useContacts';
import { useContactDialogData } from '@/hooks/useContactDialogData';
import { useCells } from '@/hooks/useCells';
import { EncounterWithGodField } from './contact-form/EncounterWithGodField';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserCheck, ArrowRightLeft } from 'lucide-react';
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
    age: contact?.age ?? '',
    encounter_with_god: contact?.encounter_with_god ?? false,
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
      age: contact?.age ?? '',
      encounter_with_god: contact?.encounter_with_god ?? false,
      status: contact?.status ?? 'pending',
      cell_id: contact?.cell_id ?? '', // Manter cell_id do contato
    });
  }, [contact, neighborhoods]);

  const filteredNeighborhoods = form.city_id
    ? neighborhoods.filter(nb => nb.city_id === form.city_id)
    : neighborhoods;

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('EditContactDialog: Salvando contato com dados:', form);
      
      // Preparar dados para atualização MANTENDO a célula e status originais
      const updateData = {
        name: form.name,
        whatsapp: form.whatsapp,
        neighborhood: form.neighborhood,
        city_id: form.city_id || null,
        age: form.age ? parseInt(form.age) : null,
        encounter_with_god: !!form.encounter_with_god,
        // IMPORTANTE: Manter status e célula originais ao salvar dados básicos
        status: contact.status, // Não alterar status no save básico
        cell_id: contact.cell_id, // Não alterar célula no save básico
      };

      console.log('EditContactDialog: Dados de atualização (mantendo status e célula):', updateData);
      
      await updateContact(contact.id, updateData);
      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso!",
      });
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
      
      // IMPORTANTE: Só alterar o status, mantendo a célula atual
      await updateContact(contact.id, {
        status: 'member',
        cell_id: contact.cell_id // Manter a célula atual
      });
      toast({
        title: "Sucesso",
        description: "Visitante transformado em membro com sucesso!",
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
      toast({
        title: "Sucesso",
        description: "Membro transferido para nova célula com sucesso!",
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

  // Determinar quais botões mostrar baseado no contexto e status
  const isVisitor = contact?.status === 'visitor';
  const isMember = contact?.status === 'member';
  const isPending = contact?.status === 'pending';
  
  // Botão "Transformar em Membro" só aparece para visitantes no contexto de células
  const showTransformButton = context === 'cell' && isVisitor;
  
  // Botão "Transferir Célula" aparece para membros quando a célula é diferente da atual
  const showTransferButton = isMember && contact?.cell_id !== form.cell_id && form.cell_id;
  
  // Campo de célula aparece para membros ou no contexto de contatos
  const showCellField = isMember || context === 'contacts';

  // Função para determinar o texto do badge baseado no status
  const getStatusBadge = () => {
    if (isMember) return { variant: 'default', text: 'Membro' };
    if (isVisitor) return { variant: 'secondary', text: 'Visitante' };
    return { variant: 'outline', text: 'Pendente' };
  };

  const statusBadge = getStatusBadge();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
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
              value={form.city_id || "no-city"}
              onValueChange={value => {
                setForm(f => ({
                  ...f,
                  city_id: value === "no-city" ? "" : value,
                  neighborhood: "",
                }));
              }}
            >
              <SelectTrigger id="edit-contact-city">
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-city">Selecione uma cidade</SelectItem>
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
              value={form.neighborhood || "no-neighborhood"}
              onValueChange={value =>
                setForm(f => ({
                  ...f,
                  neighborhood: value === "no-neighborhood" ? "" : value,
                }))
              }
            >
              <SelectTrigger id="edit-contact-neighborhood">
                <SelectValue placeholder="Selecione o bairro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-neighborhood">Selecione um bairro</SelectItem>
                {filteredNeighborhoods.map(nb => (
                  <SelectItem key={nb.id} value={nb.name}>
                    {nb.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campo de célula para membros ou contexto de contatos */}
          {showCellField && (
            <div>
              <Label htmlFor="edit-contact-cell">Célula</Label>
              <Select
                value={form.cell_id || "no-cell"}
                onValueChange={value =>
                  setForm(f => ({
                    ...f,
                    cell_id: value === "no-cell" ? "" : value,
                  }))
                }
              >
                <SelectTrigger id="edit-contact-cell">
                  <SelectValue placeholder="Selecione a célula" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-cell">Sem célula</SelectItem>
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
            <Label htmlFor="edit-contact-age">Idade</Label>
            <Input
              id="edit-contact-age"
              placeholder="Idade"
              type="number"
              min={0}
              value={form.age}
              onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
            />
          </div>
          <div>
            <EncounterWithGodField
              checked={!!form.encounter_with_god}
              onChange={checked =>
                setForm(f => ({ ...f, encounter_with_god: checked }))
              }
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2">
          {/* Botão para transformar visitante em membro - apenas no contexto de células */}
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

          {/* Botão para transferir membro de célula */}
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
