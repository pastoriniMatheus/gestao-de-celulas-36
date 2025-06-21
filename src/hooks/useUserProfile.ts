
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useUserProfile = (user: User | null) => {
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    console.log('useUserProfile - user changed:', user?.id);
    if (user) {
      fetchUserProfile(user.id, user.email);
    } else {
      setUserProfile(null);
    }
  }, [user]);

  const fetchUserProfile = async (userId: string, userEmail: string | undefined) => {
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
        
        // Criar perfil básico
        const basicProfile = {
          user_id: userId,
          name: 'Usuário',
          role: 'user',
          email: userEmail || ''
        };

        try {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert(basicProfile)
            .select()
            .maybeSingle();

          if (createError) {
            console.error('Erro ao criar perfil:', createError);
            // Usar perfil temporário se falhar ao criar
            setUserProfile(basicProfile);
          } else {
            console.log('Perfil criado com sucesso:', newProfile);
            setUserProfile(newProfile);
          }
        } catch (createErr) {
          console.error('Exceção ao criar perfil:', createErr);
          setUserProfile(basicProfile);
        }
      } else {
        console.log('useUserProfile - Perfil encontrado:', data);
        setUserProfile(data);
      }
    } catch (error) {
      console.error('useUserProfile - Erro ao buscar perfil do usuário:', error);
      // Definir perfil básico em caso de erro
      setUserProfile({
        user_id: userId,
        name: 'Usuário',
        role: 'user',
        email: userEmail || ''
      });
    }
  };

  return { userProfile };
};
