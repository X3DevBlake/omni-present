import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Activity } from 'lucide-react';

function SignalWave({ amplitude, frequency, color, position }) {
  const meshRef = useRef();
  const pointsRef = useRef([]);

  useFrame((state) => {
    if (meshRef.current && pointsRef.current.length > 0) {
      const time = state.clock.elapsedTime;
      pointsRef.current.forEach((point, i) => {
        const x = (i - 50) * 0.1;
        const y = amplitude * Math.sin(frequency * x - time * 3);
        point.position.set(x, y, 0);
      });
    }
  });

  return (
    <group position={position}>
      {Array.from({ length: 100 }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (pointsRef.current[i] = el)}
          position={[(i - 50) * 0.1, 0, 0]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
        </mesh>
      ))}
    </group>
  );
}

function AdaptiveModulationVisualizer({ modulation, errorCorrection, position }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const modulationComplexity = {
    'BPSK': 1,
    'QPSK': 2,
    '8PSK': 3,
    '16QAM': 4,
    '64QAM': 5,
    '256QAM': 6
  };

  const complexity = modulationComplexity[modulation] || 2;
  const color = complexity <= 2 ? '#22c55e' : complexity <= 4 ? '#eab308' : '#ef4444';

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <torusGeometry args={[1, 0.3, 16, complexity * 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} wireframe />
      </mesh>
      <Html distanceFactor={8}>
        <div className="bg-black/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
          <div className="font-bold">{modulation}</div>
          <div className="text-gray-400">{errorCorrection}</div>
        </div>
      </Html>
    </group>
  );
}

export default function RedCommSignalFlow3D() {
  const [isPlaying, setIsPlaying] = useState(true);

  const { data: linkHealthData = [] } = useQuery({
    queryKey: ['redcomm-link-health-signals'],
    queryFn: () => base44.entities.RedCommLinkHealth.list('-created_date', 10),
    refetchInterval: 3000
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['redcomm-messages'],
    queryFn: () => base44.entities.RedCommMessage.list('-created_date', 20),
    refetchInterval: 2000
  });

  const activeTransmissions = messages.filter(m => m.transmission_status === 'transmitting').length;
  const avgSignalStrength = linkHealthData.length > 0
    ? linkHealthData.reduce((sum, link) => sum + link.signal_quality, 0) / linkHealthData.length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-purple-900/30 border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              RedComm Signal Flow - Real-Time Visualization
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-purple-500/20 border-purple-500/50"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex gap-4 mt-4">
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
              <Activity className="w-3 h-3 mr-1" />
              {activeTransmissions} Active
            </Badge>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
              Signal: {avgSignalStrength.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] bg-black/40 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
              <ambientLight intensity={0.2} />
              <pointLight position={[5, 5, 5]} intensity={1} color="#a855f7" />
              <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ec4899" />

              {isPlaying && (
                <>
                  {/* Multiple signal waves at different frequencies */}
                  <SignalWave amplitude={0.5} frequency={2} color="#a855f7" position={[0, 2, 0]} />
                  <SignalWave amplitude={0.3} frequency={4} color="#ec4899" position={[0, 0, 0]} />
                  <SignalWave amplitude={0.4} frequency={3} color="#06b6d4" position={[0, -2, 0]} />

                  {/* Adaptive modulation visualizers */}
                  {linkHealthData.slice(0, 3).map((link, idx) => (
                    <AdaptiveModulationVisualizer
                      key={link.id}
                      modulation={link.adaptive_parameters?.modulation_scheme || 'QPSK'}
                      errorCorrection={link.adaptive_parameters?.error_correction_level || 'standard'}
                      position={[(idx - 1) * 4, 0, -3]}
                    />
                  ))}
                </>
              )}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          <div className="mt-6 space-y-3">
            {linkHealthData.slice(0, 4).map((link) => (
              <div key={link.id} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{link.link_id}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {link.adaptive_parameters?.modulation_scheme || 'QPSK'} • 
                      {link.adaptive_parameters?.error_correction_level || 'Standard'} • 
                      Power: {link.adaptive_parameters?.power_level_db || 0} dBm
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-400">
                      {link.signal_quality.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">
                      Loss: {(link.packet_loss_rate * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
                {link.interference_detected && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">
                      Interference Detected
                    </Badge>
                    {link.interference_sources?.slice(0, 2).map((source, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {source.source}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}