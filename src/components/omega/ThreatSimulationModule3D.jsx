import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Target, Zap, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

function ThreatActorNode({ position, threat, selected, onClick }) {
  const color = threat.sophistication_level > 0.7 ? '#ef4444' : '#f59e0b';
  
  return (
    <group position={position} onClick={() => onClick(threat)}>
      <Sphere args={[0.3, 32, 32]}>
        <meshStandardMaterial 
          color={color}
          emissive={selected ? color : '#000'}
          emissiveIntensity={selected ? 0.5 : 0}
        />
      </Sphere>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.15}
        color="white"
      >
        {threat.actor_id.slice(-4)}
      </Text>
    </group>
  );
}

function DefenseLayer({ radius, active }) {
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push([
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0
    ]);
  }
  
  return (
    <Line
      points={points}
      color={active ? '#22c55e' : '#6b7280'}
      lineWidth={2}
      opacity={0.6}
    />
  );
}

function AttackVector({ from, to, active }) {
  if (!active) return null;
  
  return (
    <Line
      points={[from, to]}
      color="#ef4444"
      lineWidth={2}
      dashed
      dashScale={10}
    />
  );
}

export default function ThreatSimulationModule3D() {
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [attackVectors, setAttackVectors] = useState([]);
  const [difficultyLevel, setDifficultyLevel] = useState(0.5);

  const { data: scenarios, refetch } = useQuery({
    queryKey: ['threatScenarios'],
    queryFn: () => base44.entities.ThreatSimulationScenario.list(),
    initialData: []
  });

  const generateThreat = async () => {
    try {
      const response = await base44.functions.invoke('generateThreatProfile', {
        geopolitical_context: 'adversarial_state_actor',
        cyber_landscape: 'advanced_persistent_threat',
        difficulty_level: difficultyLevel
      });
      
      if (response.data.success) {
        refetch();
      }
    } catch (error) {
      console.error('Failed to generate threat:', error);
    }
  };

  const runSimulation = () => {
    setSimulationRunning(true);
    setAttackVectors([]);
    
    // Simulate attack vectors
    const vectors = [];
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        vectors.push({
          from: [Math.random() * 4 - 2, Math.random() * 4 - 2, 0],
          to: [0, 0, 0]
        });
        setAttackVectors([...vectors]);
      }, i * 500);
    }
    
    setTimeout(() => setSimulationRunning(false), 3000);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-xl border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="w-6 h-6 text-red-400" />
            AI-Driven Threat Simulation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] rounded-lg bg-black/60 mb-4">
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              
              {/* Defense Layers */}
              <DefenseLayer radius={1.5} active={!simulationRunning} />
              <DefenseLayer radius={2.5} active={!simulationRunning} />
              <DefenseLayer radius={3.5} active={!simulationRunning} />
              
              {/* Center - Protected Asset */}
              <Sphere args={[0.4, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
              </Sphere>
              
              {/* Threat Actors */}
              {scenarios.slice(0, 5).map((scenario, idx) => 
                scenario.threat_actors?.map((threat, tIdx) => (
                  <ThreatActorNode
                    key={`${idx}-${tIdx}`}
                    position={[
                      Math.cos((idx + tIdx) * 0.8) * 4,
                      Math.sin((idx + tIdx) * 0.8) * 4,
                      0
                    ]}
                    threat={threat}
                    selected={selectedThreat?.actor_id === threat.actor_id}
                    onClick={setSelectedThreat}
                  />
                ))
              )}
              
              {/* Attack Vectors */}
              {attackVectors.map((vector, idx) => (
                <AttackVector
                  key={idx}
                  from={vector.from}
                  to={vector.to}
                  active={true}
                />
              ))}
              
              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-black/40 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-400">Active Scenarios</span>
              </div>
              <div className="text-2xl font-bold text-white">{scenarios.length}</div>
            </div>
            
            <div className="bg-black/40 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Vulnerabilities</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {scenarios.reduce((sum, s) => sum + (s.simulation_results?.vulnerabilities_exposed?.length || 0), 0)}
              </div>
            </div>
            
            <div className="bg-black/40 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">Success Rate</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {scenarios.length > 0 
                  ? Math.round((scenarios.reduce((sum, s) => sum + (s.simulation_results?.success_rate || 0), 0) / scenarios.length) * 100)
                  : 0}%
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <Button 
              onClick={generateThreat}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate AI Threat
            </Button>
            <Button 
              onClick={runSimulation}
              disabled={simulationRunning || scenarios.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              Run Simulation
            </Button>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-2 block">
              Difficulty Level: {Math.round(difficultyLevel * 10)}/10
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {selectedThreat && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-950/30 border border-red-500/30 rounded-lg p-4"
            >
              <h3 className="font-bold text-white mb-2">Threat Actor Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sophistication:</span>
                  <Badge variant={selectedThreat.sophistication_level > 0.7 ? 'destructive' : 'default'}>
                    {Math.round(selectedThreat.sophistication_level * 100)}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Capabilities:</span>
                  <span className="text-white">{selectedThreat.capabilities?.length || 0}</span>
                </div>
                <div>
                  <span className="text-gray-400">Behaviors:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedThreat.behaviors?.slice(0, 3).map((behavior, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {behavior.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}