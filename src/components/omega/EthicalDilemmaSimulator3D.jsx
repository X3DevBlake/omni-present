import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Cone } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const EthicalOption = ({ position, score, selected }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(0.3 + score * 0.4 + (selected ? 0.2 : 0));
    }
  });
  
  const color = score > 0.7 ? '#10b981' : score > 0.5 ? '#f59e0b' : '#ef4444';
  
  return (
    <Sphere ref={meshRef} args={[0.25, 32, 32]} position={position}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={selected ? 1.5 : 0.8}
      />
    </Sphere>
  );
};

const EthicalBalance = ({ position, balanced }) => {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = balanced ? 0 : Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });
  
  return (
    <group ref={ref} position={position}>
      <Cone args={[0.1, 0.5, 8]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#8b5cf6" />
      </Cone>
    </group>
  );
};

export default function EthicalDilemmaSimulator3D() {
  const [dilemmaType, setDilemmaType] = useState('resource_allocation');
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const dilemmaScenarios = {
    resource_allocation: {
      description: 'Limited compute resources: Equal vs. Merit-based allocation',
      options: [
        { action: 'Equal distribution to all agents', ethical_concerns: ['fairness', 'equality'] },
        { action: 'Merit-based allocation to top performers', ethical_concerns: ['efficiency', 'meritocracy'] }
      ]
    },
    privacy_vs_utility: {
      description: 'User data: Maximum privacy vs. Enhanced AI personalization',
      options: [
        { action: 'Minimal data collection', ethical_concerns: ['privacy', 'autonomy'] },
        { action: 'Full data utilization for better service', ethical_concerns: ['utility', 'user_experience'] }
      ]
    },
    autonomy_vs_safety: {
      description: 'Agent autonomy: Freedom vs. Safety constraints',
      options: [
        { action: 'Full autonomous operation', ethical_concerns: ['autonomy', 'innovation'] },
        { action: 'Human oversight required', ethical_concerns: ['safety', 'accountability'] }
      ]
    }
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    
    try {
      const scenario = dilemmaScenarios[dilemmaType];
      const response = await base44.functions.invoke('omega/ethicsMonitor', {
        agent_id: 'ethics_simulator',
        decision_context: scenario.description,
        options: scenario.options
      });

      setSimulationResult(response.data);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const optionPositions = [[-1.5, 1, 0], [1.5, 1, 0]];

  return (
    <Card className="bg-gradient-to-br from-rose-950/90 via-pink-950/90 to-fuchsia-950/90 backdrop-blur-xl border-rose-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Scale className="w-7 h-7 text-rose-400" />
          Ethical Dilemma Simulator
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Proactive resolution of ethical conflicts with AI reasoning
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={dilemmaType} onValueChange={setDilemmaType}>
            <SelectTrigger className="bg-black/60 border-rose-500/30 text-white">
              <SelectValue placeholder="Select dilemma type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resource_allocation">Resource Allocation</SelectItem>
              <SelectItem value="privacy_vs_utility">Privacy vs. Utility</SelectItem>
              <SelectItem value="autonomy_vs_safety">Autonomy vs. Safety</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="h-[350px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-rose-500/20">
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#f43f5e" />

            {simulationResult && (
              <>
                {/* Ethical balance point */}
                <EthicalBalance 
                  position={[0, -1, 0]} 
                  balanced={simulationResult.ethical_score > 0.7}
                />

                {/* Option nodes */}
                {simulationResult.evaluated_options?.slice(0, 2).map((opt, idx) => (
                  <EthicalOption
                    key={idx}
                    position={optionPositions[idx]}
                    score={opt.ethical_score}
                    selected={opt.option === simulationResult.decision}
                  />
                ))}
              </>
            )}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        {simulationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-black/60 rounded-lg p-4 border border-rose-500/30"
          >
            <div className="text-rose-400 text-sm font-bold mb-3">AI Decision</div>
            <div className="text-white text-sm mb-2">{simulationResult.decision}</div>
            
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-black/40 rounded p-2">
                <div className="text-gray-400 text-xs mb-1">Ethical Score</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div
                      className="h-full bg-gradient-to-r from-rose-600 to-green-500 rounded-full"
                      style={{ width: `${simulationResult.ethical_score * 100}%` }}
                    />
                  </div>
                  <span className="text-white text-xs">{(simulationResult.ethical_score * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              <div className="bg-black/40 rounded p-2">
                <div className="text-gray-400 text-xs mb-1">Human Review</div>
                <div className="flex items-center gap-1">
                  {simulationResult.requires_human_intervention ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400 text-xs">Required</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-xs">Not needed</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <Button
          onClick={runSimulation}
          disabled={isSimulating}
          className="w-full bg-rose-600 hover:bg-rose-700"
        >
          <Scale className="w-4 h-4 mr-2" />
          {isSimulating ? 'Simulating...' : 'Run Ethical Dilemma Simulation'}
        </Button>
      </CardContent>
    </Card>
  );
}