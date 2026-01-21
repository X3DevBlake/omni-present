import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Cylinder, Html, Line, Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { User, Cpu, Activity, Navigation } from 'lucide-react';

// Humanoid body model
function HumanoidBody3D({ augmentations, showAgentPaths = false }) {
  const bodyRef = useRef();

  useFrame((state) => {
    if (bodyRef.current) {
      bodyRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={bodyRef}>
      {/* Head */}
      <Sphere args={[0.25, 24, 24]} position={[0, 1.6, 0]}>
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} transparent opacity={0.6} />
      </Sphere>

      {/* Torso */}
      <Box args={[0.5, 0.8, 0.3]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.5} />
      </Box>

      {/* Arms */}
      <Cylinder args={[0.08, 0.08, 0.6, 8]} position={[-0.4, 0.9, 0]} rotation={[0, 0, Math.PI / 6]}>
        <meshStandardMaterial color="#f59e0b" transparent opacity={0.5} />
      </Cylinder>
      <Cylinder args={[0.08, 0.08, 0.6, 8]} position={[0.4, 0.9, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <meshStandardMaterial color="#f59e0b" transparent opacity={0.5} />
      </Cylinder>

      {/* Legs */}
      <Cylinder args={[0.1, 0.1, 0.9, 8]} position={[-0.15, 0, 0]}>
        <meshStandardMaterial color="#f59e0b" transparent opacity={0.5} />
      </Cylinder>
      <Cylinder args={[0.1, 0.1, 0.9, 8]} position={[0.15, 0, 0]}>
        <meshStandardMaterial color="#f59e0b" transparent opacity={0.5} />
      </Cylinder>

      {/* Augmentations */}
      {augmentations?.map((aug, idx) => (
        <AugmentationMarker3D key={idx} augmentation={aug} />
      ))}

      {/* Agent navigation paths */}
      {showAgentPaths && augmentations?.filter(a => a.agent_navigation_enabled).map((aug, idx) => (
        <group key={`path-${idx}`}>
          {aug.nano_agent_pathways?.slice(0, 3).map((path, pIdx) => (
            <Line
              key={pIdx}
              points={[
                [path.entry_point?.x || 0, path.entry_point?.y || 0, path.entry_point?.z || 0],
                [path.exit_point?.x || 0, path.exit_point?.y || 0, path.exit_point?.z || 0]
              ]}
              color="#00f5ff"
              lineWidth={2}
              transparent
              opacity={0.5}
            />
          ))}
        </group>
      ))}
    </group>
  );
}

// Augmentation marker
function AugmentationMarker3D({ augmentation }) {
  const markerRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (markerRef.current) {
      markerRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.1);
    }
  });

  const loc = augmentation.body_location?.precise_coordinates || { x: 0, y: 1, z: 0 };
  
  const typeColors = {
    neural_chip: '#ec4899',
    exoskeleton: '#3b82f6',
    bionic_limb: '#10b981',
    sensory_implant: '#f59e0b',
    organ_enhancement: '#a855f7',
    nano_network: '#00f5ff'
  };

  const color = typeColors[augmentation.augmentation_type] || '#ffffff';

  return (
    <group 
      position={[loc.x, loc.y, loc.z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Sphere ref={markerRef} args={[0.08, 16, 16]}>
        <meshBasicMaterial color={color} />
      </Sphere>

      {augmentation.agent_navigation_enabled && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.1, 0.12, 16]} />
          <meshBasicMaterial color="#00f5ff" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {hovered && (
        <Html position={[0.15, 0, 0]} center={false}>
          <div className="bg-black/95 px-3 py-2 rounded-lg border-2 min-w-48" style={{ borderColor: color }}>
            <p className="text-white font-bold text-sm mb-1">{augmentation.augmentation_type}</p>
            <p className="text-slate-400 text-xs mb-2">{augmentation.body_location?.region}</p>
            {augmentation.agent_navigation_enabled && (
              <Badge className="bg-cyan-500/30 text-cyan-300 text-xs">Agent Nav Enabled</Badge>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function BodyAugmentationBlueprint3D() {
  const [showAgentPaths, setShowAgentPaths] = useState(false);
  const [viewMode, setViewMode] = useState('chip'); // chip, body, full

  const { data: augmentations = [] } = useQuery({
    queryKey: ['body-augmentations'],
    queryFn: () => base44.entities.PhysicalBodyAugmentation.list('-created_date', 20),
    initialData: []
  });

  const { data: chips = [] } = useQuery({
    queryKey: ['neural-chips-blueprint'],
    queryFn: () => base44.entities.NeuralBrainChip.list('-created_date', 5),
    initialData: []
  });

  const neuralChip = chips[0];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-6 h-6 text-orange-400" />
            Body Augmentation System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <Cpu className="w-5 h-5 text-pink-400 mb-1" />
              <p className="text-white text-xl font-bold">{augmentations.length}</p>
              <p className="text-slate-400 text-xs">Augmentations</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <Activity className="w-5 h-5 text-cyan-400 mb-1" />
              <p className="text-white text-xl font-bold">
                {augmentations.filter(a => a.agent_navigation_enabled).length}
              </p>
              <p className="text-slate-400 text-xs">Agent-Enabled</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <Navigation className="w-5 h-5 text-green-400 mb-1" />
              <p className="text-white text-xl font-bold">
                {augmentations.reduce((sum, a) => sum + (a.nano_agent_pathways?.length || 0), 0)}
              </p>
              <p className="text-slate-400 text-xs">Pathways</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'chip' ? 'default' : 'outline'}
              onClick={() => setViewMode('chip')}
              size="sm"
            >
              Chip Detail
            </Button>
            <Button
              variant={viewMode === 'body' ? 'default' : 'outline'}
              onClick={() => setViewMode('body')}
              size="sm"
            >
              Body View
            </Button>
            <Button
              variant={showAgentPaths ? 'default' : 'outline'}
              onClick={() => setShowAgentPaths(!showAgentPaths)}
              size="sm"
            >
              Agent Paths
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[550px]">
            <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[3, 5, 3]} intensity={1.2} color="#ec4899" />
              <pointLight position={[-3, 5, -3]} intensity={0.8} color="#00f5ff" />
              <spotLight position={[0, 8, 0]} angle={0.6} penumbra={0.5} intensity={0.6} />

              {viewMode === 'chip' && <NeuralChipCore3D chip={neuralChip} exploded={true} />}
              {viewMode === 'body' && <BrainWithChip3D chip={neuralChip} showPathways={showAgentPaths} />}
              {viewMode === 'full' && <HumanoidBody3D augmentations={augmentations} showAgentPaths={showAgentPaths} />}

              <OrbitControls enableZoom={true} />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}