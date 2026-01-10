import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line, Float } from '@react-three/drei';
import * as THREE from 'three';

function DataPacket({ start, end, color, delay }) {
  const ref = useRef();
  const [progress, setProgress] = useState(0);

  useFrame((state) => {
    const t = (state.clock.elapsedTime + delay) % 2 / 2;
    setProgress(t);
    
    if (ref.current) {
      ref.current.position.lerpVectors(
        new THREE.Vector3(...start),
        new THREE.Vector3(...end),
        t
      );
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
    </mesh>
  );
}

function NetworkNode({ position, color, label, activity }) {
  return (
    <Float speed={2} rotationIntensity={0.3}>
      <group position={position}>
        <Sphere args={[0.15, 32, 32]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={activity || 0.5}
            metalness={0.8}
          />
        </Sphere>
        <Sphere args={[0.25, 16, 16]}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1}
            wireframe
          />
        </Sphere>
      </group>
    </Float>
  );
}

export default function AnimatedNetworkFlow({ nodes, connections, activityData }) {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
      
      {/* Network Nodes */}
      {nodes.map((node, i) => (
        <NetworkNode
          key={i}
          position={node.position}
          color={node.color}
          label={node.label}
          activity={activityData?.[node.id] || 0.5}
        />
      ))}

      {/* Data Flow Lines */}
      {connections.map((conn, i) => {
        const start = nodes.find(n => n.id === conn.from)?.position;
        const end = nodes.find(n => n.id === conn.to)?.position;
        
        if (!start || !end) return null;

        return (
          <group key={i}>
            <Line
              points={[start, end]}
              color={conn.color || '#00f5ff'}
              lineWidth={1}
              transparent
              opacity={0.3}
            />
            <DataPacket
              start={start}
              end={end}
              color={conn.color || '#00f5ff'}
              delay={i * 0.5}
            />
          </group>
        );
      })}

      {/* Background particles */}
      {[...Array(50)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ]}
        >
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#00f5ff" transparent opacity={0.3} />
        </mesh>
      ))}
    </Canvas>
  );
}