import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Cone, Html, Float, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Projector, Play, Loader2, Layers, Sparkles } from 'lucide-react';

// Projection device with active beam
function ProjectionDevice3D({ device, projecting = false, projectionContent = null }) {
  const deviceRef = useRef();
  const beamRef = useRef();
  const pos = device.physical_location || { x: 0, y: 2, z: 0 };

  useFrame((state) => {
    if (deviceRef.current) {
      deviceRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
    
    if (beamRef.current && projecting) {
      beamRef.current.material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  const isOnline = device.online_status !== false;

  return (
    <group position={[pos.x || 0, pos.y || 2, pos.z || 0]}>
      {/* Device housing */}
      <group ref={deviceRef}>
        <Box args={[0.3, 0.15, 0.3]}>
          <meshStandardMaterial 
            color={isOnline ? '#1e293b' : '#475569'} 
            emissive={isOnline ? '#3b82f6' : '#64748b'} 
            emissiveIntensity={0.3}
            metalness={0.9}
            roughness={0.2}
          />
        </Box>
        
        {/* Lens */}
        <Cylinder args={[0.08, 0.06, 0.1, 16]} position={[0, -0.1, 0]}>
          <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={projecting ? 0.8 : 0.2} />
        </Cylinder>
      </group>

      {/* Projection beam */}
      {projecting && (
        <mesh ref={beamRef} position={[0, -1, 0]}>
          <coneGeometry args={[device.coverage_area?.radius_meters || 3, 2, 32, 1, true]} />
          <meshBasicMaterial color="#00f5ff" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Coverage area indicator */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <ringGeometry args={[device.coverage_area?.radius_meters || 3, (device.coverage_area?.radius_meters || 3) + 0.1, 64]} />
        <meshBasicMaterial 
          color={projecting ? '#00f5ff' : '#64748b'} 
          transparent 
          opacity={projecting ? 0.3 : 0.1} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      <Html position={[0, 0.3, 0]} center>
        <div className="bg-black/90 px-2 py-1 rounded text-xs text-white">
          {device.device_name}
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} mx-auto mt-1`} />
        </div>
      </Html>
    </group>
  );
}

// Projected content visualization
function ProjectedContent3D({ content, position, animating = false }) {
  const contentRef = useRef();

  useFrame((state) => {
    if (contentRef.current && animating) {
      contentRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      contentRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  const contentTypes = {
    logo: { color: '#00f5ff', shape: 'torus' },
    agent: { color: '#ec4899', shape: 'sphere' },
    text: { color: '#a855f7', shape: 'box' },
    spatial_map: { color: '#10b981', shape: 'plane' }
  };

  const config = contentTypes[content?.type] || contentTypes.logo;

  return (
    <group ref={contentRef} position={[position?.x || 0, position?.y || 1, position?.z || 0]}>
      <Float speed={2}>
        {config.shape === 'torus' && (
          <mesh>
            <torusGeometry args={[0.5, 0.15, 16, 32]} />
            <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={0.7} />
          </mesh>
        )}
        {config.shape === 'sphere' && (
          <Sphere args={[0.4, 32, 32]}>
            <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={0.7} />
          </Sphere>
        )}
        {config.shape === 'box' && (
          <Box args={[0.6, 0.3, 0.1]}>
            <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={0.7} />
          </Box>
        )}
      </Float>

      {/* Holographic particles */}
      {animating && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={50}
              array={new Float32Array(Array.from({ length: 150 }, () => (Math.random() - 0.5) * 2))}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.02} color={config.color} transparent opacity={0.6} />
        </points>
      )}
    </group>
  );
}

// Main scene
function SimulatorScene({ devices, projecting, projectionType, projectionPosition }) {
  return (
    <group>
      <Box args={[16, 0.05, 14]} position={[6, 0, 5]}>
        <meshStandardMaterial color="#0a0a15" />
      </Box>
      <gridHelper args={[16, 16, '#1a2a40', '#0f1a25']} position={[6, 0.03, 5]} />

      {devices.map((device, idx) => (
        <ProjectionDevice3D
          key={device.id || idx}
          device={device}
          projecting={projecting}
        />
      ))}

      {projecting && (
        <ProjectedContent3D
          content={{ type: projectionType }}
          position={projectionPosition}
          animating={true}
        />
      )}
    </group>
  );
}

export default function ProjectionDeviceSimulator3D() {
  const queryClient = useQueryClient();
  const [projecting, setProjecting] = useState(false);
  const [projectionType, setProjectionType] = useState('logo');
  const [projectionPosition, setProjectionPosition] = useState({ x: 6, y: 1.5, z: 5 });

  const { data: devices = [] } = useQuery({
    queryKey: ['projection-devices'],
    queryFn: () => base44.entities.OmniDevice.filter({ device_type: 'holographic_projector' }),
    initialData: []
  });

  const projectMutation = useMutation({
    mutationFn: async ({ action, content_type, animation }) => {
      const response = await base44.functions.invoke('projection-device-orchestrator', {
        action,
        projection_content: content_type,
        animation_preset: animation,
        spatial_coordinates: projectionPosition,
        sync_mode: 'synchronized'
      });
      return response.data;
    },
    onSuccess: (data) => {
      setProjecting(true);
      toast.success(`Projecting across ${data.devices_count || data.devices_targeted || 0} devices`);
      setTimeout(() => setProjecting(false), 5000);
    }
  });

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Projector className="w-5 h-5 text-indigo-400" />
            Projection Device Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={projectionType}
              onChange={(e) => setProjectionType(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm"
            >
              <option value="logo">Omni Logo</option>
              <option value="agent">Agent Hologram</option>
              <option value="text">Omni Text</option>
              <option value="spatial_map">Spatial Map</option>
            </select>

            <Button
              onClick={() => projectMutation.mutate({ 
                action: projectionType === 'logo' ? 'project_logo' : projectionType === 'agent' ? 'project_agent' : 'project_spatial_map',
                content_type: projectionType,
                animation: 'logo_pulse'
              })}
              disabled={projectMutation.isPending || devices.length === 0}
              className="bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              {projectMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Projecting</>
              ) : (
                <><Play className="w-4 h-4 mr-2" /> Start Projection</>
              )}
            </Button>

            <Button
              onClick={() => projectMutation.mutate({ action: 'trigger_animation', animation_preset: 'spatial_ripple' })}
              disabled={projectMutation.isPending}
              variant="outline"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Trigger Animation
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Devices Online</p>
              <p className="text-white text-xl font-bold">{devices.filter(d => d.online_status).length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Projection Status</p>
              <p className={`text-xl font-bold ${projecting ? 'text-green-400' : 'text-slate-500'}`}>
                {projecting ? 'ACTIVE' : 'IDLE'}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Coverage</p>
              <p className="text-white text-xl font-bold">
                {devices.reduce((sum, d) => sum + (d.coverage_area?.radius_meters || 3), 0)}m²
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">3D Projection Simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px]">
            <Canvas camera={{ position: [10, 8, 10], fov: 50 }}>
              <ambientLight intensity={0.2} />
              <pointLight position={[6, 8, 5]} intensity={2} color="#00f5ff" />
              <pointLight position={[10, 5, 10]} intensity={0.5} color="#a855f7" />

              <SimulatorScene
                devices={devices}
                projecting={projecting}
                projectionType={projectionType}
                projectionPosition={projectionPosition}
              />

              <OrbitControls enableZoom={true} />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Available Animations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['logo_pulse', 'agent_materialize', 'knowledge_transfer', 'emotional_aura', 'spatial_ripple', 'data_stream'].map(animation => (
              <Button
                key={animation}
                size="sm"
                variant="outline"
                onClick={() => projectMutation.mutate({ action: 'trigger_animation', animation_preset: animation })}
                className="text-xs"
              >
                {animation.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}