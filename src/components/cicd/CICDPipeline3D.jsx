import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line, Html } from '@react-three/drei';

function PipelineStage({ position, stage, index, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const statusColors = {
    pending: '#6b7280',
    running: '#fbbf24',
    success: '#10b981',
    failed: '#ef4444'
  };

  const color = statusColors[stage.status] || '#6b7280';

  return (
    <group position={position}>
      <Box 
        ref={meshRef} 
        args={[1.2, 1.2, 0.3]}
        onClick={() => onClick(stage)}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.5}
        />
      </Box>
      <Text position={[0, 1, 0]} fontSize={0.25} color="white" anchorX="center">
        {stage.stage_name}
      </Text>
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black/90 text-white p-3 rounded-lg text-xs backdrop-blur-md border border-white/20">
            <div className="font-bold mb-1">{stage.stage_name}</div>
            <div className="text-white/80">Action: {stage.action}</div>
            <div className="text-white/80">Status: {stage.status}</div>
            <div className="text-white/60">Duration: {stage.duration_seconds}s</div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function CICDPipeline3D({ pipeline, onStageClick }) {
  const stages = pipeline?.pipeline_stages || [];

  const stageNodes = stages.map((stage, i) => ({
    position: [i * 3 - (stages.length - 1) * 1.5, 0, 0],
    stage,
    index: i
  }));

  return (
    <Canvas camera={{ position: [0, 4, 12], fov: 60 }} style={{ height: '600px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      <Text position={[0, 3.5, 0]} fontSize={0.5} color="white" anchorX="center">
        CI/CD Pipeline
      </Text>
      <Text position={[0, 2.8, 0]} fontSize={0.3} color="#60a5fa" anchorX="center">
        {pipeline?.pipeline_name || 'Automated Deployment'}
      </Text>

      {stageNodes.map((node, i) => (
        <PipelineStage key={i} {...node} onClick={onStageClick || (() => {})} />
      ))}

      {stageNodes.length > 1 && (
        <Line
          points={stageNodes.map(n => n.position)}
          color="#60a5fa"
          lineWidth={2}
          transparent
          opacity={0.4}
        />
      )}

      <Text position={[0, -2.5, 0]} fontSize={0.3} color="#10b981" anchorX="center">
        Environment: {pipeline?.environment || 'staging'}
      </Text>

      <OrbitControls enableZoom={true} minDistance={8} maxDistance={20} />
    </Canvas>
  );
}