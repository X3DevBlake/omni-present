import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Target, Activity, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function ParameterNode({ position, param, value, label }) {
  const height = value * 3;
  
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, height, 32]} />
        <meshStandardMaterial 
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={value}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      <Text
        position={[0, height + 0.3, 0]}
        fontSize={0.12}
        color="white"
      >
        {Math.round(value * 100)}%
      </Text>
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.1}
        color="#9ca3af"
      >
        {label}
      </Text>
    </group>
  );
}

function AdaptationTimeline({ adaptations }) {
  return (
    <group>
      {adaptations.slice(0, 10).map((adaptation, idx) => {
        const x = (idx - 5) * 0.8;
        const y = adaptation.performance_delta * 2;
        return (
          <group key={idx} position={[x, y, 0]}>
            <Sphere args={[0.1, 16, 16]}>
              <meshStandardMaterial 
                color={adaptation.performance_delta > 0 ? '#22c55e' : '#ef4444'}
                emissive={adaptation.performance_delta > 0 ? '#22c55e' : '#ef4444'}
                emissiveIntensity={0.5}
              />
            </Sphere>
          </group>
        );
      })}
    </group>
  );
}

export default function AgentPersonalizationVisualizer3D() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const queryClient = useQueryClient();

  const { data: profiles } = useQuery({
    queryKey: ['personalizationProfiles'],
    queryFn: () => base44.entities.AgentPersonalizationProfile.list('-created_date', 20),
    initialData: []
  });

  const adaptMutation = useMutation({
    mutationFn: ({ agent_id, mission_context }) => 
      base44.functions.invoke('adaptAgentPersonalization', {
        agent_id,
        swarm_id: 'swarm_001',
        mission_context
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['personalizationProfiles']);
    }
  });

  const runAdaptation = async () => {
    await adaptMutation.mutateAsync({
      agent_id: profiles[0]?.agent_id || 'agent_001',
      mission_context: {
        high_stakes: true,
        team_oriented: true,
        complex_environment: true,
        task_type: 'strategic_planning'
      }
    });
  };

  const selectedProfile = selectedAgent 
    ? profiles.find(p => p.agent_id === selectedAgent)
    : profiles[0];

  const params = selectedProfile?.behavioral_parameters || {};

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-indigo-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="w-6 h-6 text-indigo-400" />
          Agent Personalization & Adaptation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />
            
            {/* Parameter Visualization */}
            <ParameterNode 
              position={[-2, 0, 0]} 
              param="risk_tolerance"
              value={params.risk_tolerance || 0.5}
              label="Risk"
            />
            <ParameterNode 
              position={[-1, 0, 0]} 
              param="cooperation_level"
              value={params.cooperation_level || 0.7}
              label="Coop"
            />
            <ParameterNode 
              position={[0, 0, 0]} 
              param="exploration"
              value={params.exploration_vs_exploitation || 0.5}
              label="Explore"
            />
            <ParameterNode 
              position={[1, 0, 0]} 
              param="communication"
              value={params.communication_frequency || 0.6}
              label="Comm"
            />
            <ParameterNode 
              position={[2, 0, 0]} 
              param="speed"
              value={params.decision_speed_preference || 0.5}
              label="Speed"
            />

            {/* Adaptation Timeline */}
            {selectedProfile?.adaptation_history && (
              <group position={[0, -2, 0]}>
                <AdaptationTimeline adaptations={selectedProfile.adaptation_history} />
              </group>
            )}
            
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-gray-400">Specialization</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.round((selectedProfile?.specialization_score || 0) * 100)}%
            </div>
          </div>

          <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Adaptations</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {selectedProfile?.adaptation_history?.length || 0}
            </div>
          </div>

          <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Avg Success</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {selectedProfile?.historical_performance?.length > 0
                ? Math.round((selectedProfile.historical_performance.reduce((sum, p) => 
                    sum + p.success_rate, 0) / selectedProfile.historical_performance.length) * 100)
                : 0}%
            </div>
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Profiles</span>
            </div>
            <div className="text-2xl font-bold text-white">{profiles.length}</div>
          </div>
        </div>

        <Button 
          onClick={runAdaptation}
          disabled={adaptMutation.isPending}
          className="w-full mb-4 bg-indigo-600 hover:bg-indigo-700"
        >
          <Zap className="w-4 h-4 mr-2" />
          {adaptMutation.isPending ? 'Adapting...' : 'Run AI Adaptation'}
        </Button>

        {selectedProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-950/30 border border-indigo-500/30 rounded-lg p-4"
          >
            <h3 className="font-bold text-white mb-3">Agent Profile: {selectedProfile.agent_id}</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400 block mb-2">Behavioral Parameters:</span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(params).map(([key, value]) => (
                    <div key={key} className="flex justify-between bg-black/40 p-2 rounded">
                      <span className="text-gray-400 text-xs">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-white font-bold text-xs">
                        {Math.round(value * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedProfile.learned_preferences?.preferred_tasks?.length > 0 && (
                <div>
                  <span className="text-gray-400 block mb-1">Preferred Tasks:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedProfile.learned_preferences.preferred_tasks.slice(0, 5).map((task, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {task}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedProfile.adaptation_history?.length > 0 && (
                <div>
                  <span className="text-gray-400 block mb-2">Recent Adaptations:</span>
                  <div className="space-y-1">
                    {selectedProfile.adaptation_history.slice(-3).reverse().map((adapt, idx) => (
                      <div key={idx} className="bg-black/40 p-2 rounded text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="text-white">{adapt.parameter_changed?.replace(/_/g, ' ')}</span>
                          <Badge variant={adapt.new_value > adapt.old_value ? 'default' : 'secondary'} className="text-xs">
                            {adapt.old_value.toFixed(2)} → {adapt.new_value.toFixed(2)}
                          </Badge>
                        </div>
                        <span className="text-gray-500">{adapt.trigger_reason?.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}