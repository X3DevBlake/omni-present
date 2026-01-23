import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';

function SuperpositionState({ state, index, total, isCollapsed }) {
  const meshRef = useRef();
  const angle = (index / total) * Math.PI * 2;
  const radius = 5;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = state.probability_amplitude * 3;

  useFrame((clock) => {
    if (meshRef.current && !isCollapsed) {
      meshRef.current.rotation.y += 0.01;
      const pulse = Math.sin(clock.clock.elapsedTime * 2 + state.phase) * 0.2 + 1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const color = new THREE.Color();
  color.setHSL(state.phase / 360, 0.8, 0.6);

  return (
    <group position={[x, y, z]}>
      <Sphere 
        ref={meshRef} 
        args={[state.probability_amplitude * 0.8, 16, 16]}
      >
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={state.coherence}
          transparent
          opacity={isCollapsed ? 0.3 : 0.9}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      <Text
        position={[0, state.probability_amplitude + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {(state.probability_amplitude * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function EntanglementLink({ from, to, strength }) {
  const points = [
    [from.x, from.y, from.z],
    [to.x, to.y, to.z]
  ];

  return (
    <Line
      points={points}
      color="#00FFFF"
      lineWidth={strength * 3}
      transparent
      opacity={strength}
    />
  );
}

function QuantumCore({ isCollapsed }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.8, 32, 32]}>
      <meshStandardMaterial
        color={isCollapsed ? "#FF0000" : "#0000FF"}
        emissive={isCollapsed ? "#FF0000" : "#0000FF"}
        emissiveIntensity={1}
        wireframe
      />
    </Sphere>
  );
}

function SceneContent({ quantumState }) {
  const states = quantumState?.superposition_states || [];
  const isCollapsed = !!quantumState?.measurement_result?.collapsed_state;

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#0088FF" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF00FF" />
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        autoRotate={!isCollapsed}
        autoRotateSpeed={0.5}
      />

      <QuantumCore isCollapsed={isCollapsed} />

      {states.map((state, idx) => (
        <SuperpositionState
          key={idx}
          state={state}
          index={idx}
          total={states.length}
          isCollapsed={isCollapsed}
        />
      ))}

      {quantumState?.entanglement_links?.map((link, idx) => {
        const fromIdx = idx;
        const toIdx = parseInt(link.entangled_state_id.split('_')[1]) || 0;
        if (fromIdx < states.length && toIdx < states.length) {
          const angle1 = (fromIdx / states.length) * Math.PI * 2;
          const angle2 = (toIdx / states.length) * Math.PI * 2;
          const radius = 5;
          
          return (
            <EntanglementLink
              key={idx}
              from={{
                x: Math.cos(angle1) * radius,
                y: states[fromIdx].probability_amplitude * 3,
                z: Math.sin(angle1) * radius
              }}
              to={{
                x: Math.cos(angle2) * radius,
                y: states[toIdx].probability_amplitude * 3,
                z: Math.sin(angle2) * radius
              }}
              strength={link.correlation_strength}
            />
          );
        }
        return null;
      })}

      <Text
        position={[0, -4, 0]}
        fontSize={0.5}
        color={isCollapsed ? "#FF0000" : "#00FFFF"}
        anchorX="center"
        anchorY="middle"
      >
        {isCollapsed ? "STATE COLLAPSED" : "QUANTUM SUPERPOSITION"}
      </Text>
    </>
  );
}

export default function QuantumReasoningVisualizer3D({ quantumState, title = "Quantum Cognition" }) {
  const measurement = quantumState?.measurement_result;
  const intuitionScore = quantumState?.quantum_intuition_score || 0;

  return (
    <Card className="w-full bg-gradient-to-br from-indigo-950 to-purple-950 border-indigo-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          {title}
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-indigo-900 text-indigo-200">
              {quantumState?.parallel_reasoning_paths || 0} Paths
            </Badge>
            <Badge variant="outline" className="bg-purple-900 text-purple-200">
              Intuition: {(intuitionScore * 100).toFixed(0)}%
            </Badge>
            {measurement && (
              <Badge variant="outline" className="bg-red-900 text-red-200">
                Collapsed
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full rounded-lg overflow-hidden bg-black">
          <Canvas camera={{ position: [8, 8, 8], fov: 60 }}>
            <color attach="background" args={['#000000']} />
            <fog attach="fog" args={['#000011', 10, 30]} />
            <SceneContent quantumState={quantumState} />
          </Canvas>
        </div>

        {measurement && (
          <div className="mt-4 p-4 bg-indigo-900 rounded-lg border border-indigo-700">
            <h4 className="text-white font-semibold mb-2">Measurement Result</h4>
            <div className="space-y-2">
              <div className="text-indigo-200">
                <span className="font-medium">Solution:</span> {measurement.collapsed_state}
              </div>
              <div className="text-indigo-200">
                <span className="font-medium">Confidence:</span> {(measurement.confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}