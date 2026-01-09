import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box } from '@react-three/drei';
import { motion } from 'framer-motion';

function Agent3D({ position, color, name, isRunning }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current && isRunning) {
      meshRef.current.position.x += Math.sin(state.clock.elapsedTime) * 0.01;
      meshRef.current.position.z += Math.cos(state.clock.elapsedTime) * 0.01;
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <Sphere args={[0.3, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Sphere>
    </group>
  );
}

function EnvironmentObjects({ scenario }) {
  const objects = {
    open_world: [],
    resource_gathering: Array(10).fill().map((_, i) => ({
      type: 'resource',
      position: [Math.random() * 10 - 5, 0.5, Math.random() * 10 - 5]
    })),
    collaborative: Array(5).fill().map((_, i) => ({
      type: 'task',
      position: [Math.random() * 8 - 4, 0.5, Math.random() * 8 - 4]
    })),
    adversarial: []
  };

  const currentObjects = objects[scenario] || [];

  return (
    <>
      {currentObjects.map((obj, i) => (
        <Box key={i} args={[0.5, 0.5, 0.5]} position={obj.position}>
          <meshStandardMaterial color={obj.type === 'resource' ? '#10b981' : '#f59e0b'} />
        </Box>
      ))}
    </>
  );
}

export default function SimulationPhysicsEngine({ agents, isRunning, scenario }) {
  const agentColors = ['#00f5ff', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      <h3 className="text-white font-bold text-xl mb-4">Physics Simulation</h3>
      <div className="h-[500px] bg-black/20 rounded-xl overflow-hidden">
        <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          {/* Ground Plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#1a1a2e" wireframe />
          </mesh>

          {/* Agent Representations */}
          {agents.map((agent, i) => (
            <Agent3D
              key={agent.id}
              position={[
                Math.cos((i / agents.length) * Math.PI * 2) * 3,
                0.5,
                Math.sin((i / agents.length) * Math.PI * 2) * 3
              ]}
              color={agentColors[i % agentColors.length]}
              name={agent.name}
              isRunning={isRunning}
            />
          ))}

          {/* Environment Objects */}
          <EnvironmentObjects scenario={scenario} />

          <OrbitControls enableZoom={true} enablePan={true} />
        </Canvas>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-white/60">Physics: Enabled</span>
        <span className="text-green-400">Real-time Rendering</span>
      </div>
    </motion.div>
  );
}