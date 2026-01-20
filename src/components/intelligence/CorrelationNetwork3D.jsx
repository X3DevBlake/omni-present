import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

function EntityNode({ entityType, position }) {
  const nodeRef = useRef();

  useFrame(() => {
    if (nodeRef.current) {
      nodeRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={nodeRef} args={[0.4, 32, 32]}>
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.3}
        />
      </Sphere>

      <Text
        position={[0, -0.7, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        {entityType?.substring(0, 10)}
      </Text>
    </group>
  );
}

function CorrelationLine({ from, to, strength }) {
  const color = strength > 0 ? '#10b981' : '#ef4444';
  const opacity = Math.abs(strength);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([...from, ...to])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity * 0.7}
        linewidth={Math.abs(strength) * 5}
      />
    </line>
  );
}

export default function CorrelationNetwork3D({ correlations }) {
  const entityTypes = React.useMemo(() => {
    const types = new Set();
    correlations.forEach(c => {
      types.add(c.source_entity_type);
      types.add(c.target_entity_type);
    });
    return Array.from(types).slice(0, 12);
  }, [correlations]);

  const positions = React.useMemo(() => {
    return entityTypes.map((_, idx) => {
      const angle = (idx / entityTypes.length) * Math.PI * 2;
      const radius = 3;
      return [
        Math.cos(angle) * radius,
        Math.sin(angle * 2) * 0.5,
        Math.sin(angle) * radius
      ];
    });
  }, [entityTypes]);

  return (
    <Canvas camera={{ position: [0, 4, 10], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />

      <Text position={[0, 4.5, 0]} fontSize={0.3} color="white" anchorX="center">
        Correlation Network
      </Text>

      {entityTypes.map((type, idx) => (
        <EntityNode
          key={type}
          entityType={type}
          position={positions[idx]}
        />
      ))}

      {correlations.slice(0, 30).map((corr, idx) => {
        const sourceIdx = entityTypes.indexOf(corr.source_entity_type);
        const targetIdx = entityTypes.indexOf(corr.target_entity_type);
        if (sourceIdx >= 0 && targetIdx >= 0) {
          return (
            <CorrelationLine
              key={idx}
              from={positions[sourceIdx]}
              to={positions[targetIdx]}
              strength={corr.correlation_strength}
            />
          );
        }
        return null;
      })}

      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={18}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}