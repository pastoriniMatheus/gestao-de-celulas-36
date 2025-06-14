
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

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Erro na consulta do perfil:', error);
      return null;
    }
  };

  const createUserProfile = async (user: User, name?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          email: user.email || '',
          name: name || user.email?.split('@')[0] || 'Usuário',
          role: 'user',
          active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar perfil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Inicializando...');
    
    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && !userProfile) {
          // Buscar perfil apenas se não existe
          fetchUserProfile(session.user.id).then(profile => {
            if (!profile) {
              createUserProfile(session.user).then(newProfile => {
                setUserProfile(newProfile);
              });
            } else {
              setUserProfile(profile);
            }
          });
        } else if (!session?.user) {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Buscar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        
        fetchUserProfile(session.user.id).then(profile => {
          if (!profile) {
            createUserProfile(session.user).then(newProfile => {
              setUserProfile(newProfile);
              setLoading(false);
            });
          } else {
            setUserProfile(profile);
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Dependency array vazia para evitar loops

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Erro no signIn:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name
          }
        }
      });
      return { error };
    } catch (error) {
      console.error('Erro no signUp:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Iniciando logout...');
      
      // Limpar estados primeiro
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no signOut:', error);
      } else {
        console.log('Logout realizado com sucesso');
      }
    } catch (error) {
      console.error('Erro no signOut:', error);
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
