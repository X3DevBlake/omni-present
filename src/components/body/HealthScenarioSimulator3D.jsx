import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Html, Text, Sparkles } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Activity, Play, AlertTriangle, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

function TrajectoryPath3D({ outcomes = [], baseline = 75 }) {
  const lineRef = useRef();

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  const points = outcomes.map((outcome, idx) => {
    const x = idx * 1.2;
    const y = (outcome.predicted_health_score - baseline) / 30;
    return [x, y, 0];
  });

  const avgScore = outcomes.reduce((sum, o) => sum + o.predicted_health_score, 0) / outcomes.length;
  const color = avgScore > baseline + 10 ? '#10b981' : avgScore < baseline - 10 ? '#ef4444' : '#3b82f6';

  return (
    <group>
      {points.length > 1 && (
        <Line ref={lineRef} points={points} color={color} lineWidth={4} transparent />
      )}
      {points.map((point, idx) => {
        const outcome = outcomes[idx];
        const isRisky = outcome.predicted_health_score < baseline - 5;
        
        return (
          <group key={idx} position={point}>
            <Sphere args={[0.12, 16, 16]}>
              <meshStandardMaterial 
                color={isRisky ? '#ef4444' : color} 
                emissive={isRisky ? '#ef4444' : color} 
                emissiveIntensity={0.8} 
              />
            </Sphere>
            <Text position={[0, -0.3, 0]} fontSize={0.08} color="#ffffff">
              {outcome.timeline_days}d
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function RiskFactorIndicators3D({ risks = [] }) {
  return (
    <group>
      {risks.slice(0, 5).map((risk, idx) => {
        const angle = (idx / 5) * Math.PI * 2;
        const radius = 2.5;
        const height = risk.probability * 2;
        const position = [Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius];
        
        const severityColor = risk.severity === 'high' ? '#ef4444' : risk.severity === 'medium' ? '#f59e0b' : '#3b82f6';
        
        return (
          <group key={idx} position={position}>
            <Box args={[0.2, height, 0.2]}>
              <meshStandardMaterial color={severityColor} emissive={severityColor} emissiveIntensity={0.6} />
            </Box>
            <Text position={[0, height / 2 + 0.3, 0]} fontSize={0.08} color="#ffffff">
              {risk.risk_type}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function ScenarioScene({ scenario, baseline }) {
  return (
    <>
      <gridHelper args={[10, 10, '#334155', '#1e293b']} />
      
      {scenario?.predicted_outcomes && (
        <TrajectoryPath3D 
          outcomes={scenario.predicted_outcomes} 
          baseline={baseline}
        />
      )}

      {scenario?.risk_factors && (
        <RiskFactorIndicators3D risks={scenario.risk_factors} />
      )}

      {/* Baseline reference */}
      <Sphere args={[0.2, 16, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </Sphere>
      <Text position={[0, -0.5, 0]} fontSize={0.1} color="#ffffff">
        Baseline
      </Text>
    </>
  );
}

export default function HealthScenarioSimulator3D() {
  const queryClient = useQueryClient();
  const [scenarioDesc, setScenarioDesc] = useState('');
  const [physicalInt, setPhysicalInt] = useState('');
  const [cognitiveInt, setCognitiveInt] = useState('');
  const [emotionalInt, setEmotionalInt] = useState('');

  const { data: scenarios = [] } = useQuery({
    queryKey: ['health-scenarios'],
    queryFn: () => base44.entities.HealthScenarioSimulation.list('-created_date', 10),
    initialData: []
  });

  const { data: trajectories = [] } = useQuery({
    queryKey: ['base-trajectories'],
    queryFn: () => base44.entities.OmegaHealthTrajectory.list('-created_date', 1),
    initialData: []
  });

  const simulateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('health-scenario-simulator', {
        scenario_description: scenarioDesc,
        intervention_parameters: {
          physical_interventions: physicalInt ? [physicalInt] : [],
          cognitive_interventions: cognitiveInt ? [cognitiveInt] : [],
          emotional_interventions: emotionalInt ? [emotionalInt] : []
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['health-scenarios']);
      toast.success('Scenario simulated');
    }
  });

  const latestScenario = scenarios[0];
  const baselineScore = trajectories[0]?.unified_health_score || 75;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-400" />
            Health Trajectory Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Textarea
              value={scenarioDesc}
              onChange={(e) => setScenarioDesc(e.target.value)}
              placeholder="Describe what-if scenario (e.g., 'What if I meditate 30min daily for 3 months?')"
              className="bg-slate-800 border-slate-600 text-white"
              rows={2}
            />
            
            <div className="grid grid-cols-3 gap-2">
              <Input
                value={physicalInt}
                onChange={(e) => setPhysicalInt(e.target.value)}
                placeholder="Physical (e.g., daily exercise)"
                className="bg-slate-800 border-slate-600 text-white text-sm"
              />
              <Input
                value={cognitiveInt}
                onChange={(e) => setCognitiveInt(e.target.value)}
                placeholder="Cognitive (e.g., meditation)"
                className="bg-slate-800 border-slate-600 text-white text-sm"
              />
              <Input
                value={emotionalInt}
                onChange={(e) => setEmotionalInt(e.target.value)}
                placeholder="Emotional (e.g., therapy)"
                className="bg-slate-800 border-slate-600 text-white text-sm"
              />
            </div>

            <Button
              onClick={() => simulateMutation.mutate()}
              disabled={!scenarioDesc || simulateMutation.isPending}
              className="w-full bg-gradient-to-r from-green-600 to-cyan-600"
            >
              {simulateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Run What-If Simulation
            </Button>
          </div>

          {latestScenario && (
            <div className="space-y-3">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-green-300 font-bold text-sm mb-2">{latestScenario.scenario_description}</p>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {latestScenario.predicted_outcomes?.slice(0, 4).map((out, idx) => (
                    <div key={idx} className="bg-slate-800/50 rounded p-2">
                      <p className="text-slate-400">{out.timeline_days}d</p>
                      <p className="text-white font-bold">{out.predicted_health_score}/100</p>
                    </div>
                  ))}
                </div>
              </div>

              {latestScenario.risk_factors?.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-300 font-bold text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Risk Factors
                  </p>
                  {latestScenario.risk_factors.slice(0, 3).map((risk, idx) => (
                    <p key={idx} className="text-xs text-slate-300 mb-1">
                      ⚠️ {risk.risk_type}: {(risk.probability * 100).toFixed(0)}% probability
                    </p>
                  ))}
                </div>
              )}

              {latestScenario.synergistic_effects?.length > 0 && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                  <p className="text-cyan-300 font-bold text-sm mb-2">Synergies</p>
                  {latestScenario.synergistic_effects.map((syn, idx) => (
                    <p key={idx} className="text-xs text-cyan-400">
                      ⚡ {syn.effect_type}: {syn.amplification}x boost
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
              <ambientLight intensity={0.5} />
              <pointLight position={[5, 8, 5]} intensity={2} color="#10b981" />
              <pointLight position={[-5, 5, -5]} intensity={1.5} color="#06b6d4" />

              <ScenarioScene 
                scenario={latestScenario}
                baseline={baselineScore}
              />

              <OrbitControls enableZoom={true} />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}