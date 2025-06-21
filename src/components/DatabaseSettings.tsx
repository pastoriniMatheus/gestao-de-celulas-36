
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Database, Save, Download, Upload, TestTube, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useSystemConfig } from '@/hooks/useSystemConfig';

interface DatabaseConfig {
  project_url: string;
  anon_key: string;
  service_role_key: string;
  project_id: string;
  database_url: string;
}

export const DatabaseSettings = () => {
  const { config, updateConfig } = useSystemConfig();
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>({
    project_url: 'https://paaffmonmovorgyantux.supabase.co',
    anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhYWZmbW9ubW92b3JneWFudHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODI4MDcsImV4cCI6MjA2NTQ1ODgwN30.FfBjzdWg4g6T5sAP81iQaQsPad95T91g9uv9A_F6wiY',
    service_role_key: '',
    project_id: 'paaffmonmovorgyantux',
    database_url: ''
  });

  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Carregar configurações salvas do sistema
    const loadDatabaseConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('key, value')
          .in('key', ['database_config']);

        if (!error && data && data.length > 0) {
          const savedConfig = data[0].value as DatabaseConfig;
          setDbConfig(prev => ({ ...prev, ...savedConfig }));
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do banco:', error);
      }
    };

    loadDatabaseConfig();
  }, []);

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      // Testar conexão básica com o Supabase
      const { data, error } = await supabase
        .from('system_settings')
        .select('count(*)')
        .limit(1);

      if (error) {
        throw error;
      }

      setConnectionStatus('success');
      toast({
        title: "Sucesso",
        description: "Conexão com o banco de dados testada com sucesso! - Sistema Matheus Pastorini"
      });
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setConnectionStatus('error');
      toast({
        title: "Erro",
        description: "Falha ao conectar com o banco de dados",
        variant: "destructive"
      });
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      await updateConfig({
        database_config: dbConfig
      });

      toast({
        title: "Sucesso",
        description: "Configurações do banco salvas com sucesso! - Sistema Matheus Pastorini"
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações do banco",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const downloadDatabase = async () => {
    setDownloading(true);
    try {
      // Listar todas as tabelas principais
      const tables = [
        'contacts', 'cells', 'profiles', 'cities', 'neighborhoods', 
        'pipeline_stages', 'events', 'qr_codes', 'message_templates',
        'webhook_configs', 'system_settings'
      ];

      const backup: any = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        system: 'Sistema Matheus Pastorini',
        data: {}
      };

      // Exportar dados de cada tabela
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*');

          if (!error && data) {
            backup.data[table] = data;
            console.log(`Exportados ${data.length} registros da tabela ${table}`);
          }
        } catch (error) {
          console.warn(`Erro ao exportar tabela ${table}:`, error);
        }
      }

      // Baixar arquivo JSON
      const blob = new Blob([JSON.stringify(backup, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-database-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Backup do banco de dados baixado com sucesso! - Sistema Matheus Pastorini"
      });
    } catch (error) {
      console.error('Erro ao fazer backup:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer backup do banco de dados",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const uploadDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (!backup.data || typeof backup.data !== 'object') {
        throw new Error('Formato de backup inválido');
      }

      let restoredTables = 0;
      let totalRecords = 0;

      // Restaurar dados para cada tabela
      for (const [table, records] of Object.entries(backup.data)) {
        if (Array.isArray(records) && records.length > 0) {
          try {
            // Primeiro, limpar dados existentes (cuidado!)
            const { error: deleteError } = await supabase
              .from(table)
              .delete()
              .neq('id', '00000000-0000-0000-0000-000000000000');

            if (deleteError) {
              console.warn(`Aviso ao limpar tabela ${table}:`, deleteError);
            }

            // Inserir novos dados
            const { error: insertError } = await supabase
              .from(table)
              .insert(records);

            if (!insertError) {
              restoredTables++;
              totalRecords += records.length;
              console.log(`Restaurados ${records.length} registros na tabela ${table}`);
            } else {
              console.error(`Erro ao restaurar tabela ${table}:`, insertError);
            }
          } catch (error) {
            console.warn(`Erro ao processar tabela ${table}:`, error);
          }
        }
      }

      toast({
        title: "Sucesso",
        description: `Banco restaurado! ${restoredTables} tabelas e ${totalRecords} registros - Sistema Matheus Pastorini`
      });
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      toast({
        title: "Erro",
        description: "Erro ao restaurar backup do banco de dados",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Limpar input
      event.target.value = '';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'Testando...';
      case 'success':
        return 'Conectado';
      case 'error':
        return 'Erro na conexão';
      default:
        return 'Não testado';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Configurações do Banco de Dados
        </CardTitle>
        <CardDescription>
          Configure a conexão com o Supabase e gerencie backups do banco de dados - Sistema Matheus Pastorini
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status da Conexão */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">Status da Conexão:</span>
            <Badge variant={connectionStatus === 'success' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}>
              {getStatusText()}
            </Badge>
          </div>
          <Button 
            onClick={testConnection} 
            disabled={connectionStatus === 'testing'}
            variant="outline"
            size="sm"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Testar Conexão
          </Button>
        </div>

        {/* Configurações de Conexão */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configurações de Conexão</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project-url">URL do Projeto</Label>
              <Input
                id="project-url"
                value={dbConfig.project_url}
                onChange={(e) => setDbConfig(prev => ({ ...prev, project_url: e.target.value }))}
                placeholder="https://xxx.supabase.co"
              />
            </div>

            <div>
              <Label htmlFor="project-id">ID do Projeto</Label>
              <Input
                id="project-id"
                value={dbConfig.project_id}
                onChange={(e) => setDbConfig(prev => ({ ...prev, project_id: e.target.value }))}
                placeholder="projeto-id"
              />
            </div>

            <div>
              <Label htmlFor="anon-key">Chave Anônima</Label>
              <Input
                id="anon-key"
                type="password"
                value={dbConfig.anon_key}
                onChange={(e) => setDbConfig(prev => ({ ...prev, anon_key: e.target.value }))}
                placeholder="eyJ..."
              />
            </div>

            <div>
              <Label htmlFor="service-key">Chave de Serviço (Opcional)</Label>
              <Input
                id="service-key"
                type="password"
                value={dbConfig.service_role_key}
                onChange={(e) => setDbConfig(prev => ({ ...prev, service_role_key: e.target.value }))}
                placeholder="eyJ..."
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="database-url">URL do Banco (Opcional)</Label>
              <Input
                id="database-url"
                value={dbConfig.database_url}
                onChange={(e) => setDbConfig(prev => ({ ...prev, database_url: e.target.value }))}
                placeholder="postgresql://..."
              />
            </div>
          </div>

          <Button 
            onClick={saveConfiguration} 
            disabled={saving}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>

        <Separator />

        {/* Backup e Restauração */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Backup e Restauração</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium">Fazer Backup</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Baixa um arquivo JSON com todos os dados do banco
                </p>
                <Button 
                  onClick={downloadDatabase} 
                  disabled={downloading}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading ? 'Baixando...' : 'Baixar Banco'}
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium">Restaurar Backup</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Carrega dados de um arquivo de backup
                </p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={uploadDatabase}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button 
                    disabled={uploading}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Carregando...' : 'Carregar Backup'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>
              <strong>Atenção:</strong> Restaurar um backup irá substituir todos os dados atuais do banco de dados.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
