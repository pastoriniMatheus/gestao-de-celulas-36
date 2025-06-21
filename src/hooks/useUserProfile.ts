
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
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('useUserProfile - Erro ao buscar perfil:', error);
        return;
      }

      if (!data) {
        console.log('useUserProfile - Perfil não encontrado, criando perfil básico');
        
        // Tentar criar perfil se não existir
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            name: 'Usuário',
            email: user?.email || '',
            role: 'user',
            active: true
          })
          .select()
          .maybeSingle();

        if (createError) {
          console.error('Erro ao criar perfil:', createError);
          // Se falhar ao criar, usar perfil temporário
          const tempProfile = {
            user_id: userId,
            name: 'Usuário',
            role: 'user',
            email: user?.email
          };
          setUserProfile(tempProfile);
        } else {
          console.log('Perfil criado com sucesso:', newProfile);
          setUserProfile(newProfile);
        }
      } else {
        console.log('useUserProfile - Perfil encontrado:', data);
        setUserProfile(data);
      }
    } catch (error) {
      console.error('useUserProfile - Erro ao buscar perfil do usuário:', error);
    }
  };

  return { userProfile };
};
