
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
import { useIsMobile } from '@/hooks/use-mobile';

export function KidsManager() {
  const [activeTab, setActiveTab] = useState('children');
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        {/* Header Mobile Redesenhado */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-pink-300 shadow-lg">
          <div className="px-4 py-3">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                <Baby className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Kids & Jovens
              </h1>
            </div>
            
            {/* Menu de Navegação Mobile Otimizado */}
            <div className="overflow-x-auto pb-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex gap-2 bg-transparent p-0 h-auto min-w-max">
                  <TabsTrigger 
                    value="children" 
                    className="flex flex-col items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-pink-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
                  >
                    <Baby className="w-5 h-5" />
                    <span className="text-xs font-medium">Crianças</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="schedule" 
                    className="flex flex-col items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-blue-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300"
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="text-xs font-medium">Escala</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="lessons" 
                    className="flex flex-col items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-green-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-300"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span className="text-xs font-medium">Lições</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="record" 
                    className="flex flex-col items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-orange-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300"
                  >
                    <ClipboardList className="w-5 h-5" />
                    <span className="text-xs font-medium">Registro</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="history" 
                    className="flex flex-col items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-purple-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300"
                  >
                    <Users className="w-5 h-5" />
                    <span className="text-xs font-medium">Histórico</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="chart" 
                    className="flex flex-col items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-teal-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all duration-300"
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-xs font-medium">Gráficos</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="notifications" 
                    className="flex flex-col items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-rose-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="text-xs font-medium">Avisos</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="materials" 
                    className="flex flex-col items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-gray-600 data-[state=active]:text-white transition-all duration-300"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-xs font-medium">Materiais</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Conteúdo Mobile Redesenhado */}
        <div className="flex-1 p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsContent value="children" className="mt-0">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Baby className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Cadastro de Crianças</h2>
                  </div>
                </div>
                <div className="p-4">
                  <ChildrenManager />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="mt-0">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Escala de Professoras</h2>
                  </div>
                </div>
                <div className="p-4">
                  <TeacherSchedule />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lessons" className="mt-0">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Gerenciar Lições</h2>
                  </div>
                </div>
                <div className="p-4">
                  <LessonsManager />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="record" className="mt-0">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <ClipboardList className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Registro de Aula</h2>
                  </div>
                </div>
                <div className="p-4">
                  <ClassRecord />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Histórico de Aulas</h2>
                  </div>
                </div>
                <div className="p-4">
                  <ClassHistory />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chart" className="mt-0">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-teal-200 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Gráfico de Presença</h2>
                  </div>
                </div>
                <div className="p-4">
                  <AttendanceChart />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-200 overflow-hidden">
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Bell className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Notificações</h2>
                  </div>
                </div>
                <div className="p-4">
                  <KidsNotificationsManager />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="materials" className="mt-0">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-500 to-gray-600 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Materiais de Apoio</h2>
                  </div>
                </div>
                <div className="p-4">
                  <MaterialsManager />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Versão Desktop (mantém o layout original)
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
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
    </div>
  );
}
