import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Cone } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import * as THREE from 'three';
import { BrainCircuit, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const SubProblemNode = ({ position, subProblem, assigned }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
      if (assigned) {
        meshRef.current.scale.setScalar(0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
      }
    }
  });
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={assigned ? '#10b981' : '#6b7280'}
          emissive={assigned ? '#10b981' : '#6b7280'}
          emissiveIntensity={assigned ? 1.2 : 0.4}
        />
      </Sphere>
      <Text position={[0, 0.6, 0]} fontSize={0.12} color="white" anchorX="center">
        {subProblem}
      </Text>
    </group>
  );
};

const CoordinationLink = ({ from, to, syncType }) => {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
    }
  });
  
  return (
    <Line
      ref={lineRef}
      points={[new THREE.Vector3(...from), new THREE.Vector3(...to)]}
      color="#8b5cf6"
      lineWidth={2}
      transparent
      opacity={0.6}
      dashed
      dashSize={0.1}
      gapSize={0.05}
    />
  );
};

export default function CrossAgentPlanner3D() {
  const [problemDesc, setProblemDesc] = useState('');
  const [planningResult, setPlanningResult] = useState(null);
  const [isPlanning, setIsPlanning] = useState(false);

  const executePlanning = async () => {
    if (!problemDesc) return;
    
    setIsPlanning(true);
    
    try {
      const response = await base44.functions.invoke('omega/crossAgentPlanner', {
        problem_description: problemDesc,
        complexity_level: 0.8,
        agent_pool: [
          { agent_id: 'perception_agent', skills: ['perception', 'data_fusion'] },
          { agent_id: 'reasoning_agent', skills: ['reasoning', 'optimization'] },
          { agent_id: 'execution_agent', skills: ['action', 'feedback_control'] }
        ]
      });

      setPlanningResult(response.data);
    } catch (error) {
      console.error('Planning failed:', error);
    } finally {
      setIsPlanning(false);
    }
  };

  const subProblemPositions = [
    [-2, 1.5, 0],
    [0, 0, 0],
    [2, -1.5, 0]
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-950/90 via-fuchsia-950/90 to-pink-950/90 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <BrainCircuit className="w-7 h-7 text-purple-400" />
          Cross-Agent Planning
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Distributed problem-solving through intelligent agent coordination
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Describe complex problem..."
            value={problemDesc}
            onChange={(e) => setProblemDesc(e.target.value)}
            className="bg-black/60 border-purple-500/30 text-white mb-3"
          />
        </div>

        <div className="h-[400px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-purple-500/20">
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#a855f7" />

            {planningResult?.problem_decomposition?.sub_problems.map((sp, idx) => (
              <React.Fragment key={sp.id}>
                <SubProblemNode
                  position={subProblemPositions[idx]}
                  subProblem={`SP${idx + 1}`}
                  assigned={!!planningResult?.agent_assignments?.[idx]}
                />
                {idx < subProblemPositions.length - 1 && (
                  <CoordinationLink
                    from={subProblemPositions[idx]}
                    to={subProblemPositions[idx + 1]}
                    syncType="data_handoff"
                  />
                )}
              </React.Fragment>
            ))}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/60 rounded-lg p-3 border border-purple-500/30">
            <div className="text-purple-400 text-xs mb-1">Sub-Problems</div>
            <div className="text-white text-2xl font-bold">
              {planningResult?.problem_decomposition?.sub_problems?.length || 0}
            </div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-green-500/30">
            <div className="text-green-400 text-xs mb-1">Agents Assigned</div>
            <div className="text-white text-2xl font-bold">
              {planningResult?.agent_assignments?.length || 0}
            </div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-blue-500/30">
            <div className="text-blue-400 text-xs mb-1">Est. Time</div>
            <div className="text-white text-2xl font-bold">
              {planningResult?.coordination_plan?.estimated_completion_time_hours?.toFixed(1) || 0}h
            </div>
          </div>
        </div>

        {planningResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-black/60 rounded-lg p-4 border border-purple-500/30"
          >
            <div className="text-purple-400 text-sm font-bold mb-2">Planning Result</div>
            <div className="space-y-2 text-xs">
              {planningResult.agent_assignments?.map((assignment, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-300">{assignment.assigned_agent}</span>
                  <Badge className="bg-green-600">
                    {(assignment.capability_match * 100).toFixed(0)}% match
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-purple-500/20">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Ethical Compliance:</span>
                <Badge className={planningResult.ethical_compliance > 0.8 ? 'bg-green-600' : 'bg-amber-600'}>
                  {(planningResult.ethical_compliance * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          </motion.div>
        )}

        <Button
          onClick={executePlanning}
          disabled={isPlanning || !problemDesc}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Network className="w-4 h-4 mr-2" />
          {isPlanning ? 'Planning...' : 'Generate Cross-Agent Plan'}
        </Button>
      </CardContent>
    </Card>
  );
}