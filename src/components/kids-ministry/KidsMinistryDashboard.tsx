import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  ClipboardCheck, 
  History, 
  BarChart3, 
  MessageSquare, 
  FolderOpen,
  Baby
} from 'lucide-react';
import { ChildrenManager } from './ChildrenManager';
import { LessonsManager } from './LessonsManager';
import { TeacherScheduleManager } from './TeacherScheduleManager';
import { ClassRecordManager } from './ClassRecordManager';
import { ClassHistoryManager } from './ClassHistoryManager';
import { AttendanceChart } from './AttendanceChart';
import { NotificationManager } from './NotificationManager';
import { MaterialsManager } from './MaterialsManager';

type ActiveModule = 
  | 'overview' 
  | 'children' 
  | 'lessons' 
  | 'schedules' 
  | 'record' 
  | 'history' 
  | 'chart' 
  | 'notifications' 
  | 'materials';

const MODULES = [
  { id: 'overview' as const, label: 'Visão Geral', icon: Baby, color: 'bg-blue-500' },
  { id: 'children' as const, label: 'Cadastro de Crianças', icon: Users, color: 'bg-green-500' },
  { id: 'lessons' as const, label: 'Lições', icon: BookOpen, color: 'bg-purple-500' },
  { id: 'schedules' as const, label: 'Escala de Professoras', icon: Calendar, color: 'bg-orange-500' },
  { id: 'record' as const, label: 'Registro de Aula', icon: ClipboardCheck, color: 'bg-pink-500' },
  { id: 'history' as const, label: 'Histórico de Aulas', icon: History, color: 'bg-indigo-500' },
  { id: 'chart' as const, label: 'Gráfico de Presença', icon: BarChart3, color: 'bg-cyan-500' },
  { id: 'notifications' as const, label: 'Notificações', icon: MessageSquare, color: 'bg-yellow-500' },
  { id: 'materials' as const, label: 'Materiais', icon: FolderOpen, color: 'bg-red-500' },
];

export const KidsMinistryDashboard = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('overview');

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'children':
        return <ChildrenManager />;
      case 'lessons':
        return <LessonsManager />;
      case 'schedules':
        return <TeacherScheduleManager />;
      case 'record':
        return <ClassRecordManager />;
      case 'history':
        return <ClassHistoryManager />;
      case 'chart':
        return <AttendanceChart />;
      case 'notifications':
        return <NotificationManager />;
      case 'materials':
        return <MaterialsManager />;
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <Baby className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Ministério Kids & Jovens
              </h1>
              <p className="text-gray-600 text-lg">
                Sistema completo para gerenciamento do ministério infantil e juvenil
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODULES.filter(module => module.id !== 'overview').map((module) => {
                const IconComponent = module.icon;
                return (
                  <Card 
                    key={module.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setActiveModule(module.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${module.color} text-white`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {module.label}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {getModuleDescription(module.id)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">🎯 Recursos Principais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>✅ Gestão Completa:</strong> Cadastro de crianças com vínculo aos pais</p>
                    <p><strong>📚 Lições:</strong> Biblioteca de lições para Kids e Jovens</p>
                    <p><strong>👩‍🏫 Escalas:</strong> Organização das professoras por culto</p>
                    <p><strong>📊 Relatórios:</strong> Gráficos de presença e estatísticas</p>
                  </div>
                  <div>
                    <p><strong>✏️ Chamada:</strong> Registro de presença por aula</p>
                    <p><strong>📋 Histórico:</strong> Acompanhamento de todas as aulas</p>
                    <p><strong>💬 Notificações:</strong> Sistema de comunicação</p>
                    <p><strong>📁 Materiais:</strong> Biblioteca de recursos didáticos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  const getModuleDescription = (id: Exclude<ActiveModule, 'overview'>) => {
    const descriptions: Record<Exclude<ActiveModule, 'overview'>, string> = {
      'children': 'Cadastro e gerenciamento de crianças',
      'lessons': 'Biblioteca de lições por categoria',
      'schedules': 'Organização das escalas dominicais',
      'record': 'Registro de presença das aulas',
      'history': 'Histórico completo das aulas',
      'chart': 'Gráficos de presença e estatísticas',
      'notifications': 'Sistema de notificações',
      'materials': 'Biblioteca de materiais didáticos'
    };
    return descriptions[id] || '';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Navigation */}
      {activeModule !== 'overview' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeModule === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveModule('overview')}
              >
                <Baby className="h-4 w-4 mr-2" />
                Visão Geral
              </Button>
              
              {MODULES.filter(module => module.id !== 'overview').map((module) => {
                const IconComponent = module.icon;
                return (
                  <Button
                    key={module.id}
                    variant={activeModule === module.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveModule(module.id)}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {module.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Module Content */}
      {renderActiveModule()}
    </div>
  );
};
