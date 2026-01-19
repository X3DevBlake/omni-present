import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { GitBranch, RotateCcw, Tag, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function ModelVersionControl() {
  const queryClient = useQueryClient();
  const [selectedModel, setSelectedModel] = useState('');

  const { data: models } = useQuery({
    queryKey: ['versioned-models'],
    queryFn: async () => {
      const models = await base44.entities.TrainingProgress.list('-created_date');
      return models;
    },
  });

  const modelVersions = React.useMemo(() => {
    if (!selectedModel || !models) return [];
    return models.filter(m => m.model_name === models.find(model => model.id === selectedModel)?.model_name);
  }, [selectedModel, models]);

  const revertToVersion = useMutation({
    mutationFn: async (versionId) => {
      const version = models?.find(m => m.id === versionId);
      await base44.entities.AgentDeployment.create({
        model_id: versionId,
        deployment_name: `${version.model_name}-reverted`,
        status: 'deployed',
      });
      return version;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-deployments'] });
      alert('Successfully reverted to selected version!');
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Select model to view versions" />
            </SelectTrigger>
            <SelectContent>
              {[...new Set(models?.map(m => m.model_name))].map((name) => (
                <SelectItem key={name} value={models?.find(m => m.model_name === name)?.id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {modelVersions.length > 0 && (
            <div className="space-y-3">
              {modelVersions.map((version, index) => (
                <motion.div
                  key={version.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-white font-medium">
                        Version {modelVersions.length - index}
                      </h4>
                      {index === 0 && (
                        <Badge className="bg-green-500/20 text-green-400 border-0">Latest</Badge>
                      )}
                    </div>
                    <span className="text-white/60 text-xs">
                      {new Date(version.created_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-white/60 text-xs">Accuracy</div>
                      <div className="text-white font-bold">
                        {(version.metrics?.accuracy * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-white/60 text-xs">Loss</div>
                      <div className="text-white font-bold">
                        {version.metrics?.loss?.toFixed(4) || 'N/A'}
                      </div>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-white/60 text-xs">Epochs</div>
                      <div className="text-white font-bold">{version.total_epochs}</div>
                    </div>
                  </div>

                  {index !== 0 && (
                    <Button
                      onClick={() => revertToVersion.mutate(version.id)}
                      size="sm"
                      variant="outline"
                      className="border-white/10"
                    >
                      <RotateCcw className="w-3 h-3 mr-2" />
                      Revert to This Version
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Version Info</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedModel ? (
            <div className="space-y-4">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <h4 className="text-cyan-200 font-medium mb-2">Total Versions</h4>
                <p className="text-white text-3xl font-bold">{modelVersions.length}</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 text-sm">Version Control Benefits</h4>
                <ul className="text-white/60 text-xs space-y-2">
                  <li>• Rollback to any previous version</li>
                  <li>• Compare performance across versions</li>
                  <li>• Track model evolution over time</li>
                  <li>• Safe experimentation with A/B testing</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <GitBranch className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60 text-sm">Select a model to view versions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}