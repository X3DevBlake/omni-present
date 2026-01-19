import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

function AgentLearner({ position, reward, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const scale = 0.5 + (reward / 100) * 0.5;
      meshRef.current.scale.setScalar(Math.max(0.3, scale));
    }
  });

  const color = reward > 0 ? '#00ff88' : '#ff4444';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.8, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
        />
      </Sphere>

      <Text
        position={[0, 1.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        Agent {index + 1}
      </Text>

      <Text
        position={[0, -1.5, 0]}
        fontSize={0.15}
        color={color}
        anchorX="center"
      >
        {reward.toFixed(1)}
      </Text>
    </group>
  );
}

function RewardCurve({ convergenceData }) {
  const points = React.useMemo(() => {
    if (!convergenceData || convergenceData.length === 0) return [];
    
    return convergenceData.map((point, i) => {
      const x = (i / convergenceData.length) * 15 - 7.5;
      const y = (point.average_reward / 50) * 3;
      const z = 0;
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

export default function RLTrainingVisualizer3D({ session }) {
  const convergenceData = session?.convergence_data || [];
  const numAgents = session?.participating_agents?.length || 4;

  const agentPositions = Array.from({ length: numAgents }, (_, i) => {
    const angle = (i / numAgents) * Math.PI * 2;
    const radius = 4;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
  });

  const latestReward = convergenceData[convergenceData.length - 1]?.average_reward || 0;

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 8, 18], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />

        {/* Central environment */}
        <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#00f5ff"
            emissive="#00f5ff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
            wireframe
          />
        </Sphere>

        {/* Learning agents */}
        {agentPositions.map((pos, i) => (
          <React.Fragment key={i}>
            <AgentLearner position={pos} reward={latestReward + (Math.random() - 0.5) * 20} index={i} />
            
            {/* Communication lines */}
            {agentPositions.slice(i + 1).map((pos2, j) => (
              <Line
                key={`${i}-${j}`}
                points={[pos, pos2]}
                color="#00f5ff"
                lineWidth={1}
                transparent
                opacity={0.2}
              />
            ))}
          </React.Fragment>
        ))}

        <RewardCurve convergenceData={convergenceData} />

        <OrbitControls enableZoom={true} />
        <gridHelper args={[20, 20, '#ffffff20', '#ffffff10']} />
      </Canvas>

      {!session && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">Start RL training to visualize</p>
        </div>
      )}
    </div>
  );
}