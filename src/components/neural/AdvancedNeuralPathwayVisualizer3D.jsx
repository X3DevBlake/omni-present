import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Activity } from 'lucide-react';
import * as THREE from 'three';

function NeuralRegion({ region, position, onClick }) {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current && glowRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2 * region.activation_level) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
      glowRef.current.scale.setScalar(pulse * 1.2);
    }
  });

  const color = region.activation_level > 0.7 ? '#ff0080' : 
                region.activation_level > 0.4 ? '#ff8800' : '#00ffff';

  return (
    <group position={position} onClick={onClick}>
      <Sphere ref={glowRef} args={[0.5, 32, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </Sphere>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={region.activation_level}
        />
      </Sphere>
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {region.region_name}
      </Text>
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.1}
        color="#aaaaaa"
        anchorX="center"
        anchorY="middle"
      >
        {(region.activation_level * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function NeuralPathway({ pathway, sourcePos, targetPos }) {
  const lineRef = useRef();
  const particlesRef = useRef();

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position;
      const time = clock.elapsedTime * pathway.activity_level * 2;
      
      for (let i = 0; i < positions.count; i++) {
        const t = ((time + i * 0.1) % 1);
        const x = THREE.MathUtils.lerp(sourcePos[0], targetPos[0], t);
        const y = THREE.MathUtils.lerp(sourcePos[1], targetPos[1], t);
        const z = THREE.MathUtils.lerp(sourcePos[2], targetPos[2], t);
        
        positions.setXYZ(i, x, y, z);
      }
      positions.needsUpdate = true;
    }
  });

  const pathwayColor = pathway.strength > 0.7 ? '#ff0080' : 
                       pathway.strength > 0.4 ? '#ff8800' : '#00ffff';

  const particleCount = Math.floor(pathway.activity_level * 20);
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    return positions;
  }, [particleCount]);

  return (
    <group>
      <Line
        ref={lineRef}
        points={[sourcePos, targetPos]}
        color={pathwayColor}
        lineWidth={pathway.strength * 3}
        transparent
        opacity={0.6}
      />
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.08} color={pathwayColor} transparent opacity={0.8} />
      </points>
    </group>
  );
}

function NeuralPathwayScene({ pathwayData, brainRegions }) {
  const regionPositions = useMemo(() => {
    const positions = {};
    const radius = 4;
    brainRegions.forEach((region, idx) => {
      const angle = (idx / brainRegions.length) * Math.PI * 2;
      const height = (Math.random() - 0.5) * 2;
      positions[region.region_name] = [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ];
    });
    return positions;
  }, [brainRegions]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ff0080" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#00ffff" />
      
      <Text
        position={[0, 6, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        NEURAL PATHWAY NETWORK
      </Text>

      {/* Brain Regions */}
      {brainRegions.map((region, idx) => (
        <NeuralRegion
          key={region.region_name}
          region={region}
          position={regionPositions[region.region_name]}
        />
      ))}

      {/* Neural Pathways */}
      {pathwayData.map((pathway, idx) => {
        const sourcePos = regionPositions[pathway.source_region];
        const targetPos = regionPositions[pathway.target_region];
        
        if (!sourcePos || !targetPos) return null;
        
        return (
          <NeuralPathway
            key={pathway.pathway_id || idx}
            pathway={pathway}
            sourcePos={sourcePos}
            targetPos={targetPos}
          />
        );
      })}

      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function AdvancedNeuralPathwayVisualizer3D({ pathwayMap }) {
  const pathwayData = pathwayMap?.pathway_data || [];
  const brainRegions = pathwayMap?.brain_regions || [];

  const avgActivation = brainRegions.length > 0 
    ? brainRegions.reduce((sum, r) => sum + r.activation_level, 0) / brainRegions.length 
    : 0;

  return (
    <Card className="bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 border-pink-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Brain className="w-8 h-8 text-pink-400 animate-pulse" />
          Advanced Neural Pathway Network
          <Badge className="bg-pink-500/30 text-pink-300">
            CONSCIOUSNESS SYNC: {((pathwayMap?.consciousness_sync_level || 0) * 100).toFixed(0)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-pink-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-pink-400" />
              <span className="text-white/60 text-xs">Regions Active</span>
            </div>
            <div className="text-white text-xl font-bold">{brainRegions.length}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-xs">Active Pathways</span>
            </div>
            <div className="text-white text-xl font-bold">{pathwayData.length}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-white/60 text-xs">Avg Activation</span>
            </div>
            <div className="text-white text-xl font-bold">{(avgActivation * 100).toFixed(0)}%</div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
            <color attach="background" args={['#000000']} />
            <fog attach="fog" args={['#000000', 5, 30]} />
            <NeuralPathwayScene 
              pathwayData={pathwayData} 
              brainRegions={brainRegions}
            />
          </Canvas>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="text-xs text-white/60">
            <span className="text-pink-400">●</span> High Activity (70%+)
          </div>
          <div className="text-xs text-white/60">
            <span className="text-orange-400">●</span> Medium Activity (40-70%)
          </div>
          <div className="text-xs text-white/60">
            <span className="text-cyan-400">●</span> Low Activity (&lt;40%)
          </div>
          <div className="text-xs text-white/60">
            Thought Latency: {pathwayMap?.thought_latency_ms || 0}ms
          </div>
        </div>
      </CardContent>
    </Card>
  );
}