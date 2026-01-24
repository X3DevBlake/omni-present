import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Cone, Line, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Atom, Flame, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

const TrappedParticle = ({ position, isTrapped, vaporizing }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      if (isTrapped) {
        meshRef.current.rotation.y += 0.02;
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
      } else {
        meshRef.current.position.y -= 0.01; // Falling
      }
    }
  });
  
  return (
    <Sphere ref={meshRef} args={[0.1, 32, 32]} position={position}>
      <meshStandardMaterial
        color={vaporizing ? '#ef4444' : isTrapped ? '#fbbf24' : '#6b7280'}
        emissive={vaporizing ? '#ef4444' : isTrapped ? '#fbbf24' : '#000000'}
        emissiveIntensity={vaporizing ? 1.5 : isTrapped ? 0.8 : 0.2}
      />
    </Sphere>
  );
};

const VortexBeam = ({ position, intensity }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 2;
    }
  });
  
  return (
    <group position={position}>
      <Cone ref={meshRef} args={[0.4, 3, 32, 1, true]} rotation={[Math.PI, 0, 0]}>
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={intensity / 100}
          transparent
          opacity={0.3}
          wireframe
        />
      </Cone>
    </group>
  );
};

const ForceVector = ({ position, force, label, color }) => {
  const magnitude = Math.abs(force) / 10;
  const direction = force > 0 ? 1 : -1;
  
  return (
    <group position={position}>
      <arrowHelper
        args={[
          new THREE.Vector3(0, direction, 0),
          new THREE.Vector3(0, 0, 0),
          magnitude,
          color
        ]}
      />
      <Text position={[0.5, 0, 0]} fontSize={0.12} color={color}>
        {label}: {force.toFixed(2)}pN
      </Text>
    </group>
  );
};

export default function PhotophoreticTrapSimulator3D() {
  const [laserIntensity, setLaserIntensity] = useState(50);
  const [particleRadius, setParticleRadius] = useState(10);
  const [isSimulating, setIsSimulating] = useState(false);
  const [trapResult, setTrapResult] = useState(null);
  const [particlePosition, setParticlePosition] = useState([0, 0, 0]);
  const [particleCount, setParticleCount] = useState(1);
  const [focalDepth, setFocalDepth] = useState(1.5);
  const [multiParticles, setMultiParticles] = useState([]);
  const [dragForceActive, setDragForceActive] = useState(false);

  const runSimulation = async () => {
    setIsSimulating(true);
    setDragForceActive(laserIntensity > 100);
    
    try {
      // Generate multi-particle positions
      const particles = Array(particleCount).fill(0).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = 0.5;
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          z: (i - particleCount / 2) * 0.2
        };
      });
      
      const response = await base44.functions.invoke('photophoreticTrapController', {
        particle_type: 'cellulose',
        particle_radius_um: particleRadius,
        laser_intensity_W_mm2: laserIntensity,
        target_positions: particles
      });

      setTrapResult(response.data);
      setMultiParticles(particles.map((p, i) => ({
        ...p,
        id: i,
        stable: response.data.stability.is_stable,
        vaporizing: response.data.stability.vaporization_risk > 0.7
      })));
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const isTrapped = trapResult?.stability?.is_stable;
  const vaporizing = trapResult?.stability?.vaporization_risk > 0.7;

  return (
    <Card className="bg-gradient-to-br from-blue-950/90 via-indigo-950/90 to-purple-950/90 backdrop-blur-xl border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Atom className="w-7 h-7 text-blue-400" />
          Photophoretic Optical Trapping (POT) Simulator
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Volumetric display via light-induced thermal forces
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-blue-500/20">
          <Canvas camera={{ position: [3, 3, 5], fov: 60 }}>
            <ambientLight intensity={0.2} />
            <pointLight position={[5, 5, 5]} intensity={1} />

            {/* Vortex laser beam */}
            <VortexBeam position={[0, -1.5, 0]} intensity={laserIntensity} />

            {/* Multi-particle system */}
            {multiParticles.length > 0 ? (
              multiParticles.map((particle, idx) => (
                <TrappedParticle
                  key={particle.id}
                  position={[particle.x, particle.y, particle.z]}
                  isTrapped={particle.stable}
                  vaporizing={particle.vaporizing}
                />
              ))
            ) : (
              <TrappedParticle
                position={particlePosition}
                isTrapped={isTrapped}
                vaporizing={vaporizing}
              />
            )}

            {/* Force indicators */}
            {trapResult && (
              <>
                <Html position={[2, 2, 0]}>
                  <div className="bg-black/90 border border-blue-500/50 rounded-lg p-3 min-w-[200px]">
                    <div className="text-blue-400 font-bold text-xs mb-2">Force Balance</div>
                    <div className="space-y-1 text-[10px] text-white font-mono">
                      <div>F_Δα: {trapResult.forces.photophoretic_pN.toFixed(2)} pN</div>
                      <div>F_G: {trapResult.forces.gravity_pN.toFixed(2)} pN</div>
                      <div>F_R: {trapResult.forces.radiation_pressure_pN.toFixed(2)} pN</div>
                      <div>F_Drag: {trapResult.forces.drag_pN.toFixed(2)} pN</div>
                      <div className="pt-1 border-t border-blue-500/30">
                        Net: {trapResult.forces.net_force_pN.toFixed(2)} pN
                      </div>
                    </div>
                  </div>
                </Html>
              </>
            )}

            {/* Temperature indicator */}
            {vaporizing && (
              <group position={particlePosition}>
                <Sphere args={[0.3, 16, 16]}>
                  <meshStandardMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.5}
                  />
                </Sphere>
              </group>
            )}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-white text-sm mb-2 block">
              Laser Intensity: {laserIntensity} W/mm²
            </label>
            <Slider
              value={[laserIntensity]}
              onValueChange={(val) => setLaserIntensity(val[0])}
              min={10}
              max={150}
              step={5}
            />
            {laserIntensity > 100 && (
              <p className="text-amber-400 text-xs mt-1">⚠️ High drag forces active</p>
            )}
          </div>
          
          <div>
            <label className="text-white text-sm mb-2 block">
              Particle Radius: {particleRadius} µm
            </label>
            <Slider
              value={[particleRadius]}
              onValueChange={(val) => setParticleRadius(val[0])}
              min={5}
              max={20}
              step={1}
            />
          </div>
          
          <div>
            <label className="text-white text-sm mb-2 block">
              Particle Count: {particleCount}
            </label>
            <Slider
              value={[particleCount]}
              onValueChange={(val) => setParticleCount(val[0])}
              min={1}
              max={8}
              step={1}
            />
            <p className="text-xs text-gray-400">Multi-particle hologram complexity</p>
          </div>
          
          <div>
            <label className="text-white text-sm mb-2 block">
              Focal Depth: {focalDepth.toFixed(1)}m
            </label>
            <Slider
              value={[focalDepth]}
              onValueChange={(val) => setFocalDepth(val[0])}
              min={0.5}
              max={3.0}
              step={0.1}
            />
            <p className="text-xs text-gray-400">Variable z-axis trapping range</p>
          </div>
        </div>

        {trapResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 grid grid-cols-3 gap-3"
          >
            <div className="bg-black/60 rounded-lg p-3 border border-green-500/30">
              <div className="text-green-400 text-xs mb-1">Stability</div>
              <div className="text-white text-2xl font-bold">
                {(trapResult.stability.thermodynamic_stability_score * 100).toFixed(0)}%
              </div>
            </div>
            
            <div className="bg-black/60 rounded-lg p-3 border border-amber-500/30">
              <div className="text-amber-400 text-xs mb-1">Vaporization Risk</div>
              <div className="text-white text-2xl font-bold">
                {(trapResult.stability.vaporization_risk * 100).toFixed(0)}%
              </div>
            </div>
            
            <div className="bg-black/60 rounded-lg p-3 border border-blue-500/30">
              <div className="text-blue-400 text-xs mb-1">Scan Velocity</div>
              <div className="text-white text-2xl font-bold">
                {trapResult.scanning.required_velocity_m_s.toFixed(2)}m/s
              </div>
            </div>
          </motion.div>
        )}

        <Button
          onClick={runSimulation}
          disabled={isSimulating}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Play className="w-4 h-4 mr-2" />
          {isSimulating ? 'Calculating Forces...' : 'Run POT Simulation'}
        </Button>

        {trapResult && !trapResult.stability.is_stable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 bg-red-950/50 border border-red-500/50 rounded-lg p-3"
          >
            <div className="text-red-400 text-sm font-bold mb-1">⚠️ Unstable Configuration</div>
            <div className="text-gray-300 text-xs">
              Force balance not achieved. Adjust laser intensity or particle radius.
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}