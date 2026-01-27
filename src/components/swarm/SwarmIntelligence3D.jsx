import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function AgentBoid({ position, velocity }) {
  const mesh = useRef();
  useFrame(() => {
    if (mesh.current) {
      mesh.current.position.add(velocity);
      if (mesh.current.position.length() > 5) {
        mesh.current.position.set(0,0,0);
      }
    }
  });
  return (
    <Sphere ref={mesh} position={position} args={[0.05, 8, 8]}>
      <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={1} />
    </Sphere>
  );
}

export default function SwarmIntelligence3D({ active }) {
  const boids = useMemo(() => {
    return new Array(100).fill(0).map(() => ({
      position: new THREE.Vector3((Math.random()-0.5)*10, (Math.random()-0.5)*10, (Math.random()-0.5)*10),
      velocity: new THREE.Vector3((Math.random()-0.5)*0.05, (Math.random()-0.5)*0.05, (Math.random()-0.5)*0.05)
    }));
  }, []);

  return (
    <div className="w-full h-full bg-black/80">
      <Canvas camera={{ position: [0, 0, 8] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        {boids.map((b, i) => <AgentBoid key={i} position={b.position} velocity={b.velocity} />)}
        <OrbitControls autoRotate autoRotateSpeed={active ? 2 : 0.5} />
      </Canvas>
    </div>
  );
}