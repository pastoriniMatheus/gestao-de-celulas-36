
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useUserProfile = (user: User | null) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      console.log('useUserProfile - Buscando perfil para usuário:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('useUserProfile - Erro ao buscar perfil:', error);
        
        // Se não encontrar perfil, criar um novo
        if (error.code === 'PGRST116') {
          console.log('useUserProfile - Perfil não encontrado, criando novo perfil');
          await createUserProfile(userId);
          return;
        }
        return;
      }

      console.log('useUserProfile - Perfil encontrado:', data);
      setUserProfile(data);
    } catch (error) {
      console.error('useUserProfile - Erro ao buscar perfil do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const newProfile = {
        user_id: userId,
        name: user?.email?.split('@')[0] || 'Usuário',
        email: user?.email || '',
        role: 'user'
      };

      console.log('useUserProfile - Criando novo perfil:', newProfile);

      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) {
        console.error('useUserProfile - Erro ao criar perfil:', error);
        return;
      }

      console.log('useUserProfile - Perfil criado com sucesso:', data);
      setUserProfile(data);
    } catch (error) {
      console.error('useUserProfile - Erro ao criar perfil:', error);
    }
  };

  const refreshProfile = () => {
    if (user) {
      fetchUserProfile(user.id);
    }
  };

  return { userProfile, loading, refreshProfile };
};
