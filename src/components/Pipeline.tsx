
import { KanbanPipeline } from './KanbanPipeline';
import { useLeaderPermissions } from '@/hooks/useLeaderPermissions';

export const Pipeline = () => {
  const { isAdmin } = useLeaderPermissions();

  return (
    <div className="space-y-6">
      <KanbanPipeline />
    </div>
  );
};
