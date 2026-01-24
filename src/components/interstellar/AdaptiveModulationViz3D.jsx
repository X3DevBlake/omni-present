import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Box } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radio, Zap, TrendingUp, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

function SignalWave({ active, strength }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setOffset(o => (o + 0.1) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, [active]);

  const points = [];
  for (let i = 0; i < 20; i++) {
    const x = i * 0.5 - 5;
    const y = Math.sin(x * 0.5 + offset) * strength;
    points.push([x, y, 0]);
  }

  return active ? <Line points={points} color="#a855f7" lineWidth={3} /> : null;
}

export default function AdaptiveModulationViz3D() {
  const [optimizing, setOptimizing] = useState(false);
  const [optimization, setOptimization] = useState(null);

  const { data: links } = useQuery({
    queryKey: ['interstellarLinks'],
    queryFn: () => base44.entities.InterstellarLink.filter({ ftl_enabled: true }),
    initialData: []
  });

  const optimizeLink = async () => {
    if (links.length === 0) return;
    
    setOptimizing(true);
    try {
      const response = await base44.functions.invoke('adaptiveModulation', {
        link_id: links[0].link_id
      });
      setOptimization(response.data.optimization_results);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-purple-950/40 via-black/60 to-indigo-950/40 backdrop-blur-xl border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Radio className="w-6 h-6 text-purple-400" />
              Adaptive Modulation System
            </div>
            <Button
              onClick={optimizeLink}
              disabled={optimizing || links.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {optimizing ? 'Optimizing...' : 'Optimize Link'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] rounded-lg bg-black/60 mb-4 overflow-hidden">
            <Canvas camera={{ position: [0, 2, 12], fov: 60 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[0, 5, 5]} intensity={2} color="#a855f7" />
              
              {/* Source node */}
              <Sphere args={[0.5, 32, 32]} position={[-6, 0, 0]}>
                <meshStandardMaterial
                  color="#8b5cf6"
                  emissive="#8b5cf6"
                  emissiveIntensity={1}
                />
              </Sphere>
              <Text position={[-6, -1, 0]} fontSize={0.2} color="white">Source</Text>

              {/* Signal waves */}
              <group position={[-1, 0, 0]}>
                <SignalWave active={!!optimization} strength={optimization?.predicted_improvements?.snr_improvement_db || 1} />
              </group>

              {/* Destination node */}
              <Sphere args={[0.5, 32, 32]} position={[6, 0, 0]}>
                <meshStandardMaterial
                  color="#a855f7"
                  emissive="#a855f7"
                  emissiveIntensity={1}
                />
              </Sphere>
              <Text position={[6, -1, 0]} fontSize={0.2} color="white">Destination</Text>

              {/* Error correction visualizer */}
              {optimization && (
                <group position={[0, 2, 0]}>
                  <Box args={[1.5, 0.3, 0.3]}>
                    <meshStandardMaterial
                      color="#22c55e"
                      emissive="#22c55e"
                      emissiveIntensity={0.6}
                    />
                  </Box>
                  <Text position={[0, 0.5, 0]} fontSize={0.15} color="white">
                    {optimization.error_correction?.code_type}
                  </Text>
                </group>
              )}
              
              <OrbitControls enableDamping />
            </Canvas>
          </div>

          {optimization && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-white text-xs font-bold">SNR Improvement</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    +{optimization.predicted_improvements?.snr_improvement_db?.toFixed(1)} dB
                  </div>
                </div>

                <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-xs font-bold">Throughput Gain</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    +{optimization.predicted_improvements?.throughput_increase_percent?.toFixed(0)}%
                  </div>
                </div>
              </div>

              <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg p-3">
                <div className="text-purple-300 font-bold text-sm mb-2">Modulation Scheme</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{optimization.modulation_scheme?.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Symbol Rate:</span>
                    <span className="text-white">{optimization.modulation_scheme?.symbol_rate_mbaud} Mbaud</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Carrier Freq:</span>
                    <span className="text-white">{optimization.modulation_scheme?.carrier_frequency_thz?.toFixed(2)} THz</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-lg p-3">
                <div className="text-indigo-300 font-bold text-sm mb-2">Error Correction</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Code:</span>
                    <span className="text-white">{optimization.error_correction?.code_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Code Rate:</span>
                    <span className="text-white">{optimization.error_correction?.code_rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">BER Reduction:</span>
                    <Badge className="bg-green-600">
                      {optimization.predicted_improvements?.ber_reduction_factor?.toFixed(1)}x
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}