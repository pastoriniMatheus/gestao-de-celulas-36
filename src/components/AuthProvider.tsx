
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

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
    console.log('AuthProvider: Inicializando...');
    
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Primeiro, verificar sessão existente
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão inicial:', error);
        }

        if (mounted) {
          console.log('Sessão inicial:', initialSession?.user?.email || 'nenhuma');
          setSession(initialSession);
          setUser(initialSession?.user ?? null);

          if (initialSession?.user) {
            // Buscar perfil usando setTimeout para evitar loop
            setTimeout(async () => {
              if (mounted) {
                const profile = await fetchUserProfile(initialSession.user.id, initialSession.user.email);
                if (mounted) {
                  setUserProfile(profile);
                }
              }
            }, 0);
          }

          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Erro na inicialização auth:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Configurar listener APENAS após inicialização
    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!mounted) return;

          console.log('Auth state changed:', event, session?.user?.email);
          
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user && event !== 'TOKEN_REFRESHED') {
            // Usar setTimeout para evitar loops
            setTimeout(async () => {
              if (mounted) {
                const profile = await fetchUserProfile(session.user.id, session.user.email);
                if (mounted) {
                  setUserProfile(profile);
                }
              }
            }, 0);
          } else if (!session?.user) {
            setUserProfile(null);
          }
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

      if (data.user) {
        setTimeout(async () => {
          await fetchUserProfile(data.user.id, email);
        }, 0);
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
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Erro crítico no signOut:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    userProfile,
    signIn,
    signUp,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
