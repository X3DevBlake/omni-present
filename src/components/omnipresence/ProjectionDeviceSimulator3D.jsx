import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Cylinder, Cone, Html, Float, Line, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Projector, Zap, Radio, Eye, Volume2, Loader2 } from 'lucide-react';

// Holographic projection cone
function ProjectionCone({ device, intensity = 1, projectedAgent }) {
  const coneRef = useRef();
  const particlesRef = useRef();
  
  const pos = device.physical_location || { x: 0, y: 2, z: 0 };
  const coverage = device.coverage_area || { radius_meters: 3, height_meters: 2 };

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (coneRef.current) {
      coneRef.current.material.opacity = 0.1 + Math.sin(time * 2) * 0.03 * intensity;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 0.3;
    }
  });

  // Projection particles
  const particles = useMemo(() => {
    const count = 100;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * coverage.radius_meters;
      const h = Math.random() * coverage.height_meters;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = -h;
      positions[i * 3 + 2] = Math.sin(angle) * r;
    }
    return positions;
  }, [coverage]);

  return (
    <group position={[pos.x, pos.y, pos.z]}>
      {/* Projection cone */}
      <Cone ref={coneRef} args={[coverage.radius_meters, coverage.height_meters, 32, 1, true]} position={[0, -coverage.height_meters / 2, 0]}>
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.08} side={THREE.DoubleSide} wireframe />
      </Cone>

      {/* Solid inner cone */}
      <Cone args={[coverage.radius_meters * 0.8, coverage.height_meters * 0.9, 32]} position={[0, -coverage.height_meters / 2, 0]}>
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.03} side={THREE.DoubleSide} />
      </Cone>

      {/* Projection particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={100} array={particles} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#00f5ff" transparent opacity={0.6 * intensity} blending={THREE.AdditiveBlending} />
      </points>

      {/* Projected agent silhouette */}
      {projectedAgent && (
        <group position={[0, -coverage.height_meters + 0.5, 0]}>
          <Sphere args={[0.15, 16, 16]} position={[0, 0.4, 0]}>
            <meshBasicMaterial color="#00f5ff" transparent opacity={0.7} wireframe />
          </Sphere>
          <Cylinder args={[0.08, 0.12, 0.3, 8]} position={[0, 0.15, 0]}>
            <meshBasicMaterial color="#00f5ff" transparent opacity={0.5} wireframe />
          </Cylinder>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <ringGeometry args={[0.2, 0.25, 32]} />
            <meshBasicMaterial color="#00f5ff" transparent opacity={0.4} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Physical projection device
function ProjectionDevice3D({ device, isActive, onSelect, showCoverage }) {
  const deviceRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  const pos = device.physical_location || { x: 0, y: 0, z: 0 };

  const deviceTypeConfigs = {
    holographic_projector: { color: '#00f5ff', shape: 'projector' },
    smart_speaker: { color: '#a855f7', shape: 'cylinder' },
    ar_glasses: { color: '#ec4899', shape: 'box' },
    projection_drone: { color: '#f59e0b', shape: 'drone' },
    smart_tv: { color: '#3b82f6', shape: 'screen' },
    volumetric_projector: { color: '#10b981', shape: 'projector' }
  };

  const config = deviceTypeConfigs[device.device_type] || { color: '#64748b', shape: 'box' };

  useFrame((state) => {
    if (deviceRef.current) {
      if (isActive) {
        deviceRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
      }
      if (hovered) {
        deviceRef.current.scale.setScalar(1.1);
      } else {
        deviceRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const renderDeviceShape = () => {
    switch (config.shape) {
      case 'projector':
        return (
          <group>
            <Box args={[0.4, 0.15, 0.3]}>
              <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={isActive ? 0.5 : 0.1} metalness={0.8} roughness={0.2} />
            </Box>
            <Cylinder args={[0.08, 0.08, 0.15, 16]} position={[0.15, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color="#1e293b" emissive={isActive ? config.color : '#000'} emissiveIntensity={isActive ? 1 : 0} />
            </Cylinder>
            {/* Lens glow */}
            {isActive && (
              <Sphere args={[0.06, 16, 16]} position={[0.15, -0.1, 0.08]}>
                <meshBasicMaterial color={config.color} transparent opacity={0.8} />
              </Sphere>
            )}
          </group>
        );
      case 'drone':
        return (
          <group>
            <Sphere args={[0.15, 16, 16]}>
              <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={isActive ? 0.5 : 0.1} />
            </Sphere>
            {/* Propellers */}
            {[0, 90, 180, 270].map((angle, i) => (
              <group key={i} rotation={[0, (angle * Math.PI) / 180, 0]} position={[0.2, 0.05, 0]}>
                <Cylinder args={[0.08, 0.08, 0.02, 8]}>
                  <meshBasicMaterial color="#64748b" />
                </Cylinder>
              </group>
            ))}
          </group>
        );
      case 'screen':
        return (
          <Box args={[0.8, 0.5, 0.05]}>
            <meshStandardMaterial color="#1e293b" emissive={isActive ? config.color : '#000'} emissiveIntensity={isActive ? 0.3 : 0} />
          </Box>
        );
      default:
        return (
          <Cylinder args={[0.12, 0.12, 0.25, 16]}>
            <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={isActive ? 0.5 : 0.1} metalness={0.7} />
          </Cylinder>
        );
    }
  };

  return (
    <group position={[pos.x, pos.y || 2, pos.z]}>
      <group
        ref={deviceRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect && onSelect(device)}
      >
        {renderDeviceShape()}

        {/* Status indicator */}
        <Sphere args={[0.03, 8, 8]} position={[0.2, 0.1, 0]}>
          <meshBasicMaterial color={device.online_status ? '#10b981' : '#ef4444'} />
        </Sphere>
      </group>

      {/* Coverage visualization */}
      {showCoverage && isActive && (
        <ProjectionCone device={device} intensity={1} projectedAgent={true} />
      )}

      {hovered && (
        <Html position={[0, 0.4, 0]} center>
          <div className="bg-black/95 text-white px-3 py-2 rounded-lg text-xs min-w-44 shadow-xl">
            <p className="font-bold" style={{ color: config.color }}>{device.device_name}</p>
            <p className="text-slate-400">{device.device_type}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={device.online_status ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                {device.online_status ? 'Online' : 'Offline'}
              </Badge>
              {device.projection_capability?.brightness_lumens && (
                <span className="text-yellow-400">{device.projection_capability.brightness_lumens} lm</span>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Room environment for projection simulation
function ProjectionRoom() {
  return (
    <group>
      {/* Floor */}
      <Box args={[12, 0.05, 10]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#080810" />
      </Box>
      <gridHelper args={[12, 24, '#1a2a4a', '#0a1020']} position={[0, 0.03, 0]} />

      {/* Walls */}
      <Box args={[12, 3, 0.1]} position={[0, 1.5, -5]}>
        <meshStandardMaterial color="#0a1020" />
      </Box>
      <Box args={[0.1, 3, 10]} position={[-6, 1.5, 0]}>
        <meshStandardMaterial color="#0a1020" />
      </Box>
      <Box args={[0.1, 3, 10]} position={[6, 1.5, 0]}>
        <meshStandardMaterial color="#0a1020" />
      </Box>

      {/* Furniture outlines for context */}
      <Box args={[2, 0.4, 1]} position={[0, 0.2, -3]}>
        <meshBasicMaterial color="#1e293b" wireframe />
      </Box>
      <Box args={[1, 0.3, 1]} position={[-2, 0.15, 0]}>
        <meshBasicMaterial color="#1e293b" wireframe />
      </Box>
    </group>
  );
}

// Multi-device projection coordination
function MultiDeviceProjection({ devices, activeDevices }) {
  const beamRefs = useRef([]);

  useFrame((state) => {
    beamRefs.current.forEach((beam, i) => {
      if (beam) {
        beam.material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 3 + i) * 0.1;
      }
    });
  });

  // Create coordination beams between active devices
  const coordinationBeams = [];
  const activeDeviceList = devices.filter(d => activeDevices.includes(d.id));
  
  for (let i = 0; i < activeDeviceList.length; i++) {
    for (let j = i + 1; j < activeDeviceList.length; j++) {
      const d1 = activeDeviceList[i];
      const d2 = activeDeviceList[j];
      coordinationBeams.push({
        from: d1.physical_location || { x: 0, y: 2, z: 0 },
        to: d2.physical_location || { x: 2, y: 2, z: 2 }
      });
    }
  }

  return (
    <group>
      {coordinationBeams.map((beam, i) => (
        <Line
          key={i}
          ref={el => beamRefs.current[i] = el}
          points={[
            new THREE.Vector3(beam.from.x, beam.from.y || 2, beam.from.z),
            new THREE.Vector3(beam.to.x, beam.to.y || 2, beam.to.z)
          ]}
          color="#a855f7"
          lineWidth={1}
          transparent
          opacity={0.3}
          dashed
          dashScale={3}
        />
      ))}
    </group>
  );
}

// Main scene
function ProjectionSimulatorScene({ devices, activeDevices, showCoverage, onDeviceSelect }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 5, 0]} intensity={0.5} />
      <pointLight position={[5, 3, 5]} intensity={0.3} color="#00f5ff" />
      <pointLight position={[-5, 3, -5]} intensity={0.3} color="#a855f7" />

      <ProjectionRoom />

      {devices.map((device, idx) => (
        <ProjectionDevice3D
          key={device.id || idx}
          device={device}
          isActive={activeDevices.includes(device.id)}
          showCoverage={showCoverage}
          onSelect={onDeviceSelect}
        />
      ))}

      <MultiDeviceProjection devices={devices} activeDevices={activeDevices} />

      <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.1} />
    </>
  );
}

export default function ProjectionDeviceSimulator3D({ devices = [] }) {
  const [activeDevices, setActiveDevices] = useState([]);
  const [showCoverage, setShowCoverage] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [brightness, setBrightness] = useState(80);

  const deployMutation = useMutation({
    mutationFn: async (deviceId) => {
      const response = await base44.functions.invoke('deploy-agent-hologram', {
        omni_device_id: deviceId,
        initial_coordinates: { x: 0, y: 0, z: 0 },
        behavior_profile: 'assistant'
      });
      return response.data;
    },
    onSuccess: (data, deviceId) => {
      setActiveDevices(prev => [...prev, deviceId]);
      toast.success('Agent projected to device!');
    }
  });

  const toggleDevice = (device) => {
    setSelectedDevice(device);
    if (activeDevices.includes(device.id)) {
      setActiveDevices(prev => prev.filter(id => id !== device.id));
    } else {
      deployMutation.mutate(device.id);
    }
  };

  const activeCount = activeDevices.length;
  const totalLumens = devices
    .filter(d => activeDevices.includes(d.id))
    .reduce((sum, d) => sum + (d.projection_capability?.brightness_lumens || 0), 0);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Projector className="w-5 h-5 text-cyan-400" />
            Real-Life Projection Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant={showCoverage ? 'default' : 'outline'}
              onClick={() => setShowCoverage(!showCoverage)}
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Coverage
            </Button>

            <div className="flex-1 flex items-center gap-3">
              <span className="text-slate-400 text-sm">Brightness:</span>
              <Slider
                value={[brightness]}
                onValueChange={(v) => setBrightness(v[0])}
                max={100}
                step={5}
                className="w-32"
              />
              <span className="text-white text-sm">{brightness}%</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1"><Radio className="w-3 h-3" /> Devices</p>
              <p className="text-white font-bold">{devices.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1"><Zap className="w-3 h-3" /> Active</p>
              <p className="text-cyan-400 font-bold">{activeCount}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1"><Eye className="w-3 h-3" /> Lumens</p>
              <p className="text-yellow-400 font-bold">{totalLumens}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1"><Volume2 className="w-3 h-3" /> Coverage</p>
              <p className="text-purple-400 font-bold">{activeCount * 3}m²</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[500px]">
            <Canvas camera={{ position: [8, 6, 8], fov: 55 }}>
              <ProjectionSimulatorScene
                devices={devices}
                activeDevices={activeDevices}
                showCoverage={showCoverage}
                onDeviceSelect={toggleDevice}
              />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {/* Device controls */}
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Projection Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {devices.map((device) => (
              <div
                key={device.id}
                onClick={() => toggleDevice(device)}
                className={`bg-slate-800/50 rounded-lg p-3 cursor-pointer transition-all ${
                  activeDevices.includes(device.id) ? 'ring-2 ring-cyan-500 bg-cyan-500/10' : 'hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{device.device_name}</span>
                  <Badge className={activeDevices.includes(device.id) ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700'}>
                    {activeDevices.includes(device.id) ? 'Projecting' : 'Ready'}
                  </Badge>
                </div>
                <p className="text-slate-400 text-xs">{device.device_type}</p>
                {device.projection_capability && (
                  <p className="text-yellow-400 text-xs mt-1">
                    {device.projection_capability.brightness_lumens} lm • {device.projection_capability.max_resolution}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}