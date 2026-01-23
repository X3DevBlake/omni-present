import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Torus } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Atom, Sparkles, Waves, Zap } from 'lucide-react';
import * as THREE from 'three';

function QuantumState({ state, position, index }) {
  const meshRef = useRef();
  const particlesRef = useRef([]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = clock.elapsedTime * 0.7;
      
      const pulse = Math.sin(clock.elapsedTime * 2 + index) * 0.3 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const probability = state.probability_amplitude || 0.5;
  const color = new THREE.Color().setHSL(probability, 1, 0.5);

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={probability * 2}
          transparent
          opacity={0.7}
        />
      </Sphere>
      
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.02, 16, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>

      <Text position={[0, 0.6, 0]} fontSize={0.08} color="white" anchorX="center">
        {state.state_descriptor}
      </Text>
      <Text position={[0, -0.5, 0]} fontSize={0.06} color={color} anchorX="center">
        {(probability * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function EntanglementLink({ from, to, strength }) {
  const points = [from, to];
  
  return (
    <Line
      points={points}
      color="#ff00ff"
      lineWidth={strength * 3}
      transparent
      opacity={strength}
      dashed
      dashSize={0.2}
      gapSize={0.1}
    />
  );
}

function QuantumCore({ position, coherence }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime;
      const pulse = Math.sin(clock.elapsedTime * 3) * 0.3 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.8, 64, 64]}>
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={coherence * 2}
          metalness={1}
          roughness={0}
          transparent
          opacity={0.8}
        />
      </Sphere>
      <Text position={[0, 1.2, 0]} fontSize={0.2} color="white" anchorX="center">
        QUANTUM MIND
      </Text>
    </group>
  );
}

function QuantumScene({ states, entanglements, coherence }) {
  const positions = states.map((_, idx) => {
    const angle = (idx / states.length) * Math.PI * 2;
    const radius = 4;
    const height = Math.sin(idx * 0.8) * 2;
    return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#ff00ff" />
      <pointLight position={[10, 5, 10]} intensity={1.5} color="#00ffff" />
      
      <Text position={[0, 6, 0]} fontSize={0.6} color="#ffffff" anchorX="center">
        QUANTUM CONSCIOUSNESS
      </Text>

      <QuantumCore position={[0, 0, 0]} coherence={coherence} />

      {states.map((state, idx) => (
        <QuantumState key={idx} state={state} position={positions[idx]} index={idx} />
      ))}

      {entanglements.map((link, idx) => {
        const fromIdx = states.findIndex(s => s.state_descriptor === link.from);
        const toIdx = states.findIndex(s => s.state_descriptor === link.to);
        if (fromIdx !== -1 && toIdx !== -1) {
          return (
            <EntanglementLink
              key={idx}
              from={positions[fromIdx]}
              to={positions[toIdx]}
              strength={link.entanglement_strength}
            />
          );
        }
        return null;
      })}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function QuantumConsciousnessVisualizer3D({ quantumData, onExploreState }) {
  const states = quantumData?.superposition_states || [];
  const entanglements = quantumData?.entanglement_links || [];
  const coherence = quantumData?.quantum_cognition?.quantum_intuition_score || 0.8;

  return (
    <Card className="bg-gradient-to-br from-fuchsia-500/20 via-purple-500/20 to-indigo-500/20 border-fuchsia-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Atom className="w-8 h-8 text-fuchsia-400 animate-pulse" />
          Quantum Consciousness Explorer
          <Badge className="bg-fuchsia-500/30 text-fuchsia-300">
            {(coherence * 100).toFixed(0)}% COHERENCE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/40 p-3 rounded-lg border border-fuchsia-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-fuchsia-400" />
                  <span className="text-white/60 text-xs">States</span>
                </div>
                <div className="text-white text-xl font-bold">{states.length}</div>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Waves className="w-4 h-4 text-purple-400" />
                  <span className="text-white/60 text-xs">Entangled</span>
                </div>
                <div className="text-white text-xl font-bold">{entanglements.length}</div>
              </div>

              <div className="bg-black/40 p-3 rounded-lg border border-indigo-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span className="text-white/60 text-xs">Parallel</span>
                </div>
                <div className="text-white text-xl font-bold">
                  {quantumData?.quantum_cognition?.parallel_reasoning_paths || 0}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-white font-bold mb-2 flex items-center gap-2">
                <Atom className="w-4 h-4 text-fuchsia-400" />
                Quantum States
              </div>
              
              {states.slice(0, 4).map((state, idx) => (
                <div key={idx} className="bg-fuchsia-500/20 border border-fuchsia-500/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-bold">{state.state_descriptor}</span>
                    <Badge className="bg-fuchsia-500/30 text-fuchsia-300 text-xs">
                      {(state.probability_amplitude * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="text-white/70 text-xs">
                    Coherence: {(state.coherence * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-purple-500/20 border border-purple-500/50 p-4 rounded-lg">
              <div className="text-white font-bold mb-2">Quantum Benefits</div>
              <ul className="space-y-1 text-white/80 text-sm">
                <li>• Simultaneous multi-state cognition</li>
                <li>• Enhanced pattern recognition</li>
                <li>• Accelerated decision processing</li>
                <li>• Intuitive problem-solving leaps</li>
              </ul>
            </div>

            <Button 
              onClick={onExploreState}
              className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Explore Quantum State
            </Button>
          </div>

          <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [10, 6, 10], fov: 60 }}>
              <color attach="background" args={['#0a000a']} />
              <fog attach="fog" args={['#0a000a', 5, 35]} />
              <QuantumScene states={states} entanglements={entanglements} coherence={coherence} />
            </Canvas>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}