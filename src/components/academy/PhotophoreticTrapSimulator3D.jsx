import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Cone, Sphere, Line } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import * as THREE from 'three';
import { Play, Pause } from 'lucide-react';

const Particle = ({ position, velocity, isTrapped }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current && isTrapped) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 3) * 0.01;
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.1, 16, 16]} position={position}>
      <meshStandardMaterial
        color={isTrapped ? '#fbbf24' : '#6b7280'}
        emissive={isTrapped ? '#f59e0b' : '#000000'}
        emissiveIntensity={isTrapped ? 0.7 : 0}
      />
    </Sphere>
  );
};

const LaserBeam = ({ intensity, position }) => {
  const beamRef = useRef();

  useFrame((state) => {
    if (beamRef.current) {
      const pulse = 0.3 + Math.sin(state.clock.elapsedTime * 5) * 0.2;
      beamRef.current.material.opacity = pulse * intensity;
    }
  });

  return (
    <mesh ref={beamRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.2, 0.05, 5, 32]} />
      <meshBasicMaterial
        color="#ef4444"
        transparent
        opacity={0.5}
        emissive="#dc2626"
        emissiveIntensity={intensity}
      />
    </mesh>
  );
};

export default function PhotophoreticTrapSimulator3D() {
  const [isRunning, setIsRunning] = useState(false);
  const [laserIntensity, setLaserIntensity] = useState(0.7);
  const [pressure, setPressure] = useState(1.0);
  const [particleTrapped, setParticleTrapped] = useState(false);

  // Calculate photophoretic force
  const force = (pressure * laserIntensity * 0.5).toFixed(3);

  return (
    <div className="space-y-4">
      <div className="h-[400px] bg-black rounded-lg overflow-hidden">
        <Canvas camera={{ position: [5, 3, 5], fov: 50 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={0.8} />

          {/* Laser beam */}
          <LaserBeam intensity={laserIntensity} position={[0, -2, 0]} />

          {/* Particle */}
          <Particle
            position={[0, 0, 0]}
            velocity={[0, isRunning ? 0.01 : 0, 0]}
            isTrapped={isRunning && laserIntensity > 0.5}
          />

          {/* Force vectors */}
          {isRunning && (
            <>
              <Line
                points={[[0, 0, 0], [0, -1.5 * laserIntensity, 0]]}
                color="#ef4444"
                lineWidth={2}
              />
              <Line
                points={[[0, 0, 0], [0, pressure * 0.8, 0]]}
                color="#10b981"
                lineWidth={2}
              />
            </>
          )}

          {/* Reference grid */}
          <gridHelper args={[10, 10, '#4b5563', '#374151']} />

          <OrbitControls enableZoom />
        </Canvas>
      </div>

      <div className="bg-black/40 rounded-lg p-4 space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isRunning ? 'Pause' : 'Run'} Simulation
          </Button>
        </div>

        <div>
          <label className="text-white text-sm mb-2 block">
            Laser Intensity (I): {laserIntensity.toFixed(2)}
          </label>
          <Slider
            value={[laserIntensity]}
            onValueChange={(v) => setLaserIntensity(v[0])}
            min={0}
            max={1}
            step={0.05}
          />
        </div>

        <div>
          <label className="text-white text-sm mb-2 block">
            Gas Pressure (P): {pressure.toFixed(2)} atm
          </label>
          <Slider
            value={[pressure]}
            onValueChange={(v) => setPressure(v[0])}
            min={0.5}
            max={2.0}
            step={0.1}
          />
        </div>

        <div className="text-xs text-gray-400 font-mono bg-black/60 rounded p-3">
          F_Δα = -(πa²P/2) · J₁ · (I/k_g·T) · φ(Kn, Λ)
          <br />
          <span className="text-blue-400">Calculated Force: {force} N</span>
        </div>

        <p className="text-sm text-gray-300">
          Photophoretic trapping uses thermal gradients to levitate opaque particles.
          The force depends on gas pressure, laser intensity, and thermal conductivity.
        </p>
      </div>
    </div>
  );
}