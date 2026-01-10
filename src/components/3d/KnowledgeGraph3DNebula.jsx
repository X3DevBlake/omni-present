import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';

function KnowledgeCluster({ position, nodes }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {nodes.map((node, i) => (
        <Sphere key={i} position={node.pos} args={[node.size, 12, 12]}>
          <meshStandardMaterial 
            color={node.color} 
            emissive={node.color} 
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
          />
        </Sphere>
      ))}
    </group>
  );
}

export default function KnowledgeGraph3DNebula() {
  const clusters = useMemo(() => [
    {
      position: [0, 0, 0],
      nodes: Array.from({ length: 15 }, () => ({
        pos: [
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3
        ],
        size: 0.1 + Math.random() * 0.15,
        color: '#00f5ff'
      }))
    },
    {
      position: [5, 2, -2],
      nodes: Array.from({ length: 10 }, () => ({
        pos: [
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ],
        size: 0.1 + Math.random() * 0.15,
        color: '#a855f7'
      }))
    },
    {
      position: [-4, -2, 3],
      nodes: Array.from({ length: 12 }, () => ({
        pos: [
          (Math.random() - 0.5) * 2.5,
          (Math.random() - 0.5) * 2.5,
          (Math.random() - 0.5) * 2.5
        ],
        size: 0.1 + Math.random() * 0.15,
        color: '#10b981'
      }))
    }
  ], []);

  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-96 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#00f5ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />

        {clusters.map((cluster, i) => (
          <React.Fragment key={i}>
            <KnowledgeCluster {...cluster} />
            {i < clusters.length - 1 && (
              <Line
                points={[cluster.position, clusters[i + 1].position]}
                color="#ffffff"
                lineWidth={2}
                opacity={0.3}
                transparent
              />
            )}
          </React.Fragment>
        ))}

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
        <fog attach="fog" args={['#000000', 10, 25]} />
      </Canvas>
    </div>
  );
}