
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useContacts } from '@/hooks/useContacts';
import { useContactDialogData } from '@/hooks/useContactDialogData';
import { EncounterWithGodField } from './contact-form/EncounterWithGodField';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function EditContactDialog({ open, onOpenChange, contact }) {
  const { updateContact } = useContacts();
  const { neighborhoods, cities } = useContactDialogData(open);

  const [form, setForm] = useState({
    name: contact?.name ?? '',
    whatsapp: contact?.whatsapp ?? '',
    neighborhood: contact?.neighborhood ?? '',
    city_id: contact?.city_id ?? '',
    age: contact?.age ?? '',
    encounter_with_god: contact?.encounter_with_god ?? false,
    status: contact?.status ?? 'pending',
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
    });
  }, [contact, neighborhoods]);

  const filteredNeighborhoods = form.city_id
    ? neighborhoods.filter(nb => nb.city_id === form.city_id)
    : neighborhoods;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContact(contact.id, {
        name: form.name,
        whatsapp: form.whatsapp,
        neighborhood: form.neighborhood,
        city_id: form.city_id || null,
        age: form.age ? parseInt(form.age) : null,
        encounter_with_god: !!form.encounter_with_god,
        status: form.status,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleTransformToMember = async () => {
    setSaving(true);
    try {
      await updateContact(contact.id, {
        status: 'member'
      });
      toast({
        title: "Sucesso",
        description: "Visitante transformado em membro com sucesso!",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao transformar visitante em membro",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar {form.status === 'member' ? 'Membro' : 'Visitante'}
            <Badge variant={form.status === 'member' ? 'default' : 'secondary'}>
              {form.status === 'member' ? 'Membro' : 'Visitante'}
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
          {form.status !== 'member' && (
            <Button 
              onClick={handleTransformToMember} 
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              {saving ? "Transformando..." : "Transformar em Membro"}
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
