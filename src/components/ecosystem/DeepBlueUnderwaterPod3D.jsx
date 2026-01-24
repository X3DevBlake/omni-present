import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Cylinder, Sphere, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Droplets, Cpu } from 'lucide-react';

const WaterFlow = ({ position }) => {
  const particlesRef = useRef();

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      particlesRef.current.position.y = -2 + (state.clock.elapsedTime % 4);
    }
  });

  return (
    <group ref={particlesRef} position={position}>
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 1.5;
        return (
          <Sphere
            key={i}
            args={[0.05, 8, 8]}
            position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
          >
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
          </Sphere>
        );
      })}
    </group>
  );
};

const HeatGlow = ({ intensity }) => {
  const glowRef = useRef();

  useFrame((state) => {
    if (glowRef.current) {
      const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
      glowRef.current.material.emissiveIntensity = intensity * pulse;
    }
  });

  return (
    <Sphere ref={glowRef} args={[1.8, 32, 32]} position={[0, 0, 0]}>
      <meshStandardMaterial
        color="#ef4444"
        emissive="#dc2626"
        emissiveIntensity={0.5}
        transparent
        opacity={0.2}
      />
    </Sphere>
  );
};

export default function DeepBlueUnderwaterPod3D() {
  const powerMW = 50;
  const pue = 1.05;
  const heatTransferCoeff = 1250; // W/m²K
  const seawaterTemp = 10; // °C

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-400" />
          DeepBlue Underwater Computing Pod
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-gradient-to-b from-blue-950 to-blue-900 rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [5, 3, 5], fov: 60 }}>
            <ambientLight intensity={0.2} />
            <pointLight position={[5, 5, 5]} intensity={0.5} color="#60a5fa" />

            {/* Pressure vessel */}
            <Cylinder args={[1.2, 1.2, 4, 32]} position={[0, 0, 0]}>
              <meshStandardMaterial
                color="#1e3a8a"
                metalness={0.9}
                roughness={0.1}
                emissive="#1e40af"
                emissiveIntensity={0.3}
              />
            </Cylinder>

            {/* Heat dissipation glow */}
            <HeatGlow intensity={0.7} />

            {/* Water flow particles */}
            <WaterFlow position={[0, 0, 0]} />

            {/* GPU cluster representation */}
            <group position={[0, 0, 0]}>
              {Array.from({ length: 8 }).map((_, i) => {
                const y = -1.5 + (i * 0.4);
                return (
                  <Sphere key={i} args={[0.15, 16, 16]} position={[0, y, 0]}>
                    <meshStandardMaterial
                      color="#10b981"
                      emissive="#059669"
                      emissiveIntensity={0.8}
                    />
                  </Sphere>
                );
              })}
            </group>

            {/* Cables/Connections */}
            <Cylinder args={[0.05, 0.05, 6, 16]} position={[0, 3, 0]} rotation={[0, 0, 0]}>
              <meshStandardMaterial color="#fbbf24" />
            </Cylinder>
            <Text position={[0, 6, 0]} fontSize={0.2} color="white" anchorX="center">
              Surface Link
            </Text>

            {/* Ocean floor */}
            <mesh position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[15, 15]} />
              <meshStandardMaterial color="#0c4a6e" />
            </mesh>

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="bg-black/40 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2 text-center">
              <div className="text-xs text-gray-400">Power</div>
              <div className="text-white font-bold">{powerMW}MW</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded p-2 text-center">
              <div className="text-xs text-gray-400">PUE</div>
              <div className="text-white font-bold">{pue}</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded p-2 text-center">
              <div className="text-xs text-gray-400">Depth</div>
              <div className="text-white font-bold">100-300m</div>
            </div>
          </div>

          <div className="text-xs text-gray-400 font-mono bg-black/60 rounded p-3">
            Q = h̄AΔT_lm
            <br />
            <span className="text-blue-400">
              h̄ ≈ {heatTransferCoeff}W/m²K (forced seawater convection)
            </span>
          </div>

          <div className="flex gap-2">
            <Badge className="bg-blue-500">Ocean Heat Sink</Badge>
            <Badge className="bg-green-500">PUE &lt; 1.05</Badge>
            <Badge className="bg-purple-500">No Chillers</Badge>
          </div>

          <p className="text-sm text-gray-300">
            DeepBlue pods deploy GPU clusters underwater, using the ocean as infinite heat sink.
            Achieves PUE &lt;1.05 through forced seawater convection, eliminating the "Thermal Wall".
          </p>
        </div>
      </CardContent>
    </Card>
  );
}