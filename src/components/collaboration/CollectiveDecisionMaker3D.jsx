import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle } from 'lucide-react';
import * as THREE from 'three';

function DecisionNode({ position, decision, index }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const pulse = Math.sin(state.clock.elapsedTime * 2 + index) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const qualityColor = decision.decision_quality > 0.7 ? '#10b981' : 
                       decision.decision_quality > 0.4 ? '#f59e0b' : '#ef4444';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={qualityColor}
          emissive={qualityColor}
          emissiveIntensity={0.6}
        />
      </Sphere>

      <Text position={[0, 0.6, 0]} fontSize={0.12} color="white" anchorX="center">
        Decision {index + 1}
      </Text>
      <Text position={[0, -0.6, 0]} fontSize={0.1} color={qualityColor} anchorX="center">
        {(decision.decision_quality * 100).toFixed(0)}% Quality
      </Text>
    </group>
  );
}

function DecisionScene({ decisions }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#a855f7" />

      <Text position={[0, 3, 0]} fontSize={0.25} color="white" anchorX="center">
        Collective Decision Making
      </Text>

      <Sphere position={[0, 0, 0]} args={[0.4, 32, 32]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#4f46e5"
          emissiveIntensity={0.4}
          wireframe
        />
      </Sphere>

      {decisions.map((decision, idx) => {
        const angle = (idx / decisions.length) * Math.PI * 2;
        const radius = 2.5;
        const position = [
          Math.cos(angle) * radius,
          Math.sin(idx * 0.5),
          Math.sin(angle) * radius
        ];

        return <DecisionNode key={idx} position={position} decision={decision} index={idx} />;
      })}

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} />
    </>
  );
}

export default function CollectiveDecisionMaker3D({ collaboration }) {
  const decisions = collaboration.decision_history || [];
  const avgConsensus = decisions.length > 0
    ? decisions.reduce((sum, d) => sum + (d.consensus_level || 0), 0) / decisions.length
    : 0;

  const avgQuality = decisions.length > 0
    ? decisions.reduce((sum, d) => sum + (d.decision_quality || 0), 0) / decisions.length
    : 0;

  return (
    <Card className="bg-black/40 border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Collective Decision Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden" style={{ height: '450px' }}>
              <Canvas camera={{ position: [0, 2, 6], fov: 60 }}>
                <DecisionScene decisions={decisions.slice(0, 8)} />
              </Canvas>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-black/60 border border-purple-500/30 rounded-lg p-3">
              <div className="text-white text-sm font-bold mb-2">Decision Metrics</div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">Avg Consensus</span>
                    <span className="text-white">{(avgConsensus * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-black/60 rounded-full h-2">
                    <div 
                      className="bg-purple-400 h-2 rounded-full transition-all"
                      style={{ width: `${avgConsensus * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">Avg Quality</span>
                    <span className="text-white">{(avgQuality * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-black/60 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all"
                      style={{ width: `${avgQuality * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-white text-sm font-bold mb-2">Recent Decisions</div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {decisions.slice(0, 5).map((decision, idx) => (
                  <div key={idx} className="bg-black/60 border border-purple-500/30 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <CheckCircle className="w-3 h-3 text-purple-400" />
                      <span className="text-white text-xs font-bold">{decision.decision_point}</span>
                    </div>
                    <div className="text-white/60 text-xs mb-1">{decision.decision_made}</div>
                    <div className="flex gap-1">
                      <Badge className="bg-purple-500/30 text-purple-300 text-xs">
                        Consensus: {(decision.consensus_level * 100).toFixed(0)}%
                      </Badge>
                      <Badge className="bg-green-500/30 text-green-300 text-xs">
                        Quality: {(decision.decision_quality * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}