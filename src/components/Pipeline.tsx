
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KanbanPipeline } from './KanbanPipeline';
import { PendingFormContacts } from './PendingFormContacts';

export const Pipeline = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="kanban">Pipeline de Discipulado</TabsTrigger>
          <TabsTrigger value="pending">Contatos Pendentes</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban" className="space-y-6">
          <KanbanPipeline />
        </TabsContent>
        <TabsContent value="pending" className="space-y-6">
          <PendingFormContacts />
        </TabsContent>
      </Tabs>
    </div>
  );
};
