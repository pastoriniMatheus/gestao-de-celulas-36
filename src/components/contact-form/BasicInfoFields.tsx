
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContactFormData } from '@/hooks/useContactForm';

interface BasicInfoFieldsProps {
  formData: ContactFormData;
  onUpdateFormData: (updates: Partial<ContactFormData>) => void;
}

export const BasicInfoFields = ({ formData, onUpdateFormData }: BasicInfoFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="name">Nome Completo *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onUpdateFormData({ name: e.target.value })}
          placeholder="Digite o nome completo"
          required
        />
      </div>
      <div>
        <Label htmlFor="whatsapp">WhatsApp *</Label>
        <Input
          id="whatsapp"
          value={formData.whatsapp}
          onChange={(e) => onUpdateFormData({ whatsapp: e.target.value })}
          placeholder="(11) 99999-9999"
          required
        />
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onUpdateFormData({ email: e.target.value })}
          placeholder="email@exemplo.com"
        />
      </div>
    </>
  );
};
