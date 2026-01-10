import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';

export default function HyperparameterOptimization3D() {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 50; i++) {
      pts.push({
        position: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        ],
        performance: Math.random(),
        size: 0.1 + Math.random() * 0.2
      });
    }
    return pts.sort((a, b) => a.performance - b.performance);
  }, []);

  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-96 overflow-hidden">
      <Canvas camera={{ position: [8, 8, 8], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {points.map((point, i) => {
          const color = point.performance > 0.7 ? '#10b981' : 
                       point.performance > 0.4 ? '#f59e0b' : '#ef4444';
          return (
            <Sphere key={i} position={point.position} args={[point.size, 16, 16]}>
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={point.performance}
              />
            </Sphere>
          );
        })}

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
        <fog attach="fog" args={['#000000', 10, 20]} />
      </Canvas>
    </div>
  );
}