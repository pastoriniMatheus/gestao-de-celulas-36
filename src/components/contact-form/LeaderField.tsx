
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface LeaderFieldProps {
  value: string;
  onChange: (value: string) => void;
  profiles: Profile[];
}

export const LeaderField: React.FC<LeaderFieldProps> = ({ value, onChange, profiles }) => {
  // Filtrar apenas líderes do sistema
  const leaders = profiles.filter(profile => 
    profile.role === 'admin' || profile.role === 'leader'
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="leader" className="flex items-center gap-2 text-sm font-medium">
        <Users className="w-4 h-4 text-blue-600" />
        Líder de Discipulado
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="leader">
          <SelectValue placeholder="Selecione um líder" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Nenhum líder</SelectItem>
          {leaders.map(leader => (
            <SelectItem key={leader.id} value={leader.id}>
              {leader.name} ({leader.email})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
