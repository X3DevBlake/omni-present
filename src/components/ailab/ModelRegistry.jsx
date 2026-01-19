import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Database, Search, Calendar, Cpu, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function ModelRegistry() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: allModels } = useQuery({
    queryKey: ['model-registry'],
    queryFn: async () => {
      const trained = await base44.entities.TrainingProgress.list('-created_date');
      const deployed = await base44.entities.AgentDeployment.list();
      
      return trained.map(model => {
        const deployment = deployed.find(d => d.model_id === model.id);
        return {
          ...model,
          deployment_status: deployment?.status || 'not_deployed',
          deployment_id: deployment?.id,
        };
      });
    },
  });

  const filteredModels = React.useMemo(() => {
    if (!allModels) return [];
    return allModels.filter(model => {
      const matchesSearch = model.model_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           model.model_type?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || model.deployment_status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [allModels, searchQuery, filterStatus]);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="bg-black/40 border-white/10">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models..."
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'deployed', 'not_deployed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === status
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {status.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-black/40 border-white/10 hover:border-purple-500/50 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-white text-lg">{model.model_name}</CardTitle>
                  <Badge className={
                    model.deployment_status === 'deployed'
                      ? 'bg-green-500/20 text-green-400 border-0'
                      : 'bg-gray-500/20 text-gray-400 border-0'
                  }>
                    {model.deployment_status === 'deployed' ? 'Deployed' : 'Stored'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Cpu className="w-4 h-4" />
                  <span>{model.model_type}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 rounded p-2">
                    <div className="text-white/60 text-xs">Accuracy</div>
                    <div className="text-white font-bold">
                      {(model.metrics?.accuracy * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <div className="text-white/60 text-xs">Epochs</div>
                    <div className="text-white font-bold">{model.total_epochs}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(model.created_date).toLocaleDateString()}</span>
                </div>

                {model.dataset_id && (
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <BarChart3 className="w-3 h-3" />
                    <span>Dataset: {model.dataset_id.slice(0, 8)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredModels.length === 0 && (
        <Card className="bg-black/40 border-white/10">
          <CardContent className="text-center py-12">
            <Database className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">No models found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}