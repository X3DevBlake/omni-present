import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function PredictionNode({ model, position, index }) {
  const nodeRef = useRef();

  useFrame((state) => {
    if (nodeRef.current) {
      nodeRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.2;
      nodeRef.current.rotation.y += 0.01;
    }
  });

  const confidence = model.last_prediction?.confidence || model.performance_metrics?.accuracy || 0.5;
  const color = new THREE.Color();
  color.setHSL(confidence * 0.3, 0.8, 0.5);

  return (
    <group position={position}>
      <Sphere ref={nodeRef} args={[0.3 + confidence * 0.2, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.3}
        />
      </Sphere>

      <Text
        position={[0, -0.6, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        {model.model_name?.substring(0, 20)}
      </Text>

      <Text
        position={[0, 0.6, 0]}
        fontSize={0.1}
        color="#22d3ee"
        anchorX="center"
      >
        {Math.round(confidence * 100)}% confident
      </Text>

      {/* Confidence Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.03, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function PredictionPath({ from, to }) {
  const points = React.useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...from),
      new THREE.Vector3((from[0] + to[0]) / 2, Math.max(from[1], to[1]) + 1, (from[2] + to[2]) / 2),
      new THREE.Vector3(...to)
    ]);
    return curve.getPoints(50);
  }, [from, to]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#8b5cf6" transparent opacity={0.3} />
    </line>
  );
}

export default function PredictiveIntelligence3D({ models }) {
  const positions = React.useMemo(() => {
    return models.map((_, idx) => {
      const angle = (idx / models.length) * Math.PI * 2;
      const radius = 4;
      return [
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2,
        Math.sin(angle) * radius
      ];
    });
  }, [models]);

  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />

      {/* Central AI Core */}
      <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.7}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      <Text position={[0, 1.5, 0]} fontSize={0.3} color="white" anchorX="center">
        Predictive Intelligence
      </Text>

      {/* Prediction Nodes */}
      {models.map((model, idx) => (
        <PredictionNode
          key={model.id}
          model={model}
          position={positions[idx]}
          index={idx}
        />
      ))}

      {/* Connection Paths */}
      {models.map((_, idx) => {
        if (idx < models.length - 1) {
          return (
            <PredictionPath
              key={`path-${idx}`}
              from={positions[idx]}
              to={positions[idx + 1]}
            />
          );
        }
        return null;
      })}

      <OrbitControls
        enableZoom={true}
        minDistance={6}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}