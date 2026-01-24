import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Brain, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const IntelligenceWave = ({ radius, phase, strength }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3 + phase;
      const scale = 1 + strength * 0.3 + Math.sin(state.clock.elapsedTime * 2 + phase) * 0.1;
      meshRef.current.scale.setScalar(scale);
      meshRef.current.material.opacity = 0.15 + strength * 0.2;
    }
  });
  
  return (
    <Sphere ref={meshRef} args={[radius, 32, 32]}>
      <meshStandardMaterial
        color="#a855f7"
        transparent
        opacity={0.2}
        wireframe
      />
    </Sphere>
  );
};

const EmergentIdea = ({ position, strength }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.002;
      meshRef.current.rotation.y = state.clock.elapsedTime;
    }
  });
  
  return (
    <Sphere ref={meshRef} args={[0.15, 16, 16]} position={position}>
      <meshStandardMaterial
        color="#fbbf24"
        emissive="#fbbf24"
        emissiveIntensity={1.5 * strength}
      />
    </Sphere>
  );
};

export default function CollectiveIntelligenceVisualizer3D() {
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCollectiveIntelligence = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      setIntelligenceData({
        swarm_iq: 87 + Math.random() * 10,
        emergent_ideas: [
          { pos: [1, 1, 0], strength: 0.9 },
          { pos: [-1, 0.5, 0], strength: 0.75 },
          { pos: [0.5, -1, 0], strength: 0.65 }
        ],
        intelligence_waves: [
          { radius: 1.5, strength: 0.8, phase: 0 },
          { radius: 2, strength: 0.6, phase: Math.PI / 3 },
          { radius: 2.5, strength: 0.4, phase: Math.PI * 2 / 3 }
        ],
        consensus_strength: 0.82,
        innovation_rate: 0.71,
        collective_memory_size: 2456
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-950/90 via-fuchsia-950/90 to-pink-950/90 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Brain className="w-7 h-7 text-purple-400" />
          Collective Intelligence Dynamics
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Visualize emergent swarm intelligence and consensus formation
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-purple-500/20">
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#a855f7" />

            {intelligenceData?.intelligence_waves.map((wave, idx) => (
              <IntelligenceWave
                key={idx}
                radius={wave.radius}
                phase={wave.phase}
                strength={wave.strength}
              />
            ))}

            {intelligenceData?.emergent_ideas.map((idea, idx) => (
              <EmergentIdea
                key={idx}
                position={idea.pos}
                strength={idea.strength}
              />
            ))}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        {intelligenceData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3 mb-4"
          >
            <div className="bg-black/60 rounded-lg p-3 border border-purple-500/30">
              <div className="text-purple-400 text-xs mb-1">Swarm IQ</div>
              <div className="text-white text-3xl font-bold">
                {intelligenceData.swarm_iq.toFixed(0)}
              </div>
            </div>

            <div className="bg-black/60 rounded-lg p-3 border border-fuchsia-500/30">
              <div className="text-fuchsia-400 text-xs mb-1">Consensus</div>
              <div className="text-white text-3xl font-bold">
                {(intelligenceData.consensus_strength * 100).toFixed(0)}%
              </div>
            </div>

            <div className="bg-black/60 rounded-lg p-3 border border-pink-500/30">
              <div className="text-pink-400 text-xs mb-1">Innovation Rate</div>
              <div className="text-white text-2xl font-bold">
                {(intelligenceData.innovation_rate * 100).toFixed(0)}%
              </div>
            </div>

            <div className="bg-black/60 rounded-lg p-3 border border-amber-500/30">
              <div className="text-amber-400 text-xs mb-1">Ideas</div>
              <div className="text-white text-2xl font-bold">
                {intelligenceData.emergent_ideas.length}
              </div>
            </div>
          </motion.div>
        )}

        <Button
          onClick={analyzeCollectiveIntelligence}
          disabled={isAnalyzing}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Collective Intelligence'}
        </Button>
      </CardContent>
    </Card>
  );
}