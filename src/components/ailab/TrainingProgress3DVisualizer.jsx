import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';

function TrainingScene({ trainingData }) {
  const curveRef = useRef();
  const lossRef = useRef();

  // Generate training curve
  const generateCurve = () => {
    const points = [];
    for (let i = 0; i < 100; i++) {
      const t = i / 100;
      const x = t * 20 - 10;
      const y = Math.exp(-t * 3) * 8 + Math.sin(t * 5) * 0.5;
      const z = Math.cos(t * 4) * 2;
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  };

  const generateLossCurve = () => {
    const points = [];
    for (let i = 0; i < 100; i++) {
      const t = i / 100;
      const x = t * 20 - 10;
      const y = Math.exp(-t * 4) * 5;
      const z = 0;
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  };

  useFrame(() => {
    if (curveRef.current) {
      curveRef.current.rotation.z += 0.002;
    }
  });

  const curvePoints = generateCurve();
  const lossPoints = generateLossCurve();

  return (
    <>
      <OrbitControls autoRotate autoRotateSpeed={1} />
      <ambientLight intensity={0.6} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />

      {/* Accuracy curve */}
      <group ref={curveRef}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={curvePoints.length}
              array={new Float32Array(curvePoints.flatMap((p) => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00ff88" linewidth={3} />
        </line>
      </group>

      {/* Loss curve */}
      <group position={[0, -8, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={lossPoints.length}
              array={new Float32Array(lossPoints.flatMap((p) => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ff0088" linewidth={3} />
        </line>
      </group>

      {/* Axes */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={6}
            array={new Float32Array([-10, 0, 0, 10, 0, 0, 0, -2, 0, 0, 10, 0, 0, 0, -2, 0, 0, 2])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </lineSegments>
    </>
  );
}

export default function TrainingProgress3DVisualizer({ trainingData }) {
  return (
    <Canvas camera={{ position: [0, 5, 15], fov: 45 }}>
      <TrainingScene trainingData={trainingData} />
    </Canvas>
  );
}