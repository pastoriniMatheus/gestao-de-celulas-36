
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Image, Palette, Database } from 'lucide-react';
import { SystemSettingsManager } from './SystemSettingsManager';
import { AppearanceSettings } from './AppearanceSettings';
import { LogoUploadSettings } from './LogoUploadSettings';

export const Settings = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <SettingsIcon className="h-6 w-6 text-purple-600" />
            Configurações do Sistema
          </CardTitle>
          <CardDescription className="text-base">
            Configure as preferências e aparência do sistema
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="logo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logo" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Logo & Marca
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logo">
          <LogoUploadSettings />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="system">
          <SystemSettingsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
