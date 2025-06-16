
import { useState } from 'react';

export interface ContactFormData {
  name: string;
  whatsapp: string;
  email: string;
  city_id: string;
  neighborhood: string;
  referred_by: string;
  cell_id: string;
  birth_date: string;
  encounter_with_god: boolean;
}

export const useContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    whatsapp: '',
    email: '',
    city_id: '',
    neighborhood: '',
    referred_by: '',
    cell_id: '',
    birth_date: '',
    encounter_with_god: false,
  });

  const updateFormData = (updates: Partial<ContactFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      whatsapp: '',
      email: '',
      city_id: '',
      neighborhood: '',
      referred_by: '',
      cell_id: '',
      birth_date: '',
      encounter_with_god: false,
    });
  };

  return {
    formData,
    updateFormData,
    resetForm
  };
};
