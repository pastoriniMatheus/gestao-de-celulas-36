import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useContacts } from '@/hooks/useContacts';
import { useContactDialogData } from '@/hooks/useContactDialogData';
import { EncounterWithGodField } from './contact-form/EncounterWithGodField';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

// Função utilitária para buscar cidade de um bairro
function getCityFromNeighborhood(neighborhood: string, neighborhoods: any[], cities: any[]) {
  const nb = neighborhoods.find(nb => nb.name === neighborhood);
  if (nb) {
    return cities.find(city => city.id === nb.city_id);
  }
  return null;
}

export function EditContactDialog({ open, onOpenChange, contact }) {
  const { updateContact } = useContacts();

  // Dados de cidades/bairros para select
  const { neighborhoods, cities } = useContactDialogData(open);

  const [form, setForm] = useState({
    name: contact?.name ?? '',
    whatsapp: contact?.whatsapp ?? '',
    neighborhood: contact?.neighborhood ?? '', // Agora vai ser select
    city_id: contact?.city_id ?? '', // Salvar city_id para filtrar bairros
    age: contact?.age ?? '',
    encounter_with_god: contact?.encounter_with_god ?? false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Tenta descobrir o city_id se vier só o bairro
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
    });
    // eslint-disable-next-line
  }, [contact, neighborhoods]);

  // Filtrar bairros pela cidade selecionada
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
        encounter_with_god: !!form.encounter_with_god, // Agora será salvo
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
          <DialogTitle>Editar Membro/Visitante</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
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
                  neighborhood: "", // Limpa o bairro se trocar cidade
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
            {form.city_id ? (
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
            ) : (
               <Input
                  id="edit-contact-neighborhood"
                  placeholder="Digite o nome do bairro"
                  value={form.neighborhood}
                  onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
                  required
                />
            )}
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
        <DialogFooter>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
