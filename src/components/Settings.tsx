
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, Shield } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { SystemSettingsManager } from './SystemSettingsManager';

export const Settings = () => {
  const { userProfile, loading: authLoading } = useAuth();

  if (authLoading) {
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

  const canManageSettings = userProfile?.role === 'admin';

  if (!canManageSettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Acesso Negado
          </CardTitle>
          <CardDescription>
            Você não tem permissão para acessar as configurações do sistema.
            {userProfile ? ` Seu papel atual: ${userProfile.role}` : ' Usuário não identificado'}
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
