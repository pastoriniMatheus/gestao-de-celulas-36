
import { KanbanPipeline } from './KanbanPipeline';
import { PipelineWithFilters } from './PipelineWithFilters';
import { useLeaderPermissions } from '@/hooks/useLeaderPermissions';

export const Pipeline = () => {
  const { isAdmin } = useLeaderPermissions();

  return (
    <div className="space-y-6">
      {isAdmin ? <PipelineWithFilters /> : <KanbanPipeline />}
    </div>
  );
};
