
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, Shield } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { SystemSettingsManager } from './SystemSettingsManager';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const Settings = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const ensureUserProfile = async () => {
      if (!user || authLoading) return;
      
      try {
        console.log('Verificando perfil do usuário:', user.id);
        
        // Verificar se perfil existe
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('Perfil existente:', existingProfile);

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Erro ao buscar perfil:', fetchError);
          return;
        }

        // Se não existe perfil, criar um como admin
        if (!existingProfile) {
          console.log('Criando perfil admin para usuário:', user.id);
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              user_id: user.id,
              email: user.email || '',
              name: user.email?.split('@')[0] || 'Admin',
              role: 'admin'
            }])
            .select()
            .single();

          if (createError) {
            console.error('Erro ao criar perfil:', createError);
            toast({
              title: "Erro",
              description: "Erro ao criar perfil de usuário",
              variant: "destructive",
            });
          } else {
            console.log('Perfil criado com sucesso:', newProfile);
            toast({
              title: "Sucesso",
              description: "Perfil de administrador criado",
            });
            // Recarregar a página para atualizar o contexto de auth
            window.location.reload();
          }
        }
      } catch (error) {
        console.error('Erro crítico ao verificar perfil:', error);
      } finally {
        setCheckingProfile(false);
      }
    };

    ensureUserProfile();
  }, [user, authLoading]);

  if (authLoading || checkingProfile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando configurações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Acesso Negado
          </CardTitle>
          <CardDescription>
            Você precisa estar logado para acessar as configurações.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Verificar se é admin por email ou por perfil
  const isAdmin = userProfile?.role === 'admin' || user.email === 'admin@sistema.com';

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Acesso Negado
          </CardTitle>
          <CardDescription>
            Você não tem permissão para acessar as configurações do sistema.
            {userProfile ? ` Seu papel atual: ${userProfile.role}` : ' Perfil não encontrado'}
            <br />
            Email atual: {user.email}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <SystemSettingsManager />
    </div>
  );
};
