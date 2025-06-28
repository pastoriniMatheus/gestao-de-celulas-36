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
  return <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="space-y-3 px-2 sm:px-4 py-4">
        <div className="text-center mb-4 px-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-pink-600 mb-2 flex items-center justify-center gap-2 flex-wrap">
            <Baby className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
            <span className="leading-tight">Ministério Kids & Jovens</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">Gestão completa do ministério infantojuvenil</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-3">
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 bg-white/80 backdrop-blur-sm rounded-lg p-1 w-full shadow-sm">
              <TabsTrigger value="children" className="flex items-center gap-1 text-xs px-1 py-1.5 whitespace-nowrap">
                <Baby className="w-3 h-3" />
                <span className="hidden sm:inline">Crianças</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-1 text-xs px-1 py-1.5 whitespace-nowrap">
                <Calendar className="w-3 h-3" />
                <span className="hidden sm:inline">Escala</span>
              </TabsTrigger>
              <TabsTrigger value="lessons" className="flex items-center gap-1 text-xs px-1 py-1.5 whitespace-nowrap">
                <BookOpen className="w-3 h-3" />
                <span className="hidden sm:inline">Lições</span>
              </TabsTrigger>
              <TabsTrigger value="record" className="flex items-center gap-1 text-xs px-1 py-1.5 whitespace-nowrap">
                <ClipboardList className="w-3 h-3" />
                <span className="hidden sm:inline">Registro</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-1 text-xs px-1 py-1.5 whitespace-nowrap">
                <Users className="w-3 h-3" />
                <span className="hidden sm:inline">Histórico</span>
              </TabsTrigger>
              <TabsTrigger value="chart" className="flex items-center gap-1 text-xs px-1 py-1.5 whitespace-nowrap">
                <BarChart3 className="w-3 h-3" />
                <span className="hidden sm:inline">Gráficos</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1 text-xs px-1 py-1.5 whitespace-nowrap">
                <Bell className="w-3 h-3" />
                <span className="hidden sm:inline">Notificações</span>
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex items-center gap-1 text-xs px-1 py-1.5 whitespace-nowrap">
                <FileText className="w-3 h-3" />
                <span className="hidden sm:inline">Materiais</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="children" className="mt-2">
            <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-lg">
              <CardHeader className="pb-3 px-3 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-pink-700 text-sm sm:text-lg">
                  <Baby className="w-4 h-4 sm:w-5 sm:h-5" />
                  Cadastro de Crianças
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <ChildrenManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="mt-2">
            <Card className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-lg">
              <CardHeader className="pb-3 px-3 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-blue-700 text-sm sm:text-lg">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  Escala de Professoras
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <TeacherSchedule />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons" className="mt-2">
            <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-lg">
              <CardHeader className="pb-3 px-3 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-green-700 text-sm sm:text-lg">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  Gerenciar Lições
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <LessonsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="record" className="mt-2">
            <Card className="bg-white/90 backdrop-blur-sm border-orange-200 shadow-lg">
              <CardHeader className="pb-3 px-3 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-orange-700 text-sm sm:text-lg">
                  <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
                  Registro de Aula
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <ClassRecord />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-2">
            <Card className="bg-white/90 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardHeader className="pb-3 px-3 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-purple-700 text-sm sm:text-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  Histórico de Aulas
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <ClassHistory />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chart" className="mt-2">
            <Card className="bg-white/90 backdrop-blur-sm border-teal-200 shadow-lg">
              <CardHeader className="pb-3 px-3 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-teal-700 text-sm sm:text-lg">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Gráfico de Presença
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <AttendanceChart />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-2">
            <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-lg">
              <CardHeader className="pb-0 px-3 sm:px-6">
                
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <KidsNotificationsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="mt-2">
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader className="pb-3 px-3 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-slate-700 text-sm sm:text-lg">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  Materiais de Apoio
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <MaterialsManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}