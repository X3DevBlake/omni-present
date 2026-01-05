import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export class EnvironmentManipulator {
  constructor() {
    this.modifications = [];
    this.terrainData = new Map();
    this.structures = [];
    this.environmentParameters = {
      waterFlow: { rate: 1.0, direction: [0, 0, 1] },
      lighting: { intensity: 1.0, color: '#ffffff' }
    };
  }

  digTerrain(position, depth, radius) {
    const modification = {
      type: 'dig',
      position,
      depth,
      radius,
      timestamp: Date.now(),
      id: `dig_${Date.now()}`
    };
    
    this.modifications.push(modification);
    this.updateTerrainData(position, -depth);
    return modification;
  }

  levelTerrain(position, targetHeight, area) {
    const modification = {
      type: 'level',
      position,
      targetHeight,
      area,
      timestamp: Date.now(),
      id: `level_${Date.now()}`
    };
    
    this.modifications.push(modification);
    this.updateTerrainData(position, targetHeight);
    return modification;
  }

  buildStructure(position, structureType, materials) {
    const structure = {
      type: structureType,
      position,
      materials,
      health: 100,
      builtAt: Date.now(),
      id: `structure_${Date.now()}`
    };
    
    this.structures.push(structure);
    return structure;
  }

  modifyWaterFlow(direction, rate) {
    this.environmentParameters.waterFlow = {
      direction,
      rate,
      modified: Date.now()
    };
  }

  adjustLighting(intensity, color) {
    this.environmentParameters.lighting = {
      intensity,
      color,
      modified: Date.now()
    };
  }

  updateTerrainData(position, heightChange) {
    const key = `${Math.floor(position[0])}_${Math.floor(position[2])}`;
    const current = this.terrainData.get(key) || 0;
    this.terrainData.set(key, current + heightChange);
  }

  getTerrainHeight(position) {
    const key = `${Math.floor(position[0])}_${Math.floor(position[2])}`;
    return this.terrainData.get(key) || 0;
  }

  isPassable(position) {
    const height = this.getTerrainHeight(position);
    return Math.abs(height) < 2; // Too steep or deep is not passable
  }

  getModifications() {
    return this.modifications;
  }

  getStructures() {
    return this.structures;
  }
}

export function TerrainModificationVisual({ modification }) {
  const meshRef = useRef();
  const [opacity, setOpacity] = useState(0.8);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      setOpacity(prev => Math.max(0.3, prev - 0.001));
    }
  });

  if (modification.type === 'dig') {
    return (
      <mesh ref={meshRef} position={modification.position}>
        <cylinderGeometry args={[modification.radius, modification.radius * 0.8, modification.depth, 16]} />
        <meshStandardMaterial color="#8b4513" transparent opacity={opacity} />
      </mesh>
    );
  }

  if (modification.type === 'level') {
    return (
      <mesh ref={meshRef} position={modification.position}>
        <boxGeometry args={[modification.area, 0.1, modification.area]} />
        <meshStandardMaterial color="#a0a0a0" transparent opacity={opacity} wireframe />
      </mesh>
    );
  }

  return null;
}

export function StructureVisual({ structure }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current && structure.health < 100) {
      meshRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.05;
    }
  });

  const getStructureGeometry = () => {
    switch (structure.type) {
      case 'bridge':
        return (
          <group>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[4, 0.2, 1]} />
              <meshStandardMaterial color="#8b7355" />
            </mesh>
            <mesh position={[-1.8, -0.5, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
            <mesh position={[1.8, -0.5, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
          </group>
        );
      case 'shelter':
        return (
          <group>
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[2, 1, 2]} />
              <meshStandardMaterial color="#d2b48c" />
            </mesh>
            <mesh position={[0, 1.3, 0]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[1.5, 0.8, 4]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
          </group>
        );
      case 'wall':
        return (
          <mesh>
            <boxGeometry args={[3, 2, 0.3]} />
            <meshStandardMaterial color="#808080" />
          </mesh>
        );
      default:
        return (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#a0a0a0" />
          </mesh>
        );
    }
  };

  return (
    <group ref={meshRef} position={structure.position}>
      {getStructureGeometry()}
      {structure.health < 100 && (
        <mesh position={[0, 2, 0]}>
          <planeGeometry args={[1, 0.1]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      )}
    </group>
  );
}

export function WaterFlowVisual({ waterFlow }) {
  const particlesRef = useRef();
  const particleCount = 50;

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += waterFlow.direction[0] * 0.01 * waterFlow.rate;
        positions[i * 3 + 1] += waterFlow.direction[1] * 0.01 * waterFlow.rate;
        positions[i * 3 + 2] += waterFlow.direction[2] * 0.01 * waterFlow.rate;

        if (Math.abs(positions[i * 3]) > 5) positions[i * 3] = 0;
        if (Math.abs(positions[i * 3 + 2]) > 5) positions[i * 3 + 2] = 0;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const particles = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particles[i * 3] = (Math.random() - 0.5) * 10;
    particles[i * 3 + 1] = Math.random() * 2;
    particles[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#4da6ff" transparent opacity={0.6} />
    </points>
  );
}