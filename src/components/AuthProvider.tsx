
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
      console.log('Buscando perfil para user_id:', userId);
      
      // Primeiro tentar buscar por user_id
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code === 'PGRST116') {
        console.log('Perfil não encontrado por user_id, buscando por email...');
        // Se não encontrar por user_id, tentar por email
        const userEmail = user?.email;
        if (userEmail) {
          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('email', userEmail)
            .single();
          
          data = result.data;
          error = result.error;
        }
      }
      
      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }
      
      console.log('Perfil encontrado:', data);
      return data;
    } catch (error) {
      console.error('Erro na consulta do perfil:', error);
      return null;
    }
  };

  const createUserProfile = async (user: User, name?: string) => {
    try {
      console.log('Criando perfil para usuário:', user.email);
      
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

      console.log('Perfil criado:', data);
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
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('Usuário logado, buscando perfil...');
          const profile = await fetchUserProfile(session.user.id);
          
          if (!profile) {
            console.log('Perfil não encontrado, criando novo...');
            const newProfile = await createUserProfile(session.user);
            setUserProfile(newProfile);
          } else {
            setUserProfile(profile);
          }
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Buscar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Sessão inicial:', session?.user?.email);
      if (!session) {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
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
      }
      
      return { error };
    } catch (error) {
      console.error('Erro no signIn:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      console.log('Tentando registrar usuário:', email);
      
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
      
      if (error) {
        console.error('Erro no registro:', error);
      }
      
      return { error };
    } catch (error) {
      console.error('Erro no signUp:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Iniciando logout...');
      setLoading(true);
      
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
