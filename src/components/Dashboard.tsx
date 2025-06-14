
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, QrCode, MessageSquare, TrendingUp } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema de células</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs opacity-80">+12% este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Células Ativas</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs opacity-80">+2 este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Codes Ativos</CardTitle>
            <QrCode className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs opacity-80">156 scans hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
            <MessageSquare className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs opacity-80">Esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Novo contato adicionado</p>
                  <p className="text-xs text-gray-500">Maria Silva - Bairro Centro</p>
                </div>
                <span className="text-xs text-gray-500">2min atrás</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">QR Code escaneado</p>
                  <p className="text-xs text-gray-500">Evento: Encontro de Jovens</p>
                </div>
                <span className="text-xs text-gray-500">5min atrás</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Contato atribuído à célula</p>
                  <p className="text-xs text-gray-500">João Santos - Célula Esperança</p>
                </div>
                <span className="text-xs text-gray-500">10min atrás</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium">Encontro de Células</p>
                <p className="text-sm text-gray-600">Hoje, 19:30</p>
                <p className="text-xs text-gray-500">QR Code: Ativo (45 scans)</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="font-medium">Culto de Jovens</p>
                <p className="text-sm text-gray-600">Sexta, 20:00</p>
                <p className="text-xs text-gray-500">QR Code: Ativo (23 scans)</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="font-medium">Retiro Espiritual</p>
                <p className="text-sm text-gray-600">Sábado, 08:00</p>
                <p className="text-xs text-gray-500">QR Code: Inativo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
