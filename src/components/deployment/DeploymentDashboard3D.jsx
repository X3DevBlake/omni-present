import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Line } from '@react-three/drei';
import * as THREE from 'three';

function PlatformNode({ position, platform, status }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const statusColors = {
    active: '#10b981',
    deploying: '#fbbf24',
    failed: '#ef4444',
    stopped: '#6b7280'
  };

  return (
    <Box ref={meshRef} args={[1.5, 1.5, 1.5]} position={position}>
      <meshStandardMaterial 
        color={statusColors[status]}
        emissive={statusColors[status]}
        emissiveIntensity={0.6}
      />
    </Box>
  );
}

export default function DeploymentDashboard3D({ deployments }) {
  const platforms = ['AWS_SageMaker', 'Google_AI_Platform', 'Azure_ML', 'Docker'];
  
  const nodes = platforms.map((platform, i) => {
    const angle = (i / platforms.length) * Math.PI * 2;
    const deployment = deployments?.find(d => d.target_platform === platform);
    return {
      position: [Math.cos(angle) * 5, 0, Math.sin(angle) * 5],
      platform,
      status: deployment?.deployment_status || 'stopped'
    };
  });

  return (
    <Canvas camera={{ position: [0, 8, 15], fov: 60 }} style={{ height: '600px' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.8} color="#10b981" />

      <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.7}
        />
      </Sphere>

      <Text position={[0, 3, 0]} fontSize={0.6} color="white" anchorX="center">
        Model Deployments
      </Text>

      {nodes.map((node, i) => (
        <React.Fragment key={i}>
          <PlatformNode {...node} />
          <Text 
            position={[node.position[0], node.position[1] + 1.5, node.position[2]]} 
            fontSize={0.3} 
            color="white" 
            anchorX="center"
          >
            {node.platform.split('_')[0]}
          </Text>
          <Line
            points={[[0, 0, 0], node.position]}
            color="#60a5fa"
            lineWidth={2}
            transparent
            opacity={0.4}
          />
        </React.Fragment>
      ))}

      <Text position={[0, -3, 0]} fontSize={0.35} color="#10b981" anchorX="center">
        {deployments?.filter(d => d.deployment_status === 'active').length || 0} Active
      </Text>

      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.3} minDistance={10} maxDistance={25} />
    </Canvas>
  );
}