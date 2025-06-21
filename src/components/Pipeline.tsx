
import { KanbanPipeline } from './KanbanPipeline';
import { useLeaderPermissions } from '@/hooks/useLeaderPermissions';

export const Pipeline = () => {
  const { isAdmin } = useLeaderPermissions();

  return (
    <div className="flex flex-col h-screen">
      {/* Header fixo */}
      <div className="flex-shrink-0 p-6 border-b bg-white">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estágio dos Discípulos</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Gerencie todos os discípulos pelos estágios do funil' : 'Visualize seus discípulos pelos estágios'}
          </p>
        </div>
      </div>

      {/* Conteúdo com scroll */}
      <div className="flex-1 overflow-hidden">
        <KanbanPipeline />
      </div>
    </div>
  );
};
