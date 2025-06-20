
import { PipelineWithFilters } from './PipelineWithFilters';

export const Pipeline = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Estágio dos Discípulos
        </h1>
        <p className="text-gray-600 text-lg">
          Acompanhe o progresso dos discípulos através dos estágios do pipeline
        </p>
      </div>
      
      <PipelineWithFilters />
    </div>
  );
};
