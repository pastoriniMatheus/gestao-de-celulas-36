
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Tentando fazer login com:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Erro no login:', error);
        setLoading(false);
      }
      
      return { error };
    } catch (error) {
      console.error('Erro crítico no signIn:', error);
      setLoading(false);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      console.log('Tentando registrar usuário:', email);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name
          }
        }
      });
      
      if (error) {
        console.error('Erro no registro:', error);
        setLoading(false);
        return { error };
      }
      
      setLoading(false);
      return { error: null };
    } catch (error) {
      console.error('Erro crítico no signUp:', error);
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Iniciando logout...');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no signOut:', error);
      } else {
        console.log('Logout realizado com sucesso');
      }
    } catch (error) {
      console.error('Erro crítico no signOut:', error);
    } finally {
      setLoading(false);
    }
  };

  return { signIn, signUp, signOut, loading };
};
