
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ContactAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ContactAvatar: React.FC<ContactAvatarProps> = ({
  name,
  photoUrl,
  size = 'md',
  className = ''
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-xs';
      case 'lg':
        return 'w-16 h-16 text-lg';
      default:
        return 'w-10 h-10 text-sm';
    }
  };

  return (
    <Avatar className={`${getSizeClasses(size)} ${className}`}>
      <AvatarImage src={photoUrl || ''} alt={name} />
      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-400 text-white font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
};
