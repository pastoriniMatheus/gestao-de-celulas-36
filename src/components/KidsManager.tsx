
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Baby, Calendar, BookOpen, Users, ClipboardList, BarChart3, Bell, FileText } from 'lucide-react';
import { ChildrenManager } from './kids/ChildrenManager';
import { TeacherSchedule } from './kids/TeacherSchedule';
import { LessonsManager } from './kids/LessonsManager';
import { ClassRecord } from './kids/ClassRecord';
import { ClassHistory } from './kids/ClassHistory';
import { AttendanceChart } from './kids/AttendanceChart';
import { KidsNotificationsManager } from './kids/KidsNotificationsManager';
import { MaterialsManager } from './kids/MaterialsManager';

export function KidsManager() {
  const [activeTab, setActiveTab] = useState('children');

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-pink-600 mb-2 flex items-center justify-center gap-3">
          <Baby className="w-10 h-10" />
          Ministério Kids & Jovens
        </h1>
        <p className="text-gray-600">Gestão completa do ministério infantojuvenil</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-pink-50 rounded-lg p-1">
          <TabsTrigger value="children" className="flex items-center gap-2 text-xs lg:text-sm">
            <Baby className="w-4 h-4" />
            <span className="hidden sm:inline">Crianças</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2 text-xs lg:text-sm">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Escala</span>
          </TabsTrigger>
          <TabsTrigger value="lessons" className="flex items-center gap-2 text-xs lg:text-sm">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Lições</span>
          </TabsTrigger>
          <TabsTrigger value="record" className="flex items-center gap-2 text-xs lg:text-sm">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Registro</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 text-xs lg:text-sm">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex items-center gap-2 text-xs lg:text-sm">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Gráficos</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 text-xs lg:text-sm">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex items-center gap-2 text-xs lg:text-sm">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Materiais</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="children" className="mt-6">
          <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-pink-700">
                <Baby className="w-6 h-6" />
                Cadastro de Crianças
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChildrenManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Calendar className="w-6 h-6" />
                Escala de Professoras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TeacherSchedule />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons" className="mt-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <BookOpen className="w-6 h-6" />
                Gerenciar Lições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LessonsManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="record" className="mt-6">
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <ClipboardList className="w-6 h-6" />
                Registro de Aula
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClassRecord />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Users className="w-6 h-6" />
                Histórico de Aulas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClassHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="mt-6">
          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-teal-700">
                <BarChart3 className="w-6 h-6" />
                Gráfico de Presença
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="bg-gradient-to-br from-rose-50 to-red-50 border-rose-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-700">
                <Bell className="w-6 h-6" />
                Enviar Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <KidsNotificationsManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="mt-6">
          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-700">
                <FileText className="w-6 h-6" />
                Materiais de Apoio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MaterialsManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
