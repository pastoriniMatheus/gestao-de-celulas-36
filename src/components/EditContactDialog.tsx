
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useContacts } from '@/hooks/useContacts';

export function EditContactDialog({ open, onOpenChange, contact }) {
  const { updateContact } = useContacts();
  const [form, setForm] = useState({
    name: contact?.name ?? '',
    whatsapp: contact?.whatsapp ?? '',
    neighborhood: contact?.neighborhood ?? '',
    age: contact?.age ?? '',
  });
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setForm({
      name: contact?.name ?? '',
      whatsapp: contact?.whatsapp ?? '',
      neighborhood: contact?.neighborhood ?? '',
      age: contact?.age ?? '',
    });
  }, [contact]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContact(contact.id, {
        name: form.name,
        whatsapp: form.whatsapp,
        neighborhood: form.neighborhood,
        age: form.age ? parseInt(form.age) : null
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Membro</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            label="Nome"
            placeholder="Nome"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Whatsapp"
            placeholder="Whatsapp"
            value={form.whatsapp}
            onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
          />
          <Input
            label="Bairro"
            placeholder="Bairro"
            value={form.neighborhood}
            onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
          />
          <Input
            label="Idade"
            placeholder="Idade"
            type="number"
            min={0}
            value={form.age}
            onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
