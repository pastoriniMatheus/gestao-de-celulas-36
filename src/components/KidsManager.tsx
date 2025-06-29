
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
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

export function KidsManager() {
  const [activeTab, setActiveTab] = useState('children');
  const isMobile = useIsMobile();
  
  const menuItems = [{
    value: 'children',
    label: 'Kids',
    icon: Baby,
    color: 'from-pink-500 to-purple-600'
  }, {
    value: 'schedule',
    label: 'Escala',
    icon: Calendar,
    color: 'from-blue-500 to-indigo-600'
  }, {
    value: 'lessons',
    label: 'Lições',
    icon: BookOpen,
    color: 'from-green-500 to-emerald-600'
  }, {
    value: 'record',
    label: 'Aula',
    icon: ClipboardList,
    color: 'from-orange-500 to-red-600'
  }, {
    value: 'history',
    label: 'Hist.',
    icon: Users,
    color: 'from-purple-500 to-pink-600'
  }, {
    value: 'chart',
    label: 'Graf.',
    icon: BarChart3,
    color: 'from-teal-500 to-cyan-600'
  }, {
    value: 'notifications',
    label: 'Avisos',
    icon: Bell,
    color: 'from-rose-500 to-pink-600'
  }, {
    value: 'materials',
    label: 'Mat.',
    icon: FileText,
    color: 'from-slate-500 to-gray-600'
  }];

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden w-full">
        {/* Header Mobile - Fixo e ajustado para ficar dentro da janela */}
        <div className="flex-shrink-0 bg-white/95 backdrop-blur-lg border-b border-pink-200 shadow-sm w-full">
          {/* Título compacto */}
          <div className="flex items-center justify-center gap-2 px-4 py-3">
            <div className="w-5 h-5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Baby className="w-3 h-3 text-white" />
            </div>
            <h1 className="text-sm font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Kids & Jovens
            </h1>
          </div>
          
          {/* Menu Horizontal Deslizante - garantido dentro da janela */}
          <div className="w-full px-2 pb-3">
            <Carousel opts={{
              align: "start",
              dragFree: true,
              containScroll: "trimSnaps"
            }} className="w-full max-w-full">
              <CarouselContent className="-ml-2">
                {menuItems.map(item => (
                  <CarouselItem key={item.value} className="pl-2 basis-auto">
                    <button 
                      onClick={() => setActiveTab(item.value)} 
                      className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg border-2 transition-all duration-300 text-xs whitespace-nowrap min-w-[80px] max-w-[90px] ${
                        activeTab === item.value 
                          ? `bg-gradient-to-br ${item.color} text-white border-transparent shadow-md` 
                          : 'bg-white/90 backdrop-blur-sm border-gray-200 hover:shadow-sm hover:border-gray-300'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-xs font-medium leading-tight">{item.label}</span>
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>

        {/* Conteúdo das Tabs - Ocupa o resto da altura e fica dentro da janela */}
        <div className="flex-1 min-h-0 w-full overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col w-full">
            <TabsContent value="children" className="flex-1 m-0 overflow-hidden w-full">
              <div className="bg-white/95 backdrop-blur-sm rounded-t-xl shadow-lg border-t border-pink-200 h-full flex flex-col w-full">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                      <Baby className="w-2.5 h-2.5 text-white" />
                    </div>
                    <h2 className="text-sm font-bold text-white">Crianças</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden p-3 w-full">
                  <div className="h-full overflow-y-auto w-full">
                    <ChildrenManager />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="flex-1 m-0 overflow-hidden w-full">
              <div className="bg-white/95 backdrop-blur-sm rounded-t-xl shadow-lg border-t border-blue-200 h-full flex flex-col w-full">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                      <Calendar className="w-2.5 h-2.5 text-white" />
                    </div>
                    <h2 className="text-sm font-bold text-white">Escala de Professoras</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden p-3 w-full">
                  <div className="h-full overflow-y-auto w-full">
                    <TeacherSchedule />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lessons" className="flex-1 m-0 overflow-hidden w-full">
              <div className="bg-white/95 backdrop-blur-sm rounded-t-xl shadow-lg border-t border-green-200 h-full flex flex-col w-full">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                      <BookOpen className="w-2.5 h-2.5 text-white" />
                    </div>
                    <h2 className="text-sm font-bold text-white">Lições</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden p-3 w-full">
                  <div className="h-full overflow-y-auto w-full">
                    <LessonsManager />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="record" className="flex-1 m-0 overflow-hidden w-full">
              <div className="bg-white/95 backdrop-blur-sm rounded-t-xl shadow-lg border-t border-orange-200 h-full flex flex-col w-full">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                      <ClipboardList className="w-2.5 h-2.5 text-white" />
                    </div>
                    <h2 className="text-sm font-bold text-white">Registro de Aula</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden p-3 w-full">
                  <div className="h-full overflow-y-auto w-full">
                    <ClassRecord />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 m-0 overflow-hidden w-full">
              <div className="bg-white/95 backdrop-blur-sm rounded-t-xl shadow-lg border-t border-purple-200 h-full flex flex-col w-full">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                      <Users className="w-2.5 h-2.5 text-white" />
                    </div>
                    <h2 className="text-sm font-bold text-white">Histórico</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden p-3 w-full">
                  <div className="h-full overflow-y-auto w-full">
                    <ClassHistory />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chart" className="flex-1 m-0 overflow-hidden w-full">
              <div className="bg-white/95 backdrop-blur-sm rounded-t-xl shadow-lg border-t border-teal-200 h-full flex flex-col w-full">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-2.5 h-2.5 text-white" />
                    </div>
                    <h2 className="text-sm font-bold text-white">Gráficos</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden p-3 w-full">
                  <div className="h-full overflow-y-auto w-full">
                    <AttendanceChart />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="flex-1 m-0 overflow-hidden w-full">
              <div className="bg-white/95 backdrop-blur-sm rounded-t-xl shadow-lg border-t border-rose-200 h-full flex flex-col w-full">
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                      <Bell className="w-2.5 h-2.5 text-white" />
                    </div>
                    <h2 className="text-sm font-bold text-white">Avisos</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden p-3 w-full">
                  <div className="h-full overflow-y-auto w-full">
                    <KidsNotificationsManager />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="materials" className="flex-1 m-0 overflow-hidden w-full">
              <div className="bg-white/95 backdrop-blur-sm rounded-t-xl shadow-lg border-t border-slate-200 h-full flex flex-col w-full">
                <div className="bg-gradient-to-r from-slate-500 to-gray-600 p-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                      <FileText className="w-2.5 h-2.5 text-white" />
                    </div>
                    <h2 className="text-sm font-bold text-white">Materiais</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden p-3 w-full">
                  <div className="h-full overflow-y-auto w-full">
                    <MaterialsManager />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Versão Desktop com layout otimizado
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden">
      <div className="space-y-4 px-4 py-6 max-w-full">
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
          <div className="mb-4 overflow-hidden">
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 bg-white/90 backdrop-blur-sm rounded-xl p-2 w-full shadow-lg border border-pink-100 py-[9px]">
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

          <div className="overflow-hidden">
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
                <CardContent className="p-6 overflow-x-hidden">
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
                <CardContent className="p-6 overflow-x-hidden">
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
                <CardContent className="p-6 overflow-x-hidden">
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
                <CardContent className="p-6 overflow-x-hidden">
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
                <CardContent className="p-6 overflow-x-hidden">
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
                <CardContent className="p-6 overflow-x-hidden">
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
                <CardContent className="p-6 overflow-x-hidden">
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
                <CardContent className="p-6 overflow-x-hidden">
                  <MaterialsManager />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
