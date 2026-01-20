import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';

export default function PipelineMonitor({ pipelineId }) {
  const [pipeline, setPipeline] = useState(null);

  useEffect(() => {
    if (!pipelineId) return;

    const fetchPipeline = async () => {
      try {
        const data = await base44.entities.CICDPipeline.get(pipelineId);
        setPipeline(data);
      } catch (error) {
        console.error('Pipeline fetch error:', error);
      }
    };

    fetchPipeline();
    const interval = setInterval(fetchPipeline, 2000);

    const unsubscribe = base44.entities.CICDPipeline.subscribe((event) => {
      if (event.id === pipelineId && event.type === 'update') {
        setPipeline(event.data);
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [pipelineId]);

  if (!pipeline) return null;

  const totalStages = pipeline.pipeline_stages?.length || 0;
  const completedStages = pipeline.pipeline_stages?.filter(s => s.status === 'success').length || 0;
  const progress = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Pipeline Execution</span>
          <Badge className="bg-blue-600">Live</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-2" />
        <div className="text-white/70 text-sm">
          {completedStages} of {totalStages} stages completed
        </div>
        
        <div className="space-y-2">
          {pipeline.pipeline_stages?.map((stage, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                {stage.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                {stage.status === 'running' && <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />}
                {stage.status === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
                {stage.status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
                <span className="text-white text-sm">{stage.stage_name}</span>
              </div>
              <span className="text-white/60 text-xs">{stage.duration_seconds}s</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}