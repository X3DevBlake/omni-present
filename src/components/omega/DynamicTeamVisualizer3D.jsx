import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const TeamMemberNode = ({ position, agentId, skills }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.setScalar(0.35 + skills * 0.15 + pulse);
    }
  });
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.25, 32, 32]}>
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.6 + skills * 0.4}
        />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.1} color="white" anchorX="center">
        {agentId}
      </Text>
    </group>
  );
};

const SynergyLink = ({ from, to, strength }) => {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.3 + strength * 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });
  
  return (
    <Line
      ref={lineRef}
      points={[new THREE.Vector3(...from), new THREE.Vector3(...to)]}
      color="#10b981"
      lineWidth={1 + strength * 2}
      transparent
      opacity={0.5}
    />
  );
};

export default function DynamicTeamVisualizer3D() {
  const [teamData, setTeamData] = useState(null);
  const [isForming, setIsForming] = useState(false);

  const formDynamicTeam = async () => {
    setIsForming(true);
    
    try {
      const response = await base44.functions.invoke('omega/dynamicTeamFormation', {
        swarm_id: 'haas_omega_001',
        task_requirements: {
          skills: ['perception', 'planning', 'execution', 'optimization']
        }
      });

      setTeamData(response.data);
    } catch (error) {
      console.error('Team formation failed:', error);
    } finally {
      setIsForming(false);
    }
  };

  const memberPositions = [
    [-1.5, 1, 0],
    [1.5, 1, 0],
    [0, -1.5, 0]
  ];

  return (
    <Card className="bg-gradient-to-br from-blue-950/90 via-cyan-950/90 to-teal-950/90 backdrop-blur-xl border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Users className="w-7 h-7 text-blue-400" />
          Dynamic Team Formation
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Real-time skill complementarity analysis and optimal team assembly
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-blue-500/20">
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#3b82f6" />

            {teamData?.optimal_team?.members && teamData.optimal_team.members.map((memberId, idx) => (
              <React.Fragment key={memberId}>
                <TeamMemberNode
                  position={memberPositions[idx] || [0, 0, 0]}
                  agentId={memberId.substr(-6)}
                  skills={teamData.optimal_team.complementarity_score}
                />
                {idx > 0 && (
                  <SynergyLink
                    from={memberPositions[0]}
                    to={memberPositions[idx]}
                    strength={teamData.optimal_team.complementarity_score}
                  />
                )}
              </React.Fragment>
            ))}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/60 rounded-lg p-3 border border-blue-500/30">
            <div className="text-blue-400 text-xs mb-1">Team Size</div>
            <div className="text-white text-2xl font-bold">
              {teamData?.optimal_team?.members?.length || 0}
            </div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-green-500/30">
            <div className="text-green-400 text-xs mb-1">Complementarity</div>
            <div className="text-white text-2xl font-bold">
              {teamData?.optimal_team?.complementarity_score ? 
                (teamData.optimal_team.complementarity_score * 100).toFixed(0) : 0}%
            </div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-cyan-500/30">
            <div className="text-cyan-400 text-xs mb-1">Skill Coverage</div>
            <div className="text-white text-2xl font-bold">
              {teamData?.optimal_team?.skill_coverage || 0}/4
            </div>
          </div>
        </div>

        {teamData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-black/60 rounded-lg p-4 border border-blue-500/30"
          >
            <div className="text-blue-400 text-sm font-bold mb-2">Team Composition</div>
            <div className="space-y-2">
              {teamData.optimal_team.members?.map((member, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-gray-300 font-mono">{member}</span>
                  <Badge className="bg-cyan-600">Active</Badge>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-blue-500/20 text-xs text-gray-400">
              Formation reason: {teamData.optimal_team.formation_reason}
            </div>
          </motion.div>
        )}

        <Button
          onClick={formDynamicTeam}
          disabled={isForming}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isForming ? 'Analyzing Skills...' : 'Form Optimal Team'}
        </Button>
      </CardContent>
    </Card>
  );
}