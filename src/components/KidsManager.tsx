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
    return <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden">
        {/* Header Mobile Super Compacto */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-pink-200 shadow-sm flex-shrink-0">
          <div className="px-2 py-1.5">
            {/* Título mais compacto */}
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <div className="w-4 h-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Baby className="w-2.5 h-2.5 text-white" />
              </div>
              <h1 className="text-xs font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Kids & Jovens
              </h1>
            </div>
            
            {/* Menu horizontal super compacto */}
            <div className="overflow-x-auto scrollbar-hide">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex gap-0.5 bg-transparent p-0 h-auto w-max min-w-full">
                  <TabsTrigger value="children" className="flex flex-col items-center gap-0.5 px-1.5 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-pink-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 min-w-[42px] text-xs">
                    <Baby className="w-2.5 h-2.5" />
                    <span className="text-[8px] font-medium leading-none">Kids</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="schedule" className="flex flex-col items-center gap-0.5 px-1.5 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-blue-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300 min-w-[42px] text-xs">
                    <Calendar className="w-2.5 h-2.5" />
                    <span className="text-[8px] font-medium leading-none">Escala</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="lessons" className="flex flex-col items-center gap-0.5 px-1.5 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-green-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-300 min-w-[42px] text-xs">
                    <BookOpen className="w-2.5 h-2.5" />
                    <span className="text-[8px] font-medium leading-none">Lições</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="record" className="flex flex-col items-center gap-0.5 px-1.5 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-orange-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300 min-w-[42px] text-xs">
                    <ClipboardList className="w-2.5 h-2.5" />
                    <span className="text-[8px] font-medium leading-none">Aula</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="history" className="flex flex-col items-center gap-0.5 px-1.5 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-purple-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300 min-w-[42px] text-xs">
                    <Users className="w-2.5 h-2.5" />
                    <span className="text-[8px] font-medium leading-none">Hist.</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="chart" className="flex flex-col items-center gap-0.5 px-1.5 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-teal-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all duration-300 min-w-[42px] text-xs">
                    <BarChart3 className="w-2.5 h-2.5" />
                    <span className="text-[8px] font-medium leading-none">Graf.</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="notifications" className="flex flex-col items-center gap-0.5 px-1.5 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-rose-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300 min-w-[42px] text-xs">
                    <Bell className="w-2.5 h-2.5" />
                    <span className="text-[8px] font-medium leading-none">Avisos</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="materials" className="flex flex-col items-center gap-0.5 px-1.5 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-slate-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-gray-600 data-[state=active]:text-white transition-all duration-300 min-w-[42px] text-xs">
                    <FileText className="w-2.5 h-2.5" />
                    <span className="text-[8px] font-medium leading-none">Mat.</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Conteúdo das Tabs - Altura calculada dinamicamente */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsContent value="children" className="mt-0 h-full p-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-pink-200 h-full flex flex-col overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-white/30 rounded-full flex items-center justify-center">
                      <Baby className="w-2 h-2 text-white" />
                    </div>
                    <h2 className="text-xs font-bold text-white">Crianças</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-1">
                  <ChildrenManager />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="mt-0 h-full p-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-blue-200 h-full flex flex-col overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-white/30 rounded-full flex items-center justify-center">
                      <Calendar className="w-2 h-2 text-white" />
                    </div>
                    <h2 className="text-xs font-bold text-white">Escala de Professoras</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-1">
                  <TeacherSchedule />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lessons" className="mt-0 h-full p-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-green-200 h-full flex flex-col overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-white/30 rounded-full flex items-center justify-center">
                      <BookOpen className="w-2 h-2 text-white" />
                    </div>
                    <h2 className="text-xs font-bold text-white">Lições</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-1">
                  <LessonsManager />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="record" className="mt-0 h-full p-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-orange-200 h-full flex flex-col overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-white/30 rounded-full flex items-center justify-center">
                      <ClipboardList className="w-2 h-2 text-white" />
                    </div>
                    <h2 className="text-xs font-bold text-white">Registro de Aula</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-1">
                  <ClassRecord />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0 h-full p-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-purple-200 h-full flex flex-col overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-white/30 rounded-full flex items-center justify-center">
                      <Users className="w-2 h-2 text-white" />
                    </div>
                    <h2 className="text-xs font-bold text-white">Histórico</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-1">
                  <ClassHistory />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chart" className="mt-0 h-full p-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-teal-200 h-full flex flex-col overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-white/30 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-2 h-2 text-white" />
                    </div>
                    <h2 className="text-xs font-bold text-white">Gráficos</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-1">
                  <AttendanceChart />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 h-full p-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-rose-200 h-full flex flex-col overflow-hidden">
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-white/30 rounded-full flex items-center justify-center">
                      <Bell className="w-2 h-2 text-white" />
                    </div>
                    <h2 className="text-xs font-bold text-white">Avisos</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-1">
                  <KidsNotificationsManager />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="materials" className="mt-0 h-full p-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 h-full flex flex-col overflow-hidden">
                <div className="bg-gradient-to-r from-slate-500 to-gray-600 p-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-white/30 rounded-full flex items-center justify-center">
                      <FileText className="w-2 h-2 text-white" />
                    </div>
                    <h2 className="text-xs font-bold text-white">Materiais</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-1">
                  <MaterialsManager />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>;
  }

  // Versão Desktop com novo visual aplicado
  return <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="space-y-4 px-4 py-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
              <Baby className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Ministério Kids & Jovens
            </h1>
          </div>
          <p className="text-sm text-gray-600">Gestão completa do ministério infantojuvenil</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-4">
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 bg-white/90 backdrop-blur-sm rounded-xl p-2 w-full shadow-lg border border-pink-100 py-[73px]">
              <TabsTrigger value="children" className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300">
                <Baby className="w-4 h-4" />
                <span className="hidden sm:inline">Crianças</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Escala</span>
              </TabsTrigger>
              <TabsTrigger value="lessons" className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-300">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Lições</span>
              </TabsTrigger>
              <TabsTrigger value="record" className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300">
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">Registro</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Histórico</span>
              </TabsTrigger>
              <TabsTrigger value="chart" className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all duration-300">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Gráficos</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notificações</span>
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-gray-600 data-[state=active]:text-white transition-all duration-300">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Materiais</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="children" className="mt-0">
            <Card className="bg-white/95 backdrop-blur-sm border-pink-200 shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <Baby className="w-4 h-4" />
                  </div>
                  Cadastro de Crianças
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ChildrenManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="mt-0">
            <Card className="bg-white/95 backdrop-blur-sm border-blue-200 shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  Escala de Professoras
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <TeacherSchedule />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons" className="mt-0">
            <Card className="bg-white/95 backdrop-blur-sm border-green-200 shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  Gerenciar Lições
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <LessonsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="record" className="mt-0">
            <Card className="bg-white/95 backdrop-blur-sm border-orange-200 shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  Registro de Aula
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ClassRecord />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <Card className="bg-white/95 backdrop-blur-sm border-purple-200 shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  Histórico de Aulas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ClassHistory />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chart" className="mt-0">
            <Card className="bg-white/95 backdrop-blur-sm border-teal-200 shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  Gráfico de Presença
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <AttendanceChart />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <Card className="bg-white/95 backdrop-blur-sm border-rose-200 shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <KidsNotificationsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="mt-0">
            <Card className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-500 to-gray-600 text-white">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  Materiais de Apoio
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <MaterialsManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}