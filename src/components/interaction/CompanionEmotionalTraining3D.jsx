import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html, Text, Sparkles, Box } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { GraduationCap, Brain, Heart, Activity, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function EmotionalSkill3D({ skill, position, accuracy = 0.5 }) {
  const skillRef = useRef();

  useFrame((state) => {
    if (skillRef.current) {
      const pulse = 1 + accuracy * Math.sin(state.clock.elapsedTime * 4) * 0.2;
      skillRef.current.scale.setScalar(pulse);
    }
  });

  const color = accuracy > 0.8 ? '#10b981' : accuracy > 0.6 ? '#3b82f6' : '#a855f7';

  return (
    <group position={position}>
      <Sphere ref={skillRef} args={[0.15, 16, 16]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={accuracy} />
      </Sphere>
      <Text position={[0, -0.3, 0]} fontSize={0.07} color="#ffffff">
        {(accuracy * 100).toFixed(0)}%
      </Text>
      <Sparkles count={Math.floor(accuracy * 15)} scale={0.5} size={2} speed={0.6} color={color} />
    </group>
  );
}

function TrainingProgressBar3D({ training, position }) {
  const skills = [
    { name: 'Physio', value: training?.physiological_signal_integration?.neural_activity_correlation || 0.5 },
    { name: 'Linguistic', value: training?.linguistic_analysis_skills?.sentiment_granularity || 0.5 },
    { name: 'Crisis', value: training?.proactive_intervention_training?.crisis_detection || 0.5 }
  ];

  return (
    <group position={position}>
      {skills.map((skill, idx) => (
        <EmotionalSkill3D 
          key={idx}
          skill={skill.name}
          position={[idx * 0.8 - 0.8, 0, 0]}
          accuracy={skill.value}
        />
      ))}
    </group>
  );
}

function TrainingScene({ training }) {
  return (
    <>
      <gridHelper args={[8, 8, '#334155', '#1e293b']} />
      
      {training && (
        <TrainingProgressBar3D training={training} position={[0, 1, 0]} />
      )}

      {/* Training core */}
      <Sphere args={[0.4, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1.2} />
      </Sphere>

      {/* Complex emotional states */}
      {training?.complex_emotional_states?.slice(0, 5).map((emotion, idx) => {
        const angle = (idx / 5) * Math.PI * 2;
        return (
          <Sphere key={idx} args={[0.1, 12, 12]} position={[Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5]}>
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={emotion.recognition_accuracy} />
          </Sphere>
        );
      })}
    </>
  );
}

export default function CompanionEmotionalTraining3D() {
  const queryClient = useQueryClient();

  const { data: trainingSessions = [] } = useQuery({
    queryKey: ['companion-training'],
    queryFn: () => base44.entities.CompanionEmotionalTraining.list('-created_date', 10),
    initialData: []
  });

  const { data: companions = [] } = useQuery({
    queryKey: ['companions-training'],
    queryFn: () => base44.entities.SentientAICompanion.list('-created_date', 5),
    initialData: []
  });

  const trainMutation = useMutation({
    mutationFn: async (focus) => {
      const response = await base44.functions.invoke('companion-emotional-training', {
        companion_id: companions[0]?.companion_id,
        training_focus: focus
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['companion-training']);
      queryClient.invalidateQueries(['companions-training']);
      toast.success(`Emotional IQ: ${data.new_emotional_iq?.toFixed(0)}%`);
    }
  });

  const latestTraining = trainingSessions[0];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-pink-400" />
            Emotional Intelligence Training
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => trainMutation.mutate('physiological_signals')}
              disabled={trainMutation.isPending}
              size="sm"
              className="bg-gradient-to-r from-red-600 to-pink-600"
            >
              {trainMutation.isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Activity className="w-3 h-3 mr-2" />}
              Physiological
            </Button>
            <Button
              onClick={() => trainMutation.mutate('linguistic_nuances')}
              disabled={trainMutation.isPending}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              {trainMutation.isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Brain className="w-3 h-3 mr-2" />}
              Linguistic
            </Button>
            <Button
              onClick={() => trainMutation.mutate('complex_emotions')}
              disabled={trainMutation.isPending}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {trainMutation.isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Heart className="w-3 h-3 mr-2" />}
              Complex Emotions
            </Button>
            <Button
              onClick={() => trainMutation.mutate('crisis_intervention')}
              disabled={trainMutation.isPending}
              size="sm"
              className="bg-gradient-to-r from-orange-600 to-red-600"
            >
              {trainMutation.isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Zap className="w-3 h-3 mr-2" />}
              Crisis
            </Button>
          </div>

          {latestTraining && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <p className="text-purple-300 font-bold text-sm mb-2">Latest Training: {latestTraining.training_focus}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-400">Neural Correlation</p>
                  <p className="text-pink-400 font-bold">{(latestTraining.physiological_signal_integration?.neural_activity_correlation * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-slate-400">Subtext Detection</p>
                  <p className="text-cyan-400 font-bold">{(latestTraining.linguistic_analysis_skills?.subtext_detection * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-slate-400">Crisis Detection</p>
                  <p className="text-orange-400 font-bold">{(latestTraining.proactive_intervention_training?.crisis_detection * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-slate-400">Empathy Gain</p>
                  <p className="text-green-400 font-bold">+{(latestTraining.training_outcomes?.empathy_improvement * 100).toFixed(0)}%</p>
                </div>
              </div>
              {latestTraining.complex_emotional_states?.length > 0 && (
                <div className="mt-2">
                  <p className="text-slate-400 text-xs mb-1">Emotional States Mastered:</p>
                  <div className="flex flex-wrap gap-1">
                    {latestTraining.complex_emotional_states.map((e, idx) => (
                      <Badge key={idx} className="bg-purple-500/30 text-xs">{e.emotion_cluster}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[400px]">
            <Canvas camera={{ position: [3, 2, 3], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[5, 8, 5]} intensity={2} color="#ec4899" />
              <pointLight position={[-5, 5, -5]} intensity={1.5} color="#a855f7" />

              <TrainingScene training={latestTraining} />

              <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.6} />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}