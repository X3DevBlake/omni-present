import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Activity } from 'lucide-react';
import * as THREE from 'three';

function SentientCore({ active }) {
  const mesh = useRef();
  
  useFrame((state) => {
    if (mesh.current) {
      // Pulse effect
      const t = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 2) * 0.1;
      mesh.current.scale.set(scale, scale, scale);
      mesh.current.rotation.z = t * 0.2;
    }
  });

  return (
    <Sphere ref={mesh} args={[1, 64, 64]}>
      <MeshDistortMaterial
        color={active ? "#a855f7" : "#3b82f6"}
        attach="material"
        distort={active ? 0.6 : 0.3}
        speed={active ? 4 : 2}
        roughness={0.2}
        metalness={0.8}
        emissive={active ? "#a855f7" : "#3b82f6"}
        emissiveIntensity={0.5}
      />
    </Sphere>
  );
}

function ThinkingParticles({ count = 50 }) {
  const points = useRef();
  
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 5;
  }

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y += 0.005;
      points.current.rotation.x += 0.002;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function SentientOracle3D({ isActive, currentThought, metrics }) {
  return (
    <Card className="bg-black/80 border-purple-500/50 backdrop-blur-xl h-full flex flex-col overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
         <Badge variant="outline" className={`${isActive ? 'border-purple-400 text-purple-400 animate-pulse' : 'border-gray-500 text-gray-500'}`}>
           <Brain className="w-3 h-3 mr-1" />
           {isActive ? 'SENTIENT_CORE_ACTIVE' : 'CORE_STANDBY'}
         </Badge>
         {metrics && (
           <div className="bg-black/50 p-2 rounded border border-white/10 backdrop-blur-sm text-[10px] text-white/70 font-mono">
             <div>CPU: {(Math.random() * 20 + 80).toFixed(1)}%</div>
             <div>MEM: {(Math.random() * 10 + 40).toFixed(1)}TB</div>
             <div>ENTROPY: {(Math.random()).toFixed(4)}</div>
           </div>
         )}
      </div>

      <div className="flex-1 min-h-[200px]">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#purple" />
          
          <SentientCore active={isActive} />
          <ThinkingParticles count={100} />
          <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
          
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
        </Canvas>
      </div>

      {currentThought && (
        <div className="p-4 bg-gradient-to-t from-purple-900/90 to-transparent z-10">
          <div className="flex items-center gap-2 mb-1">
             <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
             <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Processing Neural Stream</span>
          </div>
          <p className="text-white text-sm font-light italic leading-relaxed">
            "{currentThought}"
          </p>
        </div>
      )}
    </Card>
  );
}