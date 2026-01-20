import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

function QubitNode({ position, index, entangled }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      if (entangled) {
        const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.1 + 0.9;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.4, 32, 32]}>
        <meshStandardMaterial 
          color={entangled ? '#a855f7' : '#60a5fa'}
          emissive={entangled ? '#a855f7' : '#60a5fa'}
          emissiveIntensity={entangled ? 0.8 : 0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      <Text position={[0, 0.8, 0]} fontSize={0.3} color="white" anchorX="center">
        Q{index}
      </Text>
    </group>
  );
}

function QuantumGate({ position, gate, height }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const gateColors = {
    'hadamard': '#10b981',
    'cnot': '#f59e0b',
    'pauli_x': '#ef4444',
    'pauli_z': '#3b82f6',
    'phase': '#8b5cf6'
  };

  return (
    <group position={position}>
      <Box ref={meshRef} args={[0.6, height, 0.6]}>
        <meshStandardMaterial 
          color={gateColors[gate.gate_type?.toLowerCase()] || '#6b7280'}
          transparent
          opacity={0.8}
        />
      </Box>
      <Text position={[0, height/2 + 0.5, 0]} fontSize={0.2} color="white" anchorX="center">
        {gate.gate_type}
      </Text>
    </group>
  );
}

function EntanglementLine({ start, end }) {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      const opacity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      lineRef.current.material.opacity = opacity;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[start, end]}
      color="#a855f7"
      lineWidth={3}
      transparent
      opacity={0.6}
    />
  );
}

export default function QuantumCircuit3D({ circuit }) {
  const qubitCount = circuit?.qubit_count || 4;
  const gates = circuit?.quantum_gates || [];

  const qubitPositions = Array.from({ length: qubitCount }, (_, i) => ({
    position: [-6, (i - qubitCount/2) * 2, 0],
    index: i,
    entangled: i < qubitCount - 1
  }));

  const gatePositions = gates.slice(0, 8).map((gate, i) => ({
    gate,
    position: [-4 + i * 1.5, 0, 0],
    height: (gate.target_qubits?.length || 1) * 1.5
  }));

  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 60 }} style={{ height: '700px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, 5, -10]} intensity={0.8} color="#a855f7" />

      {/* Quantum register visualization */}
      <Cylinder args={[0.1, 0.1, qubitCount * 2 + 2, 16]} position={[-6, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <meshStandardMaterial color="#404040" />
      </Cylinder>

      <Text position={[0, qubitCount + 1.5, 0]} fontSize={0.6} color="white" anchorX="center">
        Quantum Circuit
      </Text>
      <Text position={[0, qubitCount + 0.8, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
        {circuit?.circuit_name || 'Quantum Processor'}
      </Text>
      <Text position={[0, qubitCount + 0.3, 0]} fontSize={0.25} color="#a78bfa" anchorX="center">
        Depth: {circuit?.circuit_depth || 0} | Error: {((circuit?.error_rate || 0) * 100).toFixed(1)}%
      </Text>

      {/* Qubits */}
      {qubitPositions.map((qubit, i) => (
        <QubitNode key={i} {...qubit} />
      ))}

      {/* Quantum gates */}
      {gatePositions.map((gatePos, i) => (
        <QuantumGate key={i} {...gatePos} />
      ))}

      {/* Entanglement visualization */}
      {qubitPositions.slice(0, -1).map((qubit, i) => (
        <EntanglementLine
          key={i}
          start={qubit.position}
          end={qubitPositions[i + 1].position}
        />
      ))}

      {/* Superposition indicator */}
      <group position={[0, -qubitCount - 2, 0]}>
        <Text fontSize={0.4} color="#10b981" anchorX="center">
          ⚛️ Quantum Superposition Active
        </Text>
      </group>

      <OrbitControls enableZoom={true} minDistance={10} maxDistance={30} />
    </Canvas>
  );
}