import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Sparkles } from 'lucide-react';

function EmergentNode({ position, behavior, index }) {
  const meshRef = useRef();
  const particlesRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.2;
      meshRef.current.scale.setScalar(scale);
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime;
    }
  });

  const innovationColor = behavior.innovation_level > 0.7 ? '#fbbf24' : 
                          behavior.innovation_level > 0.4 ? '#a855f7' : '#3b82f6';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.35, 32, 32]}>
        <meshStandardMaterial
          color={innovationColor}
          emissive={innovationColor}
          emissiveIntensity={0.7}
        />
      </Sphere>

      <mesh ref={particlesRef}>
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <Sphere key={i} position={[Math.cos(angle) * 0.6, 0, Math.sin(angle) * 0.6]} args={[0.05, 8, 8]}>
              <meshBasicMaterial color={innovationColor} />
            </Sphere>
          );
        })}
      </mesh>

      <Text position={[0, 0.6, 0]} fontSize={0.11} color="white" anchorX="center">
        {behavior.behavior_pattern}
      </Text>
      <Text position={[0, -0.6, 0]} fontSize={0.09} color={innovationColor} anchorX="center">
        Innovation: {(behavior.innovation_level * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function EmergentScene({ behaviors }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#fbbf24" />

      <Text position={[0, 3.5, 0]} fontSize={0.3} color="white" anchorX="center">
        Emergent Behavior Detection
      </Text>

      {behaviors.map((behavior, idx) => {
        const angle = (idx / behaviors.length) * Math.PI * 2;
        const radius = 2.5;
        const height = Math.sin(idx * 0.8) * 0.5;
        const position = [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ];

        return <EmergentNode key={idx} position={position} behavior={behavior} index={idx} />;
      })}

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.8} />
    </>
  );
}

export default function EmergentBehaviorDetector3D({ behaviors }) {
  const novelBehaviors = behaviors.filter(b => b.innovation_level > 0.6);
  const avgInnovation = behaviors.length > 0
    ? behaviors.reduce((sum, b) => sum + (b.innovation_level || 0), 0) / behaviors.length
    : 0;

  return (
    <Card className="bg-black/40 border-yellow-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Emergent Behavior Patterns
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden mb-4" style={{ height: '450px' }}>
              <Canvas camera={{ position: [0, 2, 6], fov: 60 }}>
                <EmergentScene behaviors={behaviors.slice(0, 12)} />
              </Canvas>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-black/60 border border-yellow-500/30 rounded-lg p-3 text-center">
                <div className="text-yellow-400 text-2xl font-bold">{behaviors.length}</div>
                <div className="text-white/60 text-xs">Total Detected</div>
              </div>
              <div className="bg-black/60 border border-orange-500/30 rounded-lg p-3 text-center">
                <div className="text-orange-400 text-2xl font-bold">{novelBehaviors.length}</div>
                <div className="text-white/60 text-xs">Novel Patterns</div>
              </div>
              <div className="bg-black/60 border border-amber-500/30 rounded-lg p-3 text-center">
                <div className="text-amber-400 text-2xl font-bold">
                  {(avgInnovation * 100).toFixed(0)}%
                </div>
                <div className="text-white/60 text-xs">Avg Innovation</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-white text-sm font-bold mb-2">Behavior Analysis</div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {behaviors.slice(0, 8).map((behavior, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-black/60 border border-yellow-500/30 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    <span className="text-white text-xs font-bold">{behavior.behavior_pattern}</span>
                  </div>
                  <div className="text-white/60 text-xs mb-2">{behavior.description}</div>
                  <div className="flex gap-1 flex-wrap">
                    <Badge className="bg-yellow-500/30 text-yellow-300 text-xs">
                      Innovation: {(behavior.innovation_level * 100).toFixed(0)}%
                    </Badge>
                    {behavior.frequency > 5 && (
                      <Badge className="bg-orange-500/30 text-orange-300 text-xs">
                        Frequent
                      </Badge>
                    )}
                    {behavior.impact_score > 0.7 && (
                      <Badge className="bg-green-500/30 text-green-300 text-xs">
                        High Impact
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}