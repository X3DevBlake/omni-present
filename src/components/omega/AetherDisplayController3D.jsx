import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Zap, Focus, Target } from 'lucide-react';

const AetherParticle = ({ position, id, isVaporizing, isStabilized, focalDepth }) => {
  const meshRef = useRef();
  const trailRef = useRef([]);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Dynamic interaction physics
      const time = state.clock.elapsedTime;
      meshRef.current.position.x = position[0] + Math.sin(time * 2 + id) * 0.05;
      meshRef.current.position.y = position[1] + Math.cos(time * 2 + id) * 0.05;
      
      // Vaporization effect
      if (isVaporizing) {
        const vaporScale = 1 + Math.sin(time * 10) * 0.3;
        meshRef.current.scale.setScalar(vaporScale);
        meshRef.current.material.opacity = Math.max(0.3, 1 - (time % 2) / 2);
      } else {
        meshRef.current.scale.setScalar(1);
        meshRef.current.material.opacity = 1;
      }
      
      // Active stabilization loop effect
      if (isStabilized) {
        meshRef.current.rotation.x = time * 2;
        meshRef.current.rotation.y = time * 1.5;
      }
    }
  });
  
  const baseColor = isVaporizing ? '#ff6b6b' : isStabilized ? '#4ade80' : '#60a5fa';
  
  return (
    <group>
      <Sphere ref={meshRef} args={[0.12, 32, 32]} position={position}>
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={isVaporizing ? 2.0 : isStabilized ? 1.2 : 0.8}
          transparent
          opacity={1}
        />
      </Sphere>
      
      {/* Stabilization loop indicator */}
      {isStabilized && (
        <mesh position={position}>
          <torusGeometry args={[0.2, 0.02, 16, 32]} />
          <meshStandardMaterial
            color="#4ade80"
            emissive="#4ade80"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
};

const InteractionField = ({ particles }) => {
  const linesRef = useRef([]);
  
  return (
    <>
      {particles.map((p1, idx1) => 
        particles.slice(idx1 + 1).map((p2, idx2) => {
          const dist = Math.sqrt(
            Math.pow(p1.x - p2.x, 2) + 
            Math.pow(p1.y - p2.y, 2) + 
            Math.pow(p1.z - p2.z, 2)
          );
          
          if (dist < 1.5) {
            const strength = 1 - (dist / 1.5);
            return (
              <Line
                key={`${idx1}_${idx2}`}
                points={[
                  new THREE.Vector3(p1.x, p1.y, p1.z),
                  new THREE.Vector3(p2.x, p2.y, p2.z)
                ]}
                color="#8b5cf6"
                lineWidth={strength * 2}
                transparent
                opacity={strength * 0.3}
              />
            );
          }
          return null;
        })
      )}
    </>
  );
};

const FocalPlane = ({ depth }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0, depth]}>
      <planeGeometry args={[5, 5]} />
      <meshStandardMaterial
        color="#06b6d4"
        emissive="#06b6d4"
        emissiveIntensity={0.3}
        transparent
        opacity={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default function AetherDisplayController3D() {
  const [laserIntensity, setLaserIntensity] = useState(75);
  const [particleCount, setParticleCount] = useState(4);
  const [focalDepth, setFocalDepth] = useState(0);
  const [stabilizationActive, setStabilizationActive] = useState(false);
  const [dragCoefficient, setDragCoefficient] = useState(0.5);
  const [particles, setParticles] = useState([]);
  const [vaporizing, setVaporizing] = useState(false);

  React.useEffect(() => {
    // Generate multi-particle positions
    const newParticles = Array(particleCount).fill(0).map((_, i) => {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1 + Math.random() * 0.5;
      return {
        id: i,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: focalDepth + (Math.random() - 0.5) * 0.3
      };
    });
    setParticles(newParticles);
  }, [particleCount, focalDepth]);

  React.useEffect(() => {
    // Check for vaporization threshold
    setVaporizing(laserIntensity > 120);
  }, [laserIntensity]);

  const activateStabilization = () => {
    setStabilizationActive(!stabilizationActive);
  };

  // Calculate drag force magnitude
  const dragForce = (dragCoefficient * Math.pow(laserIntensity / 100, 2)).toFixed(2);

  return (
    <Card className="bg-gradient-to-br from-cyan-950/90 via-blue-950/90 to-indigo-950/90 backdrop-blur-xl border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Zap className="w-7 h-7 text-cyan-400" />
          Aether Volumetric Display Controller
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Advanced POT with multi-particle dynamics and active stabilization
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-cyan-500/20">
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.0} color="#06b6d4" />
            <pointLight position={[-10, -10, -10]} intensity={0.6} color="#3b82f6" />

            {/* Focal plane */}
            <FocalPlane depth={focalDepth} />

            {/* Multi-particle hologram */}
            {particles.map((particle) => (
              <AetherParticle
                key={particle.id}
                position={[particle.x, particle.y, particle.z]}
                id={particle.id}
                isVaporizing={vaporizing}
                isStabilized={stabilizationActive}
                focalDepth={focalDepth}
              />
            ))}

            {/* Particle interaction fields */}
            <InteractionField particles={particles} />

            {/* Central laser beam origin */}
            <Sphere args={[0.15, 32, 32]} position={[0, 0, -2]}>
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#fbbf24"
                emissiveIntensity={laserIntensity / 50}
              />
            </Sphere>

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-white text-sm mb-2 block flex items-center justify-between">
              Laser Intensity: {laserIntensity} W/mm²
              {vaporizing && <Badge className="bg-red-600 text-[10px]">⚠️ Vaporizing</Badge>}
            </label>
            <Slider
              value={[laserIntensity]}
              onValueChange={(val) => setLaserIntensity(val[0])}
              min={10}
              max={150}
              step={5}
            />
            <p className="text-xs text-gray-400 mt-1">Threshold: 120 W/mm² for vaporization</p>
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">
              Focal Depth: {focalDepth.toFixed(1)}m
            </label>
            <Slider
              value={[focalDepth]}
              onValueChange={(val) => setFocalDepth(val[0])}
              min={-2}
              max={2}
              step={0.1}
            />
            <p className="text-xs text-gray-400 mt-1">Variable z-axis focus adjustment</p>
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">
              Particle Count: {particleCount}
            </label>
            <Slider
              value={[particleCount]}
              onValueChange={(val) => setParticleCount(val[0])}
              min={1}
              max={12}
              step={1}
            />
            <p className="text-xs text-gray-400 mt-1">Multi-particle hologram complexity</p>
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">
              Drag Coefficient: {dragCoefficient.toFixed(2)}
            </label>
            <Slider
              value={[dragCoefficient]}
              onValueChange={(val) => setDragCoefficient(val[0])}
              min={0.1}
              max={2.0}
              step={0.1}
            />
            <p className="text-xs text-gray-400 mt-1">Aerodynamic resistance</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/60 rounded-lg p-3 border border-cyan-500/30">
            <div className="text-cyan-400 text-xs mb-1">Particles</div>
            <div className="text-white text-xl font-bold">{particleCount}</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-amber-500/30">
            <div className="text-amber-400 text-xs mb-1">Drag Force</div>
            <div className="text-white text-xl font-bold">{dragForce} pN</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-green-500/30">
            <div className="text-green-400 text-xs mb-1">Stability</div>
            <div className="text-white text-xl font-bold">
              {stabilizationActive ? '99%' : '75%'}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={activateStabilization}
            className={`flex-1 ${stabilizationActive ? 'bg-green-600 hover:bg-green-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
          >
            <Target className="w-4 h-4 mr-2" />
            {stabilizationActive ? 'Stabilization Active' : 'Activate Stabilization'}
          </Button>
          
          <Button
            variant="outline"
            className="border-cyan-500/50 text-cyan-300"
            onClick={() => setFocalDepth(0)}
          >
            <Focus className="w-4 h-4 mr-2" />
            Reset Focus
          </Button>
        </div>

        {vaporizing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-red-950/50 border border-red-500/50 rounded-lg p-3"
          >
            <div className="text-red-400 text-sm font-bold mb-1">⚠️ Particle Vaporization Risk</div>
            <p className="text-gray-300 text-xs">
              Laser intensity exceeds thermal stability threshold. Reduce power or increase particle size to prevent vaporization.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}