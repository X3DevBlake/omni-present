import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line } from '@react-three/drei';

function PositionNode({ position, index, totalLoss }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime + index) * 0.3;
      meshRef.current.rotation.y += 0.01;
    }
  });

  const lossPercentage = (position.loss / totalLoss) * 100;
  const height = Math.max(lossPercentage / 10, 0.5);
  const color = position.liquidation_risk > 70 ? '#ff0000' : 
                position.liquidation_risk > 40 ? '#ff8800' : '#ffaa00';

  return (
    <group position={[(index - 1) * 4, 0, 0]}>
      <Box ref={meshRef} args={[2, height, 2]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </Box>
      <Text
        position={[0, height / 2 + 1, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {position.protocol}
      </Text>
      <Text
        position={[0, -height / 2 - 1, 0]}
        fontSize={0.3}
        color="#ff4444"
        anchorX="center"
        anchorY="middle"
      >
        -${position.loss?.toFixed(0)}
      </Text>
    </group>
  );
}

export default function StressTestVisualizer3D({ stressTest }) {
  if (!stressTest || !stressTest.predicted_outcomes?.affected_positions) {
    return (
      <div className="h-96 flex items-center justify-center text-white/60">
        Run a stress test to see visualization
      </div>
    );
  }

  const { predicted_outcomes } = stressTest;
  const positions = predicted_outcomes.affected_positions || [];

  return (
    <div className="h-96 w-full">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, 10, 10]} intensity={0.8} color="#ff0000" />

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#1a1a2e" opacity={0.5} transparent />
        </mesh>

        {/* Position nodes */}
        {positions.map((position, index) => (
          <PositionNode 
            key={index} 
            position={position} 
            index={index}
            totalLoss={predicted_outcomes.total_loss}
          />
        ))}

        {/* Risk indicator sphere */}
        <Sphere 
          args={[0.8, 32, 32]} 
          position={[0, 8, 0]}
        >
          <meshStandardMaterial 
            color={predicted_outcomes.liquidation_risk > 70 ? '#ff0000' : '#ffaa00'} 
            emissive={predicted_outcomes.liquidation_risk > 70 ? '#ff0000' : '#ffaa00'}
            emissiveIntensity={0.8}
          />
        </Sphere>
        <Text
          position={[0, 10, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Risk: {predicted_outcomes.liquidation_risk?.toFixed(0)}%
        </Text>

        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}