import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import * as THREE from 'three';
import { Workflow, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const SimulatedAgent = ({ position, behavior, state }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01 * behavior.speed;
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.08;
      meshRef.current.scale.setScalar(0.2 + behavior.cooperation * 0.15 + pulse);
    }
  });
  
  const stateColors = {
    exploring: '#3b82f6',
    collaborating: '#10b981',
    optimizing: '#f59e0b',
    idle: '#6b7280'
  };
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.2, 24, 24]}>
        <meshStandardMaterial
          color={stateColors[state]}
          emissive={stateColors[state]}
          emissiveIntensity={1.2}
        />
      </Sphere>
    </group>
  );
};

const CollectiveIntelligenceField = ({ centerPos, radius, strength }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.15;
      meshRef.current.material.opacity = 0.15 + strength * 0.25;
    }
  });
  
  return (
    <Sphere ref={meshRef} args={[radius, 32, 32]} position={centerPos}>
      <meshStandardMaterial
        color="#8b5cf6"
        transparent
        opacity={0.3}
        wireframe
      />
    </Sphere>
  );
};

export default function MultiAgentSimulationEnvironment3D() {
  const [isRunning, setIsRunning] = useState(false);
  const [scenario, setScenario] = useState(null);
  const [agentCount, setAgentCount] = useState([8]);
  const [cooperationLevel, setCooperationLevel] = useState([0.7]);

  const generateScenario = async () => {
    try {
      const response = await base44.functions.invoke('omega/scenarioGenerator', {
        agent_count: agentCount[0],
        cooperation_factor: cooperationLevel[0],
        challenge_type: 'resource_competition'
      });
      
      setScenario(response.data);
      setIsRunning(true);
    } catch (error) {
      console.error('Scenario generation failed:', error);
    }
  };

  const simulatedAgents = scenario?.agents || [];
  const collectiveScore = scenario?.collective_intelligence_score || 0;

  return (
    <Card className="bg-gradient-to-br from-violet-950/90 via-purple-950/90 to-fuchsia-950/90 backdrop-blur-xl border-violet-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Workflow className="w-7 h-7 text-violet-400" />
          Multi-Agent Simulation Lab
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Test swarm behaviors with AI-generated what-if scenarios
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              Agent Count: {agentCount[0]}
            </label>
            <Slider
              value={agentCount}
              onValueChange={setAgentCount}
              min={3}
              max={20}
              step={1}
              className="bg-black/60"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              Cooperation Level: {(cooperationLevel[0] * 100).toFixed(0)}%
            </label>
            <Slider
              value={cooperationLevel}
              onValueChange={setCooperationLevel}
              min={0}
              max={1}
              step={0.1}
              className="bg-black/60"
            />
          </div>
        </div>

        <div className="h-[450px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-violet-500/20">
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />

            {simulatedAgents.map((agent, idx) => {
              const angle = (idx / simulatedAgents.length) * Math.PI * 2;
              const radius = 2.5;
              return (
                <SimulatedAgent
                  key={idx}
                  position={[
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    Math.sin(idx) * 0.5
                  ]}
                  behavior={agent.behavior || { speed: 1, cooperation: cooperationLevel[0] }}
                  state={agent.state || 'exploring'}
                />
              );
            })}

            {isRunning && (
              <CollectiveIntelligenceField
                centerPos={[0, 0, 0]}
                radius={3}
                strength={collectiveScore}
              />
            )}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/60 rounded-lg p-3 border border-violet-500/30">
            <div className="text-violet-400 text-xs mb-1">Agents Active</div>
            <div className="text-white text-2xl font-bold">{simulatedAgents.length}</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-purple-500/30">
            <div className="text-purple-400 text-xs mb-1">Collective IQ</div>
            <div className="text-white text-2xl font-bold">
              {(collectiveScore * 100).toFixed(0)}
            </div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-fuchsia-500/30">
            <div className="text-fuchsia-400 text-xs mb-1">Emergent Goals</div>
            <div className="text-white text-2xl font-bold">
              {scenario?.emergent_goals_count || 0}
            </div>
          </div>
        </div>

        {scenario && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 rounded-lg p-4 border border-violet-500/30 mb-4"
          >
            <div className="text-violet-400 text-sm font-bold mb-2">Scenario Details</div>
            <div className="text-gray-300 text-xs space-y-1">
              <div>Challenge: {scenario.challenge_description}</div>
              <div>Predicted Outcome: {scenario.predicted_outcome}</div>
              <div>Success Probability: {(scenario.success_probability * 100).toFixed(0)}%</div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={generateScenario}
            className="flex-1 bg-violet-600 hover:bg-violet-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Scenario
          </Button>
          <Button
            onClick={() => setIsRunning(!isRunning)}
            variant="outline"
            className="border-violet-500/30"
            disabled={!scenario}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            onClick={() => { setScenario(null); setIsRunning(false); }}
            variant="outline"
            className="border-violet-500/30"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}