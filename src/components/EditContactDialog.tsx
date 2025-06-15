
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
          <div>
            <Label htmlFor="edit-contact-name">Nome</Label>
            <Input
              id="edit-contact-name"
              placeholder="Nome"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="edit-contact-whatsapp">Whatsapp</Label>
            <Input
              id="edit-contact-whatsapp"
              placeholder="Whatsapp"
              value={form.whatsapp}
              onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="edit-contact-neighborhood">Bairro</Label>
            <Input
              id="edit-contact-neighborhood"
              placeholder="Bairro"
              value={form.neighborhood}
              onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
            />
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
