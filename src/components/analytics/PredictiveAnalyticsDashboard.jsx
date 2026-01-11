import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, AlertTriangle, Lightbulb, Target, Loader2 } from 'lucide-react';

export default function PredictiveAnalyticsDashboard({ userEmail }) {
  const { data: predictions, refetch } = useQuery({
    queryKey: ['predictions', userEmail],
    queryFn: () => base44.entities.PredictiveAnalytic.filter({ user_email: userEmail }),
    initialData: []
  });

  const generatePredictions = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/generate-predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail })
      });
      return response.json();
    },
    onSuccess: () => {
      refetch();
    }
  });

  useEffect(() => {
    if (userEmail) {
      generatePredictions.mutate();
    }
  }, [userEmail]);

  const getPredictionIcon = (type) => {
    switch (type) {
      case 'system_issue': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'user_need': return <Lightbulb className="w-4 h-4 text-yellow-400" />;
      case 'agent_action': return <Target className="w-4 h-4 text-green-400" />;
      default: return <TrendingUp className="w-4 h-4 text-blue-400" />;
    }
  };

  const getPredictionColor = (type) => {
    const colors = {
      system_issue: 'border-red-500/30 bg-red-500/10',
      user_need: 'border-yellow-500/30 bg-yellow-500/10',
      agent_action: 'border-green-500/30 bg-green-500/10',
      resource_bottleneck: 'border-orange-500/30 bg-orange-500/10'
    };
    return colors[type] || 'border-blue-500/30 bg-blue-500/10';
  };

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">Predictive Analytics</h3>
            <p className="text-white/60 text-sm">AI-powered forecasting</p>
          </div>
        </div>
        <Button
          onClick={() => generatePredictions.mutate()}
          disabled={generatePredictions.isPending}
          size="sm"
          className="bg-purple-500/20 hover:bg-purple-500/30"
        >
          {generatePredictions.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Refresh'
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {predictions.slice(0, 5).map((prediction, idx) => (
          <motion.div
            key={prediction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`border rounded-lg p-4 ${getPredictionColor(prediction.prediction_type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-black/20 rounded">
                {getPredictionIcon(prediction.prediction_type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold text-sm capitalize">
                    {prediction.prediction_type.replace('_', ' ')}
                  </span>
                  <span className="text-white/60 text-xs">
                    {prediction.confidence}% confidence
                  </span>
                </div>
                <p className="text-white/80 text-sm mb-2">{prediction.prediction}</p>
                {prediction.suggested_actions?.length > 0 && (
                  <div className="bg-black/20 rounded p-2">
                    <p className="text-white/60 text-xs font-bold mb-1">Suggested Actions:</p>
                    <ul className="text-white/60 text-xs space-y-0.5">
                      {prediction.suggested_actions.map((action, i) => (
                        <li key={i}>• {action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {predictions.length === 0 && !generatePredictions.isPending && (
          <div className="text-center py-8 text-white/40">
            No predictions yet. Click refresh to generate.
          </div>
        )}
      </div>
    </Card>
  );
}