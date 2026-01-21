import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Cylinder, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Play, Pause, Maximize2 } from 'lucide-react';

function RotatingDevice({ blueprint, autoRotate, rotationSpeed }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += rotationSpeed;
    }
  });

  const scale = 0.01;
  const w = (blueprint.dimensions?.width_cm || 30) * scale;
  const h = (blueprint.dimensions?.height_cm || 20) * scale;
  const d = (blueprint.dimensions?.depth_cm || 15) * scale;

  const deviceColors = {
    holographic_projector: '#00f5ff',
    robotic_arm: '#a855f7',
    smart_light: '#f59e0b',
    smart_thermostat: '#ef4444',
    smart_lock: '#10b981',
    ar_glasses: '#ec4899',
    projection_drone: '#06b6d4',
    smart_mirror: '#8b5cf6',
    sensor_hub: '#84cc16'
  };

  const color = deviceColors[blueprint.device_type] || '#ffffff';

  return (
    <group ref={groupRef}>
      {/* Main body */}
      <Box args={[w, h, d]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </Box>

      {/* Components */}
      {blueprint.components?.map((comp, idx) => {
        const pos = comp.position || { x: 0, y: 0, z: 0 };
        return (
          <Sphere
            key={idx}
            args={[0.03, 16, 16]}
            position={[pos.x * scale, pos.y * scale, pos.z * scale]}
          >
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.6}
            />
          </Sphere>
        );
      })}

      {/* Projection cone for projectors */}
      {blueprint.device_type === 'holographic_projector' && (
        <mesh position={[0, -h/2 - 0.3, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.5, 0.8, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} wireframe />
        </mesh>
      )}

      {/* Robotic arm segments */}
      {blueprint.device_type === 'robotic_arm' && (
        <group>
          <Cylinder args={[0.05, 0.05, 0.6, 16]} position={[0, h/2 + 0.3, 0]}>
            <meshStandardMaterial color={color} />
          </Cylinder>
          <Sphere args={[0.08, 16, 16]} position={[0, h/2 + 0.6, 0]}>
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
          </Sphere>
        </group>
      )}
    </group>
  );
}

export default function Auto360DeviceViewer({ blueprint }) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.01);
  const [fullscreen, setFullscreen] = useState(false);

  if (!blueprint) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-lg">
        <p className="text-slate-400">No device blueprint selected</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [2, 1.5, 2], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, 5, -5]} intensity={0.8} color="#a855f7" />
        <spotLight position={[0, 5, 0]} intensity={0.6} angle={0.5} penumbra={0.5} />

        <Text
          position={[0, 1.5, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
        >
          {blueprint.blueprint_name}
        </Text>

        <RotatingDevice
          blueprint={blueprint}
          autoRotate={autoRotate}
          rotationSpeed={rotationSpeed}
        />

        <OrbitControls
          enableZoom={true}
          autoRotate={autoRotate}
          autoRotateSpeed={2}
        />
      </Canvas>

      {/* Controls Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setAutoRotate(!autoRotate)}
            className={autoRotate ? 'bg-cyan-600' : 'bg-slate-700'}
          >
            {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            onClick={() => setRotationSpeed(s => s === 0.01 ? 0.02 : s === 0.02 ? 0.005 : 0.01)}
            variant="outline"
            className="bg-slate-800/80"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            {rotationSpeed === 0.005 ? 'Slow' : rotationSpeed === 0.01 ? 'Normal' : 'Fast'}
          </Button>
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-400">
          Auto-360° Active
        </Badge>
      </div>
    </div>
  );
}