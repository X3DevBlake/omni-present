import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PredictiveNeedsPanel({ agentId, userEmail }) {
  const queryClient = useQueryClient();

  const { data: predictions = [] } = useQuery({
    queryKey: ['agentPredictions', agentId],
    queryFn: () => base44.entities.AgentNeedsPrediction.filter({ agent_id: agentId }).catch(() => [])
  });

  const generatePrediction = useMutation({
    mutationFn: async () => {
      const trainingSessions = await base44.entities.AgentTrainingSession.filter({ agent_id: agentId }).catch(() => []);
      const skills = await base44.entities.AgentSkill.filter({ agent_id: agentId }).catch(() => []);
      
      return await base44.entities.AgentNeedsPrediction.create({
        user_email: userEmail,
        agent_id: agentId,
        predicted_needs: [
          { need_type: 'skill_update', description: 'Market analysis enhancement', priority: 'high' },
          { need_type: 'training', description: 'Risk management training', priority: 'medium' }
        ],
        confidence_score: 85,
        suggested_workflows: [
          { workflow_type: 'training', action: 'initiate_training', parameters: { training_type: 'skill_enhancement' } }
        ],
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentPredictions'] });
    }
  });

  const initiateWorkflow = useMutation({
    mutationFn: async (predictionId) => {
      await base44.entities.AgentNeedsPrediction.update(predictionId, { 
        status: 'in_progress',
        initiated_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentPredictions'] });
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h4 className="text-white font-bold">Predictive Agent Needs</h4>
        </div>
        <Button 
          onClick={() => generatePrediction.mutate()} 
          disabled={generatePrediction.isPending}
          size="sm"
          className="bg-purple-500"
        >
          <Zap className="w-3 h-3 mr-2" />
          Analyze
        </Button>
      </div>

      <div className="space-y-2">
        {predictions.map((pred, idx) => (
          <motion.div
            key={pred.id || idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-purple-400 text-xs font-bold mb-1">
                  Confidence: {pred.confidence_score}%
                </p>
                <div className={`inline-block px-2 py-1 rounded text-xs ${
                  pred.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  pred.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {pred.status}
                </div>
              </div>
              {pred.status === 'pending' && (
                <Button 
                  onClick={() => initiateWorkflow.mutate(pred.id)} 
                  size="sm"
                  className="bg-purple-500"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Initiate
                </Button>
              )}
            </div>

            {pred.predicted_needs && (
              <div className="space-y-2">
                <p className="text-white/80 text-xs font-bold">Predicted Needs:</p>
                {pred.predicted_needs.slice(0, 3).map((need, i) => (
                  <div key={i} className="bg-black/30 rounded p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className={`w-3 h-3 ${
                        need.priority === 'high' ? 'text-red-400' :
                        need.priority === 'medium' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`} />
                      <p className="text-white text-xs font-bold">{need.need_type}</p>
                    </div>
                    <p className="text-white/60 text-xs">{need.description}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}

        {predictions.length === 0 && (
          <div className="text-center py-8 text-white/40 text-sm">
            No predictions yet. Click Analyze to generate insights.
          </div>
        )}
      </div>
    </motion.div>
  );
}