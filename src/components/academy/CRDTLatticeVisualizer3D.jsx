import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Box, Html } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';
import { Plus, GitMerge } from 'lucide-react';

const StateNode = ({ position, value, isSelected, onClick }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <Box ref={meshRef} args={[0.6, 0.6, 0.6]}>
        <meshStandardMaterial
          color={isSelected ? '#3b82f6' : '#8b5cf6'}
          emissive={isSelected ? '#3b82f6' : '#8b5cf6'}
          emissiveIntensity={isSelected ? 0.8 : 0.4}
        />
      </Box>
      <Text position={[0, -0.6, 0]} fontSize={0.2} color="white" anchorX="center">
        {value}
      </Text>
    </group>
  );
};

const JoinOperation = ({ start, end, visible }) => {
  if (!visible) return null;
  
  return (
    <Line
      points={[new THREE.Vector3(...start), new THREE.Vector3(...end)]}
      color="#10b981"
      lineWidth={3}
      transparent
      opacity={0.8}
    />
  );
};

export default function CRDTLatticeVisualizer3D() {
  const [states, setStates] = useState([
    { id: 1, value: '{}', pos: [0, -3, 0] },
    { id: 2, value: '{a}', pos: [-2, -1, 0] },
    { id: 3, value: '{b}', pos: [2, -1, 0] },
    { id: 4, value: '{a,b}', pos: [0, 1, 0] }
  ]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [showJoin, setShowJoin] = useState(false);

  const handleMerge = () => {
    if (selectedStates.length === 2) {
      setShowJoin(true);
      setTimeout(() => setShowJoin(false), 2000);
    }
  };

  const toggleSelect = (id) => {
    if (selectedStates.includes(id)) {
      setSelectedStates(selectedStates.filter(s => s !== id));
    } else if (selectedStates.length < 2) {
      setSelectedStates([...selectedStates, id]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-[400px] bg-black rounded-lg overflow-hidden">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          {/* Lattice structure */}
          {states.map((state) => (
            <StateNode
              key={state.id}
              position={state.pos}
              value={state.value}
              isSelected={selectedStates.includes(state.id)}
              onClick={() => toggleSelect(state.id)}
            />
          ))}

          {/* Join lines */}
          <Line points={[states[0].pos, states[1].pos]} color="#4b5563" lineWidth={1} opacity={0.3} />
          <Line points={[states[0].pos, states[2].pos]} color="#4b5563" lineWidth={1} opacity={0.3} />
          <Line points={[states[1].pos, states[3].pos]} color="#4b5563" lineWidth={1} opacity={0.3} />
          <Line points={[states[2].pos, states[3].pos]} color="#4b5563" lineWidth={1} opacity={0.3} />

          {/* Show merge operation */}
          {showJoin && selectedStates.length === 2 && (
            <JoinOperation
              start={states.find(s => s.id === selectedStates[0]).pos}
              end={states.find(s => s.id === selectedStates[1]).pos}
              visible={true}
            />
          )}

          <OrbitControls enableZoom />
        </Canvas>
      </div>

      <div className="bg-black/40 rounded-lg p-4 space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={handleMerge}
            disabled={selectedStates.length !== 2}
            className="bg-green-600 hover:bg-green-700"
          >
            <GitMerge className="w-4 h-4 mr-2" />
            Join (⊔) Selected States
          </Button>
        </div>

        <div className="text-xs text-gray-400 font-mono bg-black/60 rounded p-3">
          Join-Semilattice Properties:
          <br />1. Associativity: (x ⊔ y) ⊔ z = x ⊔ (y ⊔ z)
          <br />2. Commutativity: x ⊔ y = y ⊔ x
          <br />3. Idempotence: x ⊔ x = x
        </div>

        <p className="text-sm text-gray-300">
          CRDTs use lattice structures to guarantee eventual consistency. 
          Select two states and merge them - order doesn't matter!
        </p>
      </div>
    </div>
  );
}