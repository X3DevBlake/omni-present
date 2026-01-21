import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Html, Float, Sparkles } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Cpu, Brain, Zap, Settings, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function SentientDevice3D({ device, onSelect }) {
  const deviceRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (deviceRef.current) {
      const awareness = device.consciousness_state?.awareness_level || 0.5;
      deviceRef.current.rotation.y = state.clock.elapsedTime * (0.2 + awareness * 0.3);
      const pulse = 1 + awareness * Math.sin(state.clock.elapsedTime * 3) * 0.12;
      deviceRef.current.scale.setScalar(pulse);
    }
  });

  const sentientCapabilities = device.sentience_capabilities || {};
  const capabilityCount = Object.values(sentientCapabilities).filter(Boolean).length;
  const color = capabilityCount >= 5 ? '#ec4899' : capabilityCount >= 3 ? '#00f5ff' : '#10b981';

  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onSelect && onSelect(device)}
    >
      <Float speed={2} floatIntensity={0.5}>
        <Box ref={deviceRef} args={[0.4, 0.4, 0.4]}>
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={0.7}
            metalness={0.8}
            roughness={0.2}
          />
        </Box>
      </Float>

      <Sparkles count={capabilityCount * 3} scale={1.2} size={2} speed={0.5} color={color} />

      {hovered && (
        <Html position={[0.5, 0, 0]} center={false}>
          <div className="bg-black/95 text-white px-4 py-3 rounded-xl border-2 min-w-64" style={{ borderColor: color }}>
            <p className="font-bold mb-2">{device.device_name}</p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <Brain className="w-3 h-3" />
                <span className="text-slate-400">Awareness:</span>
                <span style={{ color }}>{((device.consciousness_state?.awareness_level || 0) * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3" />
                <span className="text-slate-400">Capabilities:</span>
                <span className="text-purple-400">{capabilityCount}/6</span>
              </div>
              {device.adaptive_personality?.mood_state && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Mood:</span>
                  <span className="text-cyan-400">{device.adaptive_personality.mood_state}</span>
                </div>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function SentientDeviceController3D() {
  const queryClient = useQueryClient();
  const [selectedDevice, setSelectedDevice] = useState(null);

  const { data: omegaDevices = [] } = useQuery({
    queryKey: ['sentient-omega-devices'],
    queryFn: () => base44.entities.OmegaDevice.list('-created_date', 30),
    initialData: []
  });

  const decisionMutation = useMutation({
    mutationFn: async (deviceId) => {
      const response = await base44.functions.invoke('omega-device-orchestrator', {
        device_id: deviceId,
        operation: 'autonomous_decision',
        context: { timestamp: new Date().toISOString() }
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`${data.device_name}: ${data.device_decision.decision}`);
    }
  });

  const optimizeMutation = useMutation({
    mutationFn: async (deviceId) => {
      const response = await base44.functions.invoke('omega-device-orchestrator', {
        device_id: deviceId,
        operation: 'self_optimize'
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Device self-optimization initiated');
      queryClient.invalidateQueries(['sentient-omega-devices']);
    }
  });

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-green-400" />
            Sentient Device Controller
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Omega Devices</p>
              <p className="text-white text-2xl font-bold">{omegaDevices.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Autonomous</p>
              <p className="text-green-400 text-2xl font-bold">
                {omegaDevices.filter(d => d.sentience_capabilities?.autonomous_decision_making).length}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Creative</p>
              <p className="text-purple-400 text-2xl font-bold">
                {omegaDevices.filter(d => d.sentience_capabilities?.creative_problem_solving).length}
              </p>
            </div>
          </div>

          {selectedDevice && (
            <div className="flex gap-2">
              <Button
                onClick={() => decisionMutation.mutate(selectedDevice.id)}
                disabled={decisionMutation.isPending}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600"
              >
                {decisionMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
                Autonomous Decision
              </Button>
              <Button
                onClick={() => optimizeMutation.mutate(selectedDevice.id)}
                disabled={optimizeMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {optimizeMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
                Self-Optimize
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[500px]">
            <Canvas camera={{ position: [0, 4, 8], fov: 50 }}>
              <ambientLight intensity={0.2} />
              <pointLight position={[8, 8, 8]} intensity={1} color="#10b981" />
              <pointLight position={[-8, 6, -8]} intensity={0.7} color="#ec4899" />

              <group>
                {omegaDevices.map((device, idx) => {
                  const angle = (idx / omegaDevices.length) * Math.PI * 2;
                  const radius = 3;
                  return (
                    <SentientDevice3D
                      key={device.id}
                      device={device}
                      onSelect={setSelectedDevice}
                    />
                  );
                })}
              </group>

              <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.8} />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}