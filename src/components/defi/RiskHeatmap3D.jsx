import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text } from '@react-three/drei';

function RiskCube({ assessment, position }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const riskScore = assessment.risk_score || 0;
  const color = riskScore > 70 ? '#ff4444' : riskScore > 40 ? '#ff8800' : '#00ff88';
  const height = (riskScore / 100) * 3;

  return (
    <group position={position}>
      <Box ref={meshRef} args={[0.8, height, 0.8]} position={[0, height / 2, 0]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </Box>

      <Text
        position={[0, height + 1, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {assessment.protocol_name}
      </Text>

      <Text
        position={[0, -0.5, 0]}
        fontSize={0.12}
        color={color}
        anchorX="center"
      >
        {riskScore.toFixed(0)}
      </Text>
    </group>
  );
}

export default function RiskHeatmap3D({ assessments = [] }) {
  const gridSize = Math.ceil(Math.sqrt(assessments.length));
  
  const positions = assessments.map((_, index) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    return [
      (col - gridSize / 2) * 2,
      0,
      (row - gridSize / 2) * 2,
    ];
  });

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, 10, -10]} intensity={0.8} color="#ff4444" />

        {assessments.map((assessment, index) => (
          <RiskCube
            key={assessment.id}
            assessment={assessment}
            position={positions[index]}
          />
        ))}

        <OrbitControls enableZoom={true} />
        <gridHelper args={[20, 20, '#ffffff20', '#ffffff10']} />
      </Canvas>

      {assessments.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">No risk assessments to visualize</p>
        </div>
      )}
    </div>
  );
}