import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Cylinder, Torus, Html, Line, Trail, Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, Cpu, Zap, Activity, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Neural chip core
function NeuralChipCore3D({ chip, exploded = false }) {
  const coreRef = useRef();
  const pulseRef = useRef();

  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y = state.clock.elapsedTime * 0.4;
      coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
    if (pulseRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.15;
      pulseRef.current.scale.setScalar(pulse);
    }
  });

  const isConnected = chip?.omni_present_connection?.connected;
  const color = isConnected ? '#ec4899' : '#64748b';

  return (
    <group>
      {/* Core processor */}
      <Box ref={coreRef} args={[0.3, 0.05, 0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} metalness={0.9} roughness={0.1} />
      </Box>

      {/* Neural interfaces (exploded view) */}
      {Array.from({ length: chip?.implant_specifications?.neural_interface_count || 8 }).map((_, idx) => {
        const angle = (idx / 8) * Math.PI * 2;
        const radius = exploded ? 0.8 : 0.25;
        return (
          <group key={idx}>
            <Cylinder
              args={[0.02, 0.02, 0.3, 8]}
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.7} />
            </Cylinder>
            {exploded && (
              <Line
                points={[[0, 0, 0], [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]]}
                color="#00f5ff"
                lineWidth={1}
                transparent
                opacity={0.3}
              />
            )}
          </group>
        );
      })}

      {/* Consciousness bridge */}
      {chip?.consciousness_bridge?.bidirectional_sync && (
        <Torus args={[0.4, 0.02, 16, 32]} position={[0, exploded ? 0.3 : 0.1, 0]}>
          <meshBasicMaterial color="#a855f7" transparent opacity={0.6} />
        </Torus>
      )}

      {/* Pulse indicator */}
      <Sphere ref={pulseRef} args={[0.08, 16, 16]} position={[0, exploded ? -0.3 : -0.1, 0]}>
        <meshBasicMaterial color={color} />
      </Sphere>

      <Sparkles count={isConnected ? 40 : 10} scale={exploded ? 2 : 1} size={2} speed={0.5} color={color} />
    </group>
  );
}

// Brain model with chip placement
function BrainWithChip3D({ chip, showPathways = false }) {
  const brainRef = useRef();

  useFrame((state) => {
    if (brainRef.current) {
      brainRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group>
      {/* Simplified brain structure */}
      <Sphere ref={brainRef} args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#fbbf24" 
          emissive="#fbbf24" 
          emissiveIntensity={0.3} 
          transparent 
          opacity={0.4}
          wireframe={showPathways}
        />
      </Sphere>

      {/* Chip implant location */}
      <group position={[0, 0.8, 0.3]}>
        <Box args={[0.15, 0.03, 0.15]}>
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.9} />
        </Box>
      </group>

      {/* Neural pathways */}
      {showPathways && Array.from({ length: 12 }).map((_, idx) => {
        const angle = (idx / 12) * Math.PI * 2;
        return (
          <Line
            key={idx}
            points={[
              [0, 0.8, 0.3],
              [Math.cos(angle) * 0.9, Math.sin(idx * 0.3) * 0.5, Math.sin(angle) * 0.9]
            ]}
            color="#00f5ff"
            lineWidth={1}
            transparent
            opacity={0.4}
          />
        );
      })}
    </group>
  );
}

export default function NeuralChipBlueprint3D() {
  const queryClient = useQueryClient();
  const [explodedView, setExplodedView] = useState(false);
  const [showPathways, setShowPathways] = useState(false);

  const adaptiveMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('autonomous-viz-evolution', {
        hub_context: 'neural_chip',
        user_engagement_data: {}
      });
      return response.data;
    }
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      adaptiveMutation.mutate();
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  const { data: chips = [] } = useQuery({
    queryKey: ['neural-chips'],
    queryFn: () => base44.entities.NeuralBrainChip.list('-created_date', 5),
    initialData: []
  });

  const sendCommandMutation = useMutation({
    mutationFn: async (commandType) => {
      const response = await base44.functions.invoke('neural-chip-controller', {
        operation: 'send_command',
        command_type: commandType,
        parameters: {},
        override_allowed: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
    }
  });

  const currentChip = chips[0];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-pink-400" />
            Neural Brain Chip Blueprint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3">
              <Cpu className="w-5 h-5 text-pink-400 mb-1" />
              <p className="text-white text-sm">Neural Interfaces</p>
              <p className="text-2xl font-bold text-pink-400">
                {currentChip?.implant_specifications?.neural_interface_count || 8}
              </p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <Zap className="w-5 h-5 text-purple-400 mb-1" />
              <p className="text-white text-sm">Processing</p>
              <p className="text-2xl font-bold text-purple-400">
                {currentChip?.implant_specifications?.processing_power_tflops || 10} TFLOPS
              </p>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
              <Activity className="w-5 h-5 text-cyan-400 mb-1" />
              <p className="text-white text-sm">Latency</p>
              <p className="text-2xl font-bold text-cyan-400">
                {currentChip?.omni_present_connection?.sync_latency_ms || 5}ms
              </p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <Shield className="w-5 h-5 text-green-400 mb-1" />
              <p className="text-white text-sm">Safety</p>
              <p className="text-xl font-bold text-green-400">ACTIVE</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={explodedView ? 'default' : 'outline'}
              onClick={() => setExplodedView(!explodedView)}
              size="sm"
            >
              {explodedView ? 'Normal View' : 'Exploded View'}
            </Button>
            <Button
              variant={showPathways ? 'default' : 'outline'}
              onClick={() => setShowPathways(!showPathways)}
              size="sm"
            >
              {showPathways ? 'Hide' : 'Show'} Neural Pathways
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">3D Interactive Blueprint</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px]">
            <Canvas camera={{ position: [0, 2, 4], fov: 50 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[3, 5, 3]} intensity={1} color="#ec4899" />
              <pointLight position={[-3, 5, -3]} intensity={0.8} color="#00f5ff" />

              <group>
                {explodedView ? (
                  <NeuralChipCore3D chip={currentChip} exploded={true} />
                ) : (
                  <BrainWithChip3D chip={currentChip} showPathways={showPathways} />
                )}
              </group>

              <OrbitControls enableZoom={true} />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {currentChip && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Motor Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['walk', 'reach', 'grasp', 'turn', 'stop', 'gesture'].map(cmd => (
                <Button
                  key={cmd}
                  onClick={() => sendCommandMutation.mutate(cmd)}
                  disabled={sendCommandMutation.isPending}
                  className="bg-gradient-to-r from-pink-600 to-purple-600"
                  size="sm"
                >
                  {cmd.toUpperCase()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}