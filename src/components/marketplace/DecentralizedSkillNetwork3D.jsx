import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Points, PointMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';

function NodeNetwork({ count = 50 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10;
      p[i * 3 + 1] = (Math.random() - 0.5) * 10;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, [count]);

  const lines = useMemo(() => {
      // Connect some random nodes
      const l = [];
      for(let i=0; i<30; i++) {
          const startIdx = Math.floor(Math.random() * count);
          const endIdx = Math.floor(Math.random() * count);
          l.push(
              new THREE.Vector3(points[startIdx*3], points[startIdx*3+1], points[startIdx*3+2]),
              new THREE.Vector3(points[endIdx*3], points[endIdx*3+1], points[endIdx*3+2])
          );
      }
      return l;
  }, [points, count]);

  useFrame((state) => {
      // Maybe animate rotation or pulsing
  });

  return (
    <group>
      <Points positions={points} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00ffff"
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
      <Line points={lines} color="purple" opacity={0.2} transparent lineWidth={1} />
    </group>
  );
}

export default function DecentralizedSkillNetwork3D() {
  return (
    <div className="w-full h-[400px] bg-black/80 rounded-xl overflow-hidden border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.1)]">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <NodeNetwork />
        <OrbitControls autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      <div className="absolute bottom-4 left-4 p-2 bg-black/50 backdrop-blur rounded border border-white/10">
          <div className="text-cyan-400 font-bold text-xs">P2P SKILL MESH</div>
          <div className="text-white/60 text-[10px]">Nodes: 1,243 | Latency: 12ms</div>
      </div>
    </div>
  );
}