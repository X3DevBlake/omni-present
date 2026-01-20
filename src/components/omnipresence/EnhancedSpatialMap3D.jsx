import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function AgentNode({ agent, position }) {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.15;
    }
  });

  return (
    <group ref={ref} position={position}>
      <Sphere args={[0.25, 32, 32]}>
        <meshStandardMaterial
          color={agent.color || '#00f5ff'}
          emissive={agent.color || '#00f5ff'}
          emissiveIntensity={0.7}
        />
      </Sphere>
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {agent.name?.slice(0, 12)}
      </Text>
    </group>
  );
}

function SmartDeviceNode({ device, position }) {
  return (
    <group position={position}>
      <Box args={[0.3, 0.3, 0.3]}>
        <meshStandardMaterial
          color={device.color || '#a855f7'}
          emissive={device.color || '#a855f7'}
          emissiveIntensity={0.5}
        />
      </Box>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.1}
        color="white"
        anchorX="center"
      >
        {device.type}
      </Text>
    </group>
  );
}

function CommunicationLink({ from, to, label }) {
  const points = [
    new THREE.Vector3(...from),
    new THREE.Vector3(...to)
  ];

  return (
    <group>
      <Line
        points={points}
        color="#00ff88"
        lineWidth={2}
        transparent
        opacity={0.6}
      />
      <Text
        position={[
          (from[0] + to[0]) / 2,
          (from[1] + to[1]) / 2 + 0.3,
          (from[2] + to[2]) / 2
        ]}
        fontSize={0.1}
        color="#00ff88"
        anchorX="center"
      >
        {label}
      </Text>
    </group>
  );
}

function Room({ dimensions = { width: 10, height: 3, depth: 8 } }) {
  return (
    <group>
      {/* Floor */}
      <Box args={[dimensions.width, 0.1, dimensions.depth]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#1a1a2e" />
      </Box>
      
      {/* Walls */}
      <Box args={[dimensions.width, dimensions.height, 0.2]} position={[0, dimensions.height/2, -dimensions.depth/2]}>
        <meshStandardMaterial color="#16213e" />
      </Box>
      <Box args={[dimensions.width, dimensions.height, 0.2]} position={[0, dimensions.height/2, dimensions.depth/2]}>
        <meshStandardMaterial color="#16213e" />
      </Box>
      <Box args={[0.2, dimensions.height, dimensions.depth]} position={[-dimensions.width/2, dimensions.height/2, 0]}>
        <meshStandardMaterial color="#16213e" />
      </Box>
      <Box args={[0.2, dimensions.height, dimensions.depth]} position={[dimensions.width/2, dimensions.height/2, 0]}>
        <meshStandardMaterial color="#16213e" />
      </Box>

      {/* Grid */}
      <Grid args={[dimensions.width, dimensions.depth]} position={[0, 0.05, 0]} />
    </group>
  );
}

export default function EnhancedSpatialMap3D({ agents, devices, interactions }) {
  const agentsData = agents || [];
  const devicesData = devices || [];
  const activeInteractions = interactions || [];

  const agentColors = ['#00f5ff', '#a855f7', '#f59e0b', '#10b981', '#ec4899'];
  const deviceColors = ['#a855f7', '#f59e0b', '#10b981', '#ec4899'];

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [8, 4, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, 5, -5]} intensity={0.7} color="#a855f7" />
        <pointLight position={[0, 8, 0]} intensity={0.5} color="#00ff88" />

        {/* Title */}
        <Text
          position={[0, 3.5, 0]}
          fontSize={0.4}
          color="white"
          anchorX="center"
        >
          Omni-Present Spatial Map
        </Text>

        {/* Room Environment */}
        <Room dimensions={{ width: 12, height: 3, depth: 10 }} />

        {/* Agents */}
        {agentsData.map((agent, idx) => (
          <AgentNode
            key={agent.id}
            agent={{ ...agent, color: agentColors[idx % agentColors.length] }}
            position={[
              (idx - agentsData.length / 2) * 2,
              1.5,
              Math.sin(idx) * 3
            ]}
          />
        ))}

        {/* Smart Devices */}
        {devicesData.map((device, idx) => (
          <SmartDeviceNode
            key={device.id}
            device={{ ...device, color: deviceColors[idx % deviceColors.length] }}
            position={[
              Math.cos((idx / devicesData.length) * Math.PI * 2) * 5,
              0.5,
              Math.sin((idx / devicesData.length) * Math.PI * 2) * 5
            ]}
          />
        ))}

        {/* Communication Links */}
        {activeInteractions.slice(0, 5).map((interaction, idx) => (
          <CommunicationLink
            key={idx}
            from={[0, 1.5, 0]}
            to={[
              Math.cos((idx / 5) * Math.PI * 2) * 4,
              0.5,
              Math.sin((idx / 5) * Math.PI * 2) * 4
            ]}
            label={`Task${idx + 1}`}
          />
        ))}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}