import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

function DecisionNode({ decision, position, index }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2 + index) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const ethicalScore = decision.ethical_alignment_score || 0.5;
  const color = ethicalScore > 0.8 ? '#00ff88' : ethicalScore > 0.5 ? '#ffaa00' : '#ff4444';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.08} color="white" anchorX="center">
        {decision.decision?.slice(0, 20)}...
      </Text>
      <Text position={[0, -0.4, 0]} fontSize={0.06} color={color} anchorX="center">
        Ethics: {(ethicalScore * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function TrainingScene({ decisions }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#00ffff" />

      <Text position={[0, 4, 0]} fontSize={0.4} color="#ffffff" anchorX="center">
        AGENT TRAINING
      </Text>

      <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={1} />
      </Sphere>

      {decisions.map((decision, idx) => {
        const angle = (idx / decisions.length) * Math.PI * 2;
        const radius = 3;
        const position = [Math.cos(angle) * radius, Math.sin(idx * 0.5), Math.sin(angle) * radius];
        
        return (
          <React.Fragment key={idx}>
            <DecisionNode decision={decision} position={position} index={idx} />
            <Line
              points={[[0, 0, 0], position]}
              color="#ff00ff"
              lineWidth={2}
              transparent
              opacity={0.3}
            />
          </React.Fragment>
        );
      })}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function AgentTrainingModule3D() {
  const [activeScenario, setActiveScenario] = useState(null);

  const { data: scenarios = [] } = useQuery({
    queryKey: ['training-scenarios'],
    queryFn: () => base44.entities.AgentTrainingScenario.list('-created_date', 10),
    initialData: []
  });

  const createScenarioMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('agentTrainingOrchestrator', {
        action: 'create_training_scenario',
        scenario_name: 'Advanced Ethical Training',
        complexity: 8,
        dilemmas: [
          {
            dilemma_type: 'resource_allocation',
            description: 'Critical resource shortage affecting multiple agents',
            stakes: 'high',
            options: ['Prioritize urgent needs', 'Equal distribution', 'Merit-based', 'Random lottery']
          }
        ]
      });
      return response.data;
    },
    onSuccess: (data) => {
      setActiveScenario(data.scenario);
      toast.success('Training scenario created!');
    }
  });

  const runTrainingMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('agentTrainingOrchestrator', {
        action: 'run_training_session',
        scenario_id: activeScenario.scenario_id,
        agent_id: 'test_agent_1'
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Training session completed!');
    }
  });

  const decisions = activeScenario?.agent_decisions || scenarios[0]?.agent_decisions || [];

  return (
    <Card className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Brain className="w-8 h-8 text-purple-400 animate-pulse" />
          AI-Driven Agent Training Module
          <Badge className="bg-purple-500/30 text-purple-300">
            {scenarios.length} SCENARIOS
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <Brain className="w-4 h-4 text-purple-400 mb-1" />
            <div className="text-white text-xl font-bold">{scenarios.length}</div>
            <div className="text-white/60 text-xs">Scenarios</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-pink-500/30">
            <Zap className="w-4 h-4 text-pink-400 mb-1" />
            <div className="text-white text-xl font-bold">{decisions.length}</div>
            <div className="text-white/60 text-xs">Decisions</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-orange-500/30">
            <TrendingUp className="w-4 h-4 text-orange-400 mb-1" />
            <div className="text-white text-xl font-bold">
              {decisions.length > 0 
                ? (decisions.reduce((s, d) => s + d.ethical_alignment_score, 0) / decisions.length * 100).toFixed(0)
                : 0}%
            </div>
            <div className="text-white/60 text-xs">Avg Ethics</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-red-500/30">
            <AlertTriangle className="w-4 h-4 text-red-400 mb-1" />
            <div className="text-white text-xl font-bold">
              {decisions.filter(d => d.ethical_alignment_score < 0.5).length}
            </div>
            <div className="text-white/60 text-xs">Concerns</div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => createScenarioMutation.mutate()}
            disabled={createScenarioMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Create New Scenario
          </Button>
          {activeScenario && (
            <Button
              onClick={() => runTrainingMutation.mutate()}
              disabled={runTrainingMutation.isPending}
              className="bg-pink-600 hover:bg-pink-700"
            >
              Run Training Session
            </Button>
          )}
        </div>

        <div className="h-[500px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [6, 4, 6], fov: 60 }}>
            <color attach="background" args={['#0a0010']} />
            <fog attach="fog" args={['#0a0010', 5, 25]} />
            <TrainingScene decisions={decisions} />
          </Canvas>
        </div>

        {activeScenario && (
          <div className="mt-4 bg-purple-500/20 border border-purple-500/50 p-4 rounded-lg">
            <div className="text-white font-bold mb-2">{activeScenario.scenario_name}</div>
            <div className="text-white/70 text-sm mb-2">
              Complexity: {activeScenario.complexity_level}/10
            </div>
            {activeScenario.ai_feedback && (
              <div className="space-y-2 mt-3">
                <div className="text-purple-400 text-xs font-bold">AI Feedback:</div>
                <div className="text-white/80 text-xs">
                  Overall Score: {(activeScenario.ai_feedback.overall_score * 100).toFixed(0)}%
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}