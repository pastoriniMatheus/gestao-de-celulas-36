
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useUserProfile = (user: User | null) => {
  const [userProfile, setUserProfile] = useState<any | null>(null);

  const fetchUserProfile = async (userId: string, userEmail?: string) => {
    try {
      console.log('Buscando perfil para:', userEmail);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      if (!data && userEmail) {
        console.log('Perfil não encontrado, criando...');
        const name = userEmail.split('@')[0];
        
        let role = 'user';
        if (userEmail.includes('admin')) {
          role = 'admin';
        } else if (userEmail.includes('lider')) {
          role = 'leader';
        }
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .upsert({
            user_id: userId,
            email: userEmail,
            name: name,
            role: role,
            active: true
          })
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar perfil:', createError);
          return null;
        }

        return newProfile;
      }

      console.log('Perfil encontrado:', data);
      return data;
    } catch (error) {
      console.error('Erro crítico na busca do perfil:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      setTimeout(async () => {
        const profile = await fetchUserProfile(user.id, user.email);
        setUserProfile(profile);
      }, 0);
    } else {
      setUserProfile(null);
    }
  }, [user]);

  return { userProfile, fetchUserProfile };
};
