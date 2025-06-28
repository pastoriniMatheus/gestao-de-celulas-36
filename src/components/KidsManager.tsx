
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
    <div className="space-y-4 px-2 sm:px-4 md:px-6">
      <div className="text-center mb-6 px-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pink-600 mb-2 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <Baby className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
          <span className="leading-tight">Ministério Kids & Jovens</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-600">Gestão completa do ministério infantojuvenil</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2 mb-4">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 bg-pink-50 rounded-lg p-1 min-w-max lg:min-w-full">
            <TabsTrigger value="children" className="flex items-center gap-1 text-xs px-2 py-2 whitespace-nowrap">
              <Baby className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Crianças</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-1 text-xs px-2 py-2 whitespace-nowrap">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Escala</span>
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex items-center gap-1 text-xs px-2 py-2 whitespace-nowrap">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Lições</span>
            </TabsTrigger>
            <TabsTrigger value="record" className="flex items-center gap-1 text-xs px-2 py-2 whitespace-nowrap">
              <ClipboardList className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Registro</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1 text-xs px-2 py-2 whitespace-nowrap">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="chart" className="flex items-center gap-1 text-xs px-2 py-2 whitespace-nowrap">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Gráficos</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1 text-xs px-2 py-2 whitespace-nowrap">
              <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-1 text-xs px-2 py-2 whitespace-nowrap">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Materiais</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="children" className="mt-4">
          <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-pink-700 text-lg sm:text-xl">
                <Baby className="w-5 h-5 sm:w-6 sm:h-6" />
                Cadastro de Crianças
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <ChildrenManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-blue-700 text-lg sm:text-xl">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                Escala de Professoras
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <TeacherSchedule />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons" className="mt-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-green-700 text-lg sm:text-xl">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                Gerenciar Lições
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <LessonsManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="record" className="mt-4">
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-orange-700 text-lg sm:text-xl">
                <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
                Registro de Aula
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <ClassRecord />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-purple-700 text-lg sm:text-xl">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                Histórico de Aulas
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <ClassHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="mt-4">
          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-teal-700 text-lg sm:text-xl">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                Gráfico de Presença
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <AttendanceChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card className="bg-gradient-to-br from-rose-50 to-red-50 border-rose-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-rose-700 text-lg sm:text-xl">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                Enviar Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <KidsNotificationsManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="mt-4">
          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-700 text-lg sm:text-xl">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                Materiais de Apoio
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <MaterialsManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
