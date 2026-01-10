import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function DataPacket({ path, speed, color }) {
  const meshRef = useRef();
  const progress = useRef(0);

  useFrame((state, delta) => {
    if (meshRef.current) {
      progress.current += delta * speed;
      if (progress.current > 1) progress.current = 0;
      
      const point = new THREE.Vector3();
      path.getPointAt(progress.current, point);
      meshRef.current.position.copy(point);
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.1, 8, 8]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
    </Sphere>
  );
}

export default function DataFlowCyberspace3D() {
  const paths = useMemo(() => {
    const curves = [];
    for (let i = 0; i < 5; i++) {
      const points = [];
      for (let j = 0; j < 20; j++) {
        points.push(new THREE.Vector3(
          Math.sin(j * 0.3 + i) * 3,
          j * 0.3 - 3,
          Math.cos(j * 0.3 + i) * 3
        ));
      }
      curves.push(new THREE.CatmullRomCurve3(points));
    }
    return curves;
  }, []);

  const colors = ['#00f5ff', '#a855f7', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="bg-black/40 rounded-xl border border-white/10 h-96 overflow-hidden">
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />

        {paths.map((path, i) => (
          <React.Fragment key={i}>
            <Line
              points={path.points}
              color={colors[i]}
              lineWidth={2}
              opacity={0.3}
              transparent
            />
            {[...Array(3)].map((_, j) => (
              <DataPacket
                key={`${i}-${j}`}
                path={path}
                speed={0.2 + Math.random() * 0.3}
                color={colors[i]}
              />
            ))}
          </React.Fragment>
        ))}

        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
        <fog attach="fog" args={['#000000', 5, 20]} />
      </Canvas>
    </div>
  );
}