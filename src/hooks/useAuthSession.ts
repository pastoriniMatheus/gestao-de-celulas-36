
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAuthSession: Inicializando...');
    
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão inicial:', error);
        }

        if (mounted) {
          console.log('Sessão inicial:', initialSession?.user?.email || 'nenhuma');
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro na inicialização auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!mounted) return;

          console.log('Auth state changed:', event, session?.user?.email);
          
          setSession(session);
          setUser(session?.user ?? null);
        }
      );

      return subscription;
    };

    initializeAuth().then(() => {
      if (mounted) {
        const subscription = setupAuthListener();
        
        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return { user, session, loading };
};
