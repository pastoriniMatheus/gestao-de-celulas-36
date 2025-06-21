
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useCellLeader } from '@/hooks/useCellLeader';

interface CellLeaderInfoProps {
  leaderId: string | null;
  className?: string;
}

export const CellLeaderInfo = ({ leaderId, className = "" }: CellLeaderInfoProps) => {
  const { leader, loading } = useCellLeader(leaderId);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!leader) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <User className="h-4 w-4" />
        <span className="text-sm">Sem líder definido</span>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Avatar className="h-6 w-6 border">
        <AvatarImage 
          src={leader.photo_url || ''} 
          alt={leader.name}
          onError={(e) => {
            console.error('Erro ao carregar foto do líder:', leader.photo_url);
            e.currentTarget.style.display = 'none';
          }}
        />
        <AvatarFallback className="text-xs font-semibold bg-blue-100 text-blue-700">
          {getInitials(leader.name)}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium text-gray-700">{leader.name}</span>
    </div>
  );
};
