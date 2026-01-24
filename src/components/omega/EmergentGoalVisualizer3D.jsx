import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Torus } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Target, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const GoalNode = ({ position, priority, status }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * (0.5 + priority);
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.setScalar(0.5 + priority * 0.5 + pulse);
    }
  });
  
  const statusColors = {
    proposed: '#8b5cf6',
    planning: '#3b82f6',
    executing: '#10b981',
    completed: '#fbbf24',
    blocked: '#ef4444'
  };
  
  return (
    <Sphere ref={meshRef} args={[0.3, 32, 32]} position={position}>
      <meshStandardMaterial
        color={statusColors[status]}
        emissive={statusColors[status]}
        emissiveIntensity={1 + priority}
      />
    </Sphere>
  );
};

const AgentContributor = ({ position, agentId }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
    }
  });
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.15, 16, 16]}>
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.8}
        />
      </Sphere>
      <Text position={[0, 0.3, 0]} fontSize={0.08} color="#60a5fa" anchorX="center">
        {agentId.substr(-4)}
      </Text>
    </group>
  );
};

export default function EmergentGoalVisualizer3D() {
  const [isForming, setIsForming] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);

  const { data: goals } = useQuery({
    queryKey: ['emergent_goals'],
    queryFn: () => base44.entities.EmergentGoal.list('-created_date', 10),
    initialData: []
  });

  const formEmergentGoal = async () => {
    setIsForming(true);
    
    try {
      const response = await base44.functions.invoke('emergentGoalFormation', {
        swarm_id: 'haas_omega_001',
        environmental_context: 'Multi-agent resource optimization required'
      });

      setCurrentGoal(response.data.emergent_goal);
    } catch (error) {
      console.error('Goal formation failed:', error);
    } finally {
      setIsForming(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-950/90 via-purple-950/90 to-violet-950/90 backdrop-blur-xl border-indigo-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Target className="w-7 h-7 text-indigo-400" />
          Emergent Goal Formation
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Autonomous task assignment via GWT collective decision-making
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-indigo-500/20">
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#8b5cf6" />

            {/* Central goal */}
            {currentGoal && (
              <>
                <GoalNode
                  position={[0, 0, 0]}
                  priority={currentGoal.priority_score}
                  status={currentGoal.status}
                />
                <Text position={[0, 0.8, 0]} fontSize={0.15} color="white" anchorX="center">
                  Emergent Goal
                </Text>

                {/* Contributing agents */}
                {currentGoal.contributing_agents?.slice(0, 6).map((agentId, idx) => {
                  const angle = (idx / 6) * Math.PI * 2;
                  const pos = [Math.cos(angle) * 2, Math.sin(angle) * 2, 0];
                  return (
                    <React.Fragment key={agentId}>
                      <AgentContributor position={pos} agentId={agentId} />
                      <Line
                        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(...pos)]}
                        color="#8b5cf6"
                        lineWidth={1.5}
                        transparent
                        opacity={0.4}
                      />
                    </React.Fragment>
                  );
                })}
              </>
            )}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/60 rounded-lg p-3 border border-indigo-500/30">
            <div className="text-indigo-400 text-xs mb-1">Active Goals</div>
            <div className="text-white text-2xl font-bold">{goals.length}</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-green-500/30">
            <div className="text-green-400 text-xs mb-1">Executing</div>
            <div className="text-white text-2xl font-bold">
              {goals.filter(g => g.status === 'executing').length}
            </div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-amber-500/30">
            <div className="text-amber-400 text-xs mb-1">Ethical Score</div>
            <div className="text-white text-2xl font-bold">
              {currentGoal?.ethical_compliance_check?.ethical_score ? 
                (currentGoal.ethical_compliance_check.ethical_score * 100).toFixed(0) : 0}%
            </div>
          </div>
        </div>

        {currentGoal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-black/60 rounded-lg p-4 border border-purple-500/30"
          >
            <div className="text-purple-400 text-sm font-bold mb-2">Current Goal</div>
            <p className="text-white text-sm mb-3">{currentGoal.goal_description}</p>
            <div className="space-y-2">
              {currentGoal.task_decomposition?.map((task, idx) => (
                <div key={idx} className="bg-black/40 rounded p-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">{task.subtask}</span>
                    <Badge className={task.status === 'pending' ? 'bg-blue-600' : 'bg-green-600'}>
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <Button
          onClick={formEmergentGoal}
          disabled={isForming}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          <Zap className="w-4 h-4 mr-2" />
          {isForming ? 'Forming Goal...' : 'Initiate Emergent Goal Formation'}
        </Button>
      </CardContent>
    </Card>
  );
}