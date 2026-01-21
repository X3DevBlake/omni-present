import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Html, Text, Sparkles, Trail } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Activity, TrendingUp, Zap, Loader2, Heart, Brain, User } from 'lucide-react';
import { toast } from 'sonner';

// Health trajectory path
function HealthTrajectoryPath3D({ trajectories = [] }) {
  const lineRef = useRef();

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  if (trajectories.length === 0) return null;

  const points = trajectories.map((t, idx) => [
    idx * 1.5,
    (t.predicted_health_score / 100) * 3 - 1,
    0
  ]);

  const avgScore = trajectories.reduce((sum, t) => sum + t.predicted_health_score, 0) / trajectories.length;
  const color = avgScore > 75 ? '#10b981' : avgScore > 50 ? '#3b82f6' : '#f59e0b';

  return (
    <group>
      <Line ref={lineRef} points={points} color={color} lineWidth={4} transparent />
      {points.map((point, idx) => (
        <Sphere key={idx} args={[0.12, 16, 16]} position={point}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </Sphere>
      ))}
      <Text position={[points.length * 0.75, 2, 0]} fontSize={0.15} color="#ffffff">
        Health Trajectory
      </Text>
    </group>
  );
}

// System integration visualization
function SystemIntegrationWeb3D({ interventions = [] }) {
  return (
    <group>
      {interventions.slice(0, 6).map((intervention, idx) => {
        const angle = (idx / 6) * Math.PI * 2;
        const radius = 2;
        const position = [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
        
        return (
          <group key={idx} position={position}>
            <Sphere args={[0.15, 16, 16]}>
              <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.6} />
            </Sphere>
            <Line
              points={[[0, 0, 0], [-position[0], -position[1], -position[2]]]}
              color="#00f5ff"
              lineWidth={2}
              transparent
              opacity={0.5}
            />
            <Sparkles count={10} scale={0.5} size={2} speed={0.5} color="#a855f7" />
          </group>
        );
      })}
    </group>
  );
}

function HealthScene({ trajectory, interventions }) {
  return (
    <>
      <gridHelper args={[8, 8, '#334155', '#1e293b']} />
      
      {trajectory?.predicted_trajectories && (
        <HealthTrajectoryPath3D trajectories={trajectory.predicted_trajectories} />
      )}

      {interventions && interventions.length > 0 && (
        <SystemIntegrationWeb3D interventions={interventions} />
      )}

      {/* Central health core */}
      <Trail width={1} length={15} color="#ec4899" attenuation={(t) => t * t}>
        <Sphere args={[0.4, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1} />
        </Sphere>
      </Trail>
    </>
  );
}

export default function UnifiedHealthTrajectoryVisualizer3D() {
  const queryClient = useQueryClient();

  const { data: trajectories = [] } = useQuery({
    queryKey: ['health-trajectories'],
    queryFn: () => base44.entities.OmegaHealthTrajectory.list('-created_date', 5),
    initialData: []
  });

  const unifiedHealthMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('omega-health-integration', {});
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['health-trajectories']);
      toast.success(`Health score: ${data.unified_analysis?.unified_health_score?.toFixed(0)}/100`);
    }
  });

  const latestTrajectory = trajectories[0];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-pink-500/10 to-orange-500/10 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-pink-400" />
            Omega Health AI - Unified Wellness Prediction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => unifiedHealthMutation.mutate()}
            disabled={unifiedHealthMutation.isPending}
            className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 text-lg py-6"
          >
            {unifiedHealthMutation.isPending ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing All Systems...</>
            ) : (
              <><Heart className="w-5 h-5 mr-2" /> Run Unified Health Analysis</>
            )}
          </Button>

          {latestTrajectory && (
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-xl p-4 border border-green-500/40">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-bold">Unified Health Score</p>
                  <Badge className="bg-green-500/30 text-lg">{latestTrajectory.unified_health_score}/100</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-slate-400">Physical</p>
                    <p className="text-green-400 font-bold">{latestTrajectory.holistic_wellness_prediction?.physical_wellness?.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Cognitive</p>
                    <p className="text-cyan-400 font-bold">{latestTrajectory.holistic_wellness_prediction?.cognitive_wellness?.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Emotional</p>
                    <p className="text-purple-400 font-bold">{latestTrajectory.holistic_wellness_prediction?.emotional_wellness?.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Augmentation</p>
                    <p className="text-orange-400 font-bold">{latestTrajectory.holistic_wellness_prediction?.augmentation_wellness?.toFixed(0)}%</p>
                  </div>
                </div>
              </div>

              {latestTrajectory.cross_domain_interventions?.length > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-purple-300 font-bold text-sm mb-2">Integrated Interventions</p>
                  {latestTrajectory.cross_domain_interventions.slice(0, 3).map((int, idx) => (
                    <div key={idx} className="mb-2 bg-slate-800/50 rounded p-2">
                      <p className="text-white text-xs font-bold mb-1">{int.intervention_name}</p>
                      <p className="text-slate-400 text-xs mb-1">{int.domains_affected?.join(' + ')}</p>
                      <Badge className="bg-green-500/30 text-xs">+{(int.expected_improvement * 100).toFixed(0)}% improvement</Badge>
                    </div>
                  ))}
                </div>
              )}

              {latestTrajectory.synergy_effects?.length > 0 && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                  <p className="text-cyan-300 font-bold text-sm mb-2">System Synergies</p>
                  {latestTrajectory.synergy_effects.map((syn, idx) => (
                    <p key={idx} className="text-xs text-slate-300 mb-1">
                      ⚡ {syn.synergy_type}: {syn.amplification_factor}x amplification
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[450px]">
            <Canvas camera={{ position: [4, 3, 4], fov: 50 }}>
              <ambientLight intensity={0.4} />
              <pointLight position={[5, 8, 5]} intensity={1.5} color="#ec4899" />
              <pointLight position={[-5, 5, 5]} intensity={1.2} color="#a855f7" />
              <pointLight position={[0, 8, -5]} intensity={1} color="#06b6d4" />

              <HealthScene 
                trajectory={latestTrajectory}
                interventions={latestTrajectory?.cross_domain_interventions}
              />

              <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.8} />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}