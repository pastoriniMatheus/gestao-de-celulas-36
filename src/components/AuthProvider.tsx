
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
  const [profileFetched, setProfileFetched] = useState(false);

  const fetchUserProfile = async (userId: string, userEmail?: string) => {
    // Evitar múltiplas tentativas de busca
    if (profileFetched) return null;

    try {
      console.log('Tentando buscar perfil para user_id:', userId);
      
      // Tentar buscar perfil por user_id primeiro
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Usar maybeSingle ao invés de single para evitar erros quando não há dados

      if (data) {
        console.log('Perfil encontrado por user_id:', data);
        setProfileFetched(true);
        return data;
      }

      // Se não encontrou por user_id, tentar por email
      if (userEmail && !error) {
        console.log('Buscando perfil por email:', userEmail);
        const { data: emailData, error: emailError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle();

        if (emailData) {
          console.log('Perfil encontrado por email:', emailData);
          setProfileFetched(true);
          return emailData;
        }

        if (emailError) {
          console.log('Erro ao buscar por email:', emailError);
        }
      }

      if (error) {
        console.log('Erro ao buscar perfil:', error);
        // Se for erro de RLS/recursão, definir um perfil básico temporário
        if (error.code === '42P17') {
          const tempProfile = {
            id: userId,
            user_id: userId,
            email: userEmail || 'unknown@email.com',
            name: userEmail?.split('@')[0] || 'Usuário',
            role: 'user',
            active: true
          };
          console.log('Criando perfil temporário devido a erro RLS:', tempProfile);
          setProfileFetched(true);
          return tempProfile;
        }
      }

      setProfileFetched(true);
      return null;
    } catch (error) {
      console.error('Erro crítico na busca do perfil:', error);
      setProfileFetched(true);
      return null;
    }
  };

  const createUserProfile = async (user: User, name?: string) => {
    if (profileFetched) return null;

    try {
      console.log('Tentando criar perfil para:', user.email);
      
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
        .maybeSingle();

      if (error) {
        console.error('Erro ao criar perfil:', error);
        // Se for erro de RLS, criar perfil temporário
        if (error.code === '42P17') {
          const tempProfile = {
            id: user.id,
            user_id: user.id,
            email: user.email || '',
            name: name || user.email?.split('@')[0] || 'Usuário',
            role: 'user',
            active: true
          };
          console.log('Perfil temporário criado devido a erro RLS');
          setProfileFetched(true);
          return tempProfile;
        }
        return null;
      }

      console.log('Perfil criado com sucesso:', data);
      setProfileFetched(true);
      return data;
    } catch (error) {
      console.error('Erro crítico ao criar perfil:', error);
      setProfileFetched(true);
      return null;
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Inicializando...');
    
    let mounted = true;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user && !profileFetched) {
        console.log('Usuário logado, buscando perfil...');
        
        // Usar setTimeout para evitar problemas de recursão
        setTimeout(async () => {
          if (!mounted) return;
          
          const profile = await fetchUserProfile(session.user.id, session.user.email);
          
          if (!profile && mounted) {
            console.log('Perfil não encontrado, tentando criar...');
            const newProfile = await createUserProfile(session.user);
            if (mounted) {
              setUserProfile(newProfile);
            }
          } else if (mounted) {
            setUserProfile(profile);
          }
          
          if (mounted) {
            setLoading(false);
          }
        }, 100);
      } else {
        setUserProfile(null);
        setProfileFetched(false);
        setLoading(false);
      }
    };

    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Buscar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Sessão inicial encontrada:', session?.user?.email || 'nenhuma');
      if (!session) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setProfileFetched(false);
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
      setProfileFetched(false);
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
        setLoading(false);
      }
      
      return { error };
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
      
      // Limpar estados primeiro
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setProfileFetched(false);
      
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
