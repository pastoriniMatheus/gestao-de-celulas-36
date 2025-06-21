import { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuthActions } from '@/hooks/useAuthActions';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<{ error: any }>;
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
  const { user, session, loading: sessionLoading } = useAuthSession();
  const { userProfile, loading: profileLoading, refreshProfile } = useUserProfile(user);
  const { signIn, signUp, signOut, resetPassword, loading: actionLoading } = useAuthActions();

  const loading = sessionLoading || actionLoading || profileLoading;

  const value = {
    user,
    userProfile,
    loading: loading || profileLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
