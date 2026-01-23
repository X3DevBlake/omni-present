import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

function PersonalityTrait({ trait, index, total }) {
  const meshRef = useRef();
  const angle = (index / total) * Math.PI * 2;
  const radius = trait.strength * 4;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = trait.strength * 2;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const pulse = Math.sin(state.clock.elapsedTime * 2 + index) * 0.1 + 1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group position={[x, y, z]}>
      <Sphere ref={meshRef} args={[trait.strength * 0.5, 16, 16]}>
        <meshStandardMaterial
          color="#FF00FF"
          emissive="#FF00FF"
          emissiveIntensity={trait.strength}
        />
      </Sphere>
      <Text
        position={[0, trait.strength * 0.7, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {trait.trait_name}
      </Text>
    </group>
  );
}

function PersonalityCore({ snapshot }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;
    }
  });

  const avgScore = Object.values(snapshot || {}).reduce((sum, val) => 
    sum + (typeof val === 'number' ? val : 0), 0
  ) / Object.keys(snapshot || {}).length;

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]}>
      <meshStandardMaterial
        color="#8800FF"
        emissive="#8800FF"
        emissiveIntensity={avgScore}
        wireframe
      />
    </Sphere>
  );
}

function EvolutionScene({ evolution }) {
  const traits = evolution?.learned_traits || [];
  const snapshot = evolution?.personality_snapshot || {};

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#FF00FF" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00FFFF" />
      
      <OrbitControls autoRotate autoRotateSpeed={0.5} />

      <PersonalityCore snapshot={snapshot} />

      {traits.map((trait, idx) => (
        <PersonalityTrait
          key={idx}
          trait={trait}
          index={idx}
          total={traits.length}
        />
      ))}

      <Text
        position={[0, -3, 0]}
        fontSize={0.5}
        color="#FF00FF"
        anchorX="center"
      >
        Personality Evolution
      </Text>
    </>
  );
}

export default function PersonalityEvolutionDashboard3D({ agentId }) {
  const queryClient = useQueryClient();

  const { data: evolutions = [] } = useQuery({
    queryKey: ['personality-evolution', agentId],
    queryFn: () => base44.entities.AgentPersonalityEvolution.filter({ agent_id: agentId }),
    refetchInterval: 10000
  });

  const { data: driftAnalysis = [] } = useQuery({
    queryKey: ['drift-analysis', agentId],
    queryFn: () => base44.entities.PersonalityDriftAnalysis.filter({ agent_id: agentId })
  });

  const analyzeDriftMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('personalityDriftAnalyzer', { agent_id: agentId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drift-analysis'] });
      toast.success('Drift analysis complete');
    }
  });

  const currentEvolution = evolutions[evolutions.length - 1];
  const latestDrift = driftAnalysis[driftAnalysis.length - 1];

  const isDriftConcerning = latestDrift?.drift_assessment === 'concerning' || 
                             latestDrift?.drift_assessment === 'critical';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-gradient-to-br from-purple-950 to-pink-950 border-purple-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              Personality Evolution
            </span>
            <Badge variant="outline" className="bg-purple-900 text-purple-200">
              v{currentEvolution?.version || '1.0.0'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full rounded-lg overflow-hidden bg-black">
            <Canvas camera={{ position: [6, 6, 6], fov: 60 }}>
              <color attach="background" args={['#110022']} />
              <fog attach="fog" args={['#110022', 5, 30]} />
              <EvolutionScene evolution={currentEvolution} />
            </Canvas>
          </div>

          {currentEvolution && (
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-400">Communication:</div>
                <div className="text-white">{currentEvolution.personality_snapshot?.communication_style}</div>
                <div className="text-slate-400">Empathy:</div>
                <div className="text-white">{(currentEvolution.personality_snapshot?.empathy_score * 100).toFixed(0)}%</div>
                <div className="text-slate-400">Creativity:</div>
                <div className="text-white">{(currentEvolution.personality_snapshot?.creativity_index * 100).toFixed(0)}%</div>
                <div className="text-slate-400">Learned Traits:</div>
                <div className="text-white">{currentEvolution.learned_traits?.length || 0}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Personality Drift Analysis
              </CardTitle>
              {isDriftConcerning && (
                <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => analyzeDriftMutation.mutate()}
              disabled={analyzeDriftMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {analyzeDriftMutation.isPending ? 'Analyzing...' : 'Analyze Drift'}
            </Button>

            {latestDrift && (
              <div className="space-y-3">
                <div className={`p-3 rounded-lg border ${
                  isDriftConcerning 
                    ? 'bg-red-900/20 border-red-700' 
                    : 'bg-green-900/20 border-green-700'
                }`}>
                  <div className="text-sm font-medium mb-2 text-white">
                    Assessment: {latestDrift.drift_assessment}
                  </div>
                  <div className="text-xs text-slate-300">
                    Magnitude: {latestDrift.drift_metrics?.overall_drift_magnitude?.toFixed(2)}
                  </div>
                </div>

                {latestDrift.recommendations?.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-slate-400">Recommendations:</div>
                    {latestDrift.recommendations.slice(0, 3).map((rec, idx) => (
                      <div key={idx} className="p-2 bg-slate-800 rounded text-xs text-slate-300">
                        {rec.action}
                      </div>
                    ))}
                  </div>
                )}

                {latestDrift.drift_triggers?.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-slate-400">Drift Triggers:</div>
                    {latestDrift.drift_triggers.slice(0, 2).map((trigger, idx) => (
                      <div key={idx} className="p-2 bg-slate-800 rounded text-xs">
                        <div className="text-white">{trigger.trigger_type}</div>
                        <div className="text-slate-400">{trigger.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {currentEvolution?.learned_traits && currentEvolution.learned_traits.length > 0 && (
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Learned Traits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentEvolution.learned_traits.slice(0, 5).map((trait, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                    <span className="text-white text-sm">{trait.trait_name}</span>
                    <Badge variant="outline" className="bg-purple-900 text-purple-200">
                      {(trait.strength * 100).toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}