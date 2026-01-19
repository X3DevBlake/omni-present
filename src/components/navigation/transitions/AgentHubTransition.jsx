import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail } from '@react-three/drei';
import * as THREE from 'three';

export default function AgentHubTransition() {
  const groupRef = useRef();
  const particlesRef = useRef([]);

  // Create network of agent nodes
  const nodes = React.useMemo(() => {
    const temp = [];
    for (let i = 0; i < 30; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        ],
        velocity: [
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        ]
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.z += 0.5; // Warp speed effect
    }

    particlesRef.current.forEach((particle, i) => {
      if (particle) {
        particle.position.x += nodes[i].velocity[0];
        particle.position.y += nodes[i].velocity[1];
        particle.position.z += nodes[i].velocity[2];
      }
    });
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#a855f7" />

      {/* Agent Network Nodes */}
      {nodes.map((node, i) => (
        <group key={i} position={node.position}>
          <Trail
            width={0.5}
            length={10}
            color="#a855f7"
            attenuation={(t) => t * t}
          >
            <Sphere
              ref={(el) => (particlesRef.current[i] = el)}
              args={[0.2, 16, 16]}
            >
              <meshStandardMaterial
                color="#a855f7"
                emissive="#a855f7"
                emissiveIntensity={1}
              />
            </Sphere>
          </Trail>
        </group>
      ))}

      {/* Connection Lines */}
      {nodes.map((node, i) => {
        if (i === 0) return null;
        const prevNode = nodes[i - 1];
        const curve = new THREE.LineCurve3(
          new THREE.Vector3(...node.position),
          new THREE.Vector3(...prevNode.position)
        );
        
        return (
          <mesh key={`line-${i}`}>
            <tubeGeometry args={[curve, 8, 0.02, 8, false]} />
            <meshBasicMaterial color="#a855f7" opacity={0.4} transparent />
          </mesh>
        );
      })}
    </group>
  );
}