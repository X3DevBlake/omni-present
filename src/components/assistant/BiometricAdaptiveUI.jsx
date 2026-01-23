import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Brain, Zap, Activity, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BiometricAdaptiveUI({ children }) {
  const [adaptations, setAdaptations] = useState({});
  const [cognitiveState, setCognitiveState] = useState('focused');
  const queryClient = useQueryClient();

  // Simulated biometric data (in production, would come from real sensors)
  const { data: biometricData } = useQuery({
    queryKey: ['biometric-stream'],
    queryFn: async () => {
      return {
        heart_rate: 70 + Math.random() * 20,
        stress_level: Math.random() * 0.5,
        focus_score: 0.6 + Math.random() * 0.3,
        emotional_valence: 0.5 + Math.random() * 0.3,
        arousal: 0.4 + Math.random() * 0.4,
        brainwave_pattern: 'beta'
      };
    },
    refetchInterval: 5000
  });

  const adaptUIMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('adaptiveUIController', {
        biometric_data: biometricData,
        current_ui_state: {
          complexity_level: 'normal',
          environment_id: 'default'
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setCognitiveState(data.cognitive_state);
      setAdaptations(data.ui_changes || {});
    }
  });

  useEffect(() => {
    if (biometricData) {
      adaptUIMutation.mutate();
    }
  }, [biometricData]);

  const stateColors = {
    focused: 'text-green-400 bg-green-900/20 border-green-700',
    flow_state: 'text-blue-400 bg-blue-900/20 border-blue-700',
    stressed: 'text-red-400 bg-red-900/20 border-red-700',
    distracted: 'text-yellow-400 bg-yellow-900/20 border-yellow-700',
    fatigued: 'text-orange-400 bg-orange-900/20 border-orange-700',
    relaxed: 'text-purple-400 bg-purple-900/20 border-purple-700'
  };

  return (
    <div className="space-y-4">
      {/* Biometric Monitor */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-20 right-6 z-50"
      >
        <Card className="bg-slate-900/95 backdrop-blur border-slate-700 w-80">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Adaptive UI Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={`p-3 rounded-lg border ${stateColors[cognitiveState] || stateColors.focused}`}>
              <div className="text-xs font-medium mb-1">Cognitive State</div>
              <div className="text-lg font-bold capitalize">
                {cognitiveState.replace('_', ' ')}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Heart className="w-3 h-3" />
                  Heart Rate
                </div>
                <div className="text-white font-semibold">
                  {biometricData?.heart_rate?.toFixed(0) || '--'} BPM
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Brain className="w-3 h-3" />
                  Focus
                </div>
                <Progress 
                  value={(biometricData?.focus_score || 0) * 100}
                  className="h-2"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Zap className="w-3 h-3" />
                  Stress
                </div>
                <Progress 
                  value={(biometricData?.stress_level || 0) * 100}
                  className="h-2"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Eye className="w-3 h-3" />
                  Arousal
                </div>
                <Progress 
                  value={(biometricData?.arousal || 0) * 100}
                  className="h-2"
                />
              </div>
            </div>

            {Object.keys(adaptations).length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-700">
                <div className="text-xs text-slate-400">Active Adaptations</div>
                {adaptations.show_break_reminder && (
                  <Badge variant="outline" className="bg-orange-900 text-orange-200 text-xs">
                    Break Suggested
                  </Badge>
                )}
                {adaptations.complexity_level === 'minimal' && (
                  <Badge variant="outline" className="bg-blue-900 text-blue-200 text-xs">
                    UI Simplified
                  </Badge>
                )}
                {adaptations.color_temperature && (
                  <Badge variant="outline" className="bg-purple-900 text-purple-200 text-xs">
                    Colors: {adaptations.color_temperature}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Adapted content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cognitiveState}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            filter: adaptations.color_temperature === 'cool' 
              ? 'hue-rotate(200deg)' 
              : 'hue-rotate(0deg)'
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: adaptations.transition_duration ? adaptations.transition_duration / 1000 : 0.5 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}