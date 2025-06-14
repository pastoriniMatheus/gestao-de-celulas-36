
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContactFormData } from '@/hooks/useContactForm';

interface Cell {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  name: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
}

interface ReferralAndCellFieldsProps {
  formData: ContactFormData;
  onUpdateFormData: (updates: Partial<ContactFormData>) => void;
  cells: Cell[];
  contacts: Contact[];
  profiles: Profile[];
}

export const ReferralAndCellFields = ({ 
  formData, 
  onUpdateFormData, 
  cells, 
  contacts, 
  profiles 
}: ReferralAndCellFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="referred_by">Quem Indicou</Label>
        <Select 
          value={formData.referred_by} 
          onValueChange={(value) => onUpdateFormData({ referred_by: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione quem indicou (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum</SelectItem>
            {profiles.map((profile) => (
              <SelectItem key={`profile-${profile.id}`} value={profile.id}>
                {profile.name} (Usuário)
              </SelectItem>
            ))}
            {contacts.map((contact) => (
              <SelectItem key={`contact-${contact.id}`} value={contact.id}>
                {contact.name} (Contato)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="cell">Célula</Label>
        <Select 
          value={formData.cell_id} 
          onValueChange={(value) => onUpdateFormData({ cell_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a célula (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            {cells.map((cell) => (
              <SelectItem key={cell.id} value={cell.id}>
                {cell.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
