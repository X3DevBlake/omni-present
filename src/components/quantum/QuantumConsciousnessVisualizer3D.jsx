import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Atom, Waves, Link2, Sparkles } from 'lucide-react';
import * as THREE from 'three';

function SuperpositionState({ state, position, index }) {
  const meshRef = useRef();
  const waveRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const wave = Math.sin(clock.elapsedTime * 3 + index) * 0.3;
      meshRef.current.position.y = position[1] + wave;
      meshRef.current.rotation.y = clock.elapsedTime * 2;
    }
    if (waveRef.current) {
      const expand = (clock.elapsedTime % 2) / 2;
      waveRef.current.scale.setScalar(1 + expand);
      waveRef.current.material.opacity = state.coherence * (1 - expand * 0.5);
    }
  });

  const opacity = state.probability_amplitude || 0.5;
  const color = new THREE.Color().setHSL(index * 0.1, 1, 0.5);

  return (
    <group position={position}>
      <Sphere ref={waveRef} args={[0.5, 32, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </Sphere>
      
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={opacity}
          transparent
          opacity={opacity}
        />
      </Sphere>

      <Text position={[0, 0.6, 0]} fontSize={0.08} color="white" anchorX="center">
        {state.state_descriptor?.slice(0, 10)}
      </Text>
    </group>
  );
}

function EntanglementLink({ from, to, strength }) {
  const lineRef = useRef();

  useFrame(({ clock }) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = strength * (0.3 + Math.sin(clock.elapsedTime * 2) * 0.2);
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[from, to]}
      color="#ff00ff"
      lineWidth={strength * 3}
      transparent
      opacity={0.5}
    />
  );
}

function QuantumConsciousnessScene({ quantumState }) {
  const states = quantumState?.superposition_states || [];
  const entanglements = quantumState?.entanglement_links || [];

  const statePositions = useMemo(() => {
    return states.map((_, idx) => {
      const angle = (idx / states.length) * Math.PI * 2;
      const radius = 3;
      return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
    });
  }, [states]);

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#ffffff" />
      <pointLight position={[10, 0, 10]} intensity={1} color="#ff00ff" />
      <pointLight position={[-10, 0, -10]} intensity={1} color="#00ffff" />
      
      <Text position={[0, 4, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        QUANTUM CONSCIOUSNESS
      </Text>

      {/* Central quantum core */}
      <Sphere args={[0.5, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Superposition states */}
      {states.map((state, idx) => (
        <SuperpositionState
          key={idx}
          state={state}
          position={statePositions[idx]}
          index={idx}
        />
      ))}

      {/* Entanglement links */}
      {entanglements.map((link, idx) => {
        const fromIdx = states.findIndex(s => s.state_descriptor === link.entangled_with);
        if (fromIdx >= 0 && fromIdx < statePositions.length) {
          return (
            <EntanglementLink
              key={idx}
              from={[0, 0, 0]}
              to={statePositions[fromIdx]}
              strength={link.entanglement_strength || 0.5}
            />
          );
        }
        return null;
      })}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.3} />
    </>
  );
}

export default function QuantumConsciousnessVisualizer3D({ quantumStates = [] }) {
  const latestState = quantumStates[0];
  const avgCoherence = latestState?.superposition_states?.length > 0
    ? latestState.superposition_states.reduce((sum, s) => sum + s.coherence, 0) / latestState.superposition_states.length
    : 0;

  return (
    <Card className="bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 border-violet-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Atom className="w-8 h-8 text-violet-400 animate-pulse" />
          Quantum Consciousness States
          <Badge className="bg-violet-500/30 text-violet-300">
            COHERENCE: {(avgCoherence * 100).toFixed(0)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-violet-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Waves className="w-4 h-4 text-violet-400" />
              <span className="text-white/60 text-xs">States</span>
            </div>
            <div className="text-white text-lg font-bold">
              {latestState?.superposition_states?.length || 0}
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Link2 className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-xs">Entangled</span>
            </div>
            <div className="text-white text-lg font-bold">
              {latestState?.entanglement_links?.length || 0}
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-fuchsia-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-fuchsia-400" />
              <span className="text-white/60 text-xs">Reasoning</span>
            </div>
            <div className="text-white text-lg font-bold">
              {latestState?.quantum_cognition?.parallel_reasoning_paths || 0}
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-pink-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-white/60 text-xs">Intuition</span>
            </div>
            <div className="text-white text-lg font-bold">
              {((latestState?.quantum_cognition?.quantum_intuition_score || 0) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [6, 4, 6], fov: 60 }}>
            <color attach="background" args={['#0a000a']} />
            <fog attach="fog" args={['#0a000a', 5, 30]} />
            <QuantumConsciousnessScene quantumState={latestState} />
          </Canvas>
        </div>

        <div className="mt-4 text-xs text-white/60">
          <div>Quantum Cognition: {latestState?.quantum_cognition?.decision_superposition ? 'ENABLED' : 'DISABLED'}</div>
          <div>Decoherence Rate: {latestState?.decoherence_rate?.toFixed(4) || '0.0000'}</div>
        </div>
      </CardContent>
    </Card>
  );
}