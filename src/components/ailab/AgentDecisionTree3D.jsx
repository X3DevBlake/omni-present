import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

function DecisionTreeScene({ agent }) {
  const treeRef = useRef([]);

  useEffect(() => {
    // Create decision tree nodes
    const createNode = (x, y, z, label, decision = false) => {
      const geometry = new THREE.SphereGeometry(0.4, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: decision ? '#ff6b6b' : '#4ecdc4',
        emissive: decision ? '#ff6b6b' : '#4ecdc4',
        emissiveIntensity: 0.3,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x, y, z);
      sphere.userData = { label, decision };
      return sphere;
    };

    const root = createNode(0, 10, 0, 'Agent Decision', true);
    const left1 = createNode(-5, 5, 0, 'Market Check');
    const right1 = createNode(5, 5, 0, 'Risk Level');
    const left2 = createNode(-8, 0, 0, 'Execute Buy');
    const right2 = createNode(-2, 0, 0, 'Hold Position');
    const left3 = createNode(2, 0, 0, 'Increase Limit');
    const right3 = createNode(8, 0, 0, 'Reduce Risk');

    const nodes = [root, left1, right1, left2, right2, left3, right3];
    treeRef.current = nodes;
  }, []);

  useFrame(() => {
    treeRef.current.forEach((node) => {
      node.rotation.x += 0.002;
      node.rotation.y += 0.001;
    });
  });

  return (
    <>
      <OrbitControls autoRotate autoRotateSpeed={1} />
      <ambientLight intensity={0.6} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />

      {treeRef.current.map((node, idx) => (
        <primitive key={idx} object={node} />
      ))}

      {/* Connection lines */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={12}
            array={new Float32Array([
              0, 10, 0, -5, 5, 0, // Root to left
              0, 10, 0, 5, 5, 0, // Root to right
              -5, 5, 0, -8, 0, 0, // Left1 to left2
              -5, 5, 0, -2, 0, 0, // Left1 to right2
              5, 5, 0, 2, 0, 0, // Right1 to left3
              5, 5, 0, 8, 0, 0, // Right1 to right3
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00ff88" transparent opacity={0.5} />
      </line>
    </>
  );
}

export default function AgentDecisionTree3D({ agent }) {
  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 45 }}>
      <DecisionTreeScene agent={agent} />
    </Canvas>
  );
}