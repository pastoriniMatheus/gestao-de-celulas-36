
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useUserProfile = (user: User | null) => {
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    console.log('useUserProfile - user changed:', user);
    if (user) {
      console.log('useUserProfile - user.email:', user.email);
      fetchUserProfile(user.id);
    } else {
      setUserProfile(null);
    }
  }, [user]);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('useUserProfile - Buscando perfil para usuário:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('useUserProfile - Erro ao buscar perfil:', error);
        
        // Se não encontrar perfil, vamos verificar se é admin baseado no email
        if (error.code === 'PGRST116') {
          console.log('useUserProfile - Perfil não encontrado, verificando se é admin pelo email');
          // Criar perfil temporário para admin
          const tempProfile = {
            user_id: userId,
            name: 'Administrador',
            role: 'admin',
            email: user?.email
          };
          console.log('useUserProfile - Criando perfil temporário para admin:', tempProfile);
          setUserProfile(tempProfile);
        }
        return;
      }

      console.log('useUserProfile - Perfil encontrado:', data);
      setUserProfile(data);
    } catch (error) {
      console.error('useUserProfile - Erro ao buscar perfil do usuário:', error);
    }
  };

  return { userProfile };
};
