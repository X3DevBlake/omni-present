import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

function DataFlowParticles({ convergenceData }) {
  const particlesRef = useRef();
  const particleCount = 200;

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
      particlesRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00f5ff"
        transparent
        opacity={0.6}
      />
    </points>
  );
}

function ConvergencePath({ convergenceData }) {
  const points = useMemo(() => {
    if (!convergenceData || convergenceData.length === 0) return [];
    
    return convergenceData.map((point, i) => {
      const x = (i / convergenceData.length) * 10 - 5;
      const y = (point.accuracy / 100) * 5 - 2.5;
      const z = -point.loss * 2;
      return new THREE.Vector3(x, y, z);
    });
  }, [convergenceData]);

  if (points.length === 0) return null;

  return (
    <Line
      points={points}
      color="#a855f7"
      lineWidth={3}
    />
  );
}

function ModelBrain({ accuracy }) {
  const brainRef = useRef();
  
  useFrame((state) => {
    if (brainRef.current) {
      brainRef.current.rotation.y += 0.005;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      brainRef.current.scale.setScalar(pulse);
    }
  });

  const color = accuracy > 90 ? '#00ff88' : accuracy > 70 ? '#00f5ff' : '#ff8800';

  return (
    <Sphere ref={brainRef} args={[1.5, 64, 64]} position={[0, 0, 0]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
        wireframe
      />
    </Sphere>
  );
}

export default function AgentTrainingStudio3D({ sessionData }) {
  const convergenceData = sessionData?.convergence_data || [];
  const currentAccuracy = sessionData?.current_accuracy || 0;

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 3, 12], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />

        <ModelBrain accuracy={currentAccuracy} />
        <DataFlowParticles convergenceData={convergenceData} />
        <ConvergencePath convergenceData={convergenceData} />

        {sessionData && (
          <>
            <Text
              position={[0, 3, 0]}
              fontSize={0.4}
              color="white"
              anchorX="center"
            >
              Accuracy: {currentAccuracy.toFixed(1)}%
            </Text>

            <Text
              position={[0, -3, 0]}
              fontSize={0.3}
              color="#a855f7"
              anchorX="center"
            >
              Epoch {sessionData.current_epoch}/{sessionData.total_epochs}
            </Text>
          </>
        )}

        <OrbitControls enableZoom={true} />
        <gridHelper args={[20, 20, '#ffffff20', '#ffffff10']} />
      </Canvas>

      {!sessionData && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">Start training to visualize progress</p>
        </div>
      )}
    </div>
  );
}