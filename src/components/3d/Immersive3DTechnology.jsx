import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, MeshDistortMaterial, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';

function TechSphere({ position, color, scale }) {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <Sphere args={[1, 64, 64]} scale={scale} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </Sphere>
    </Float>
  );
}

function NetworkLines() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const nodes = [
    [2, 0, 0],
    [-2, 0, 0],
    [0, 2, 0],
    [0, -2, 0],
    [0, 0, 2],
    [0, 0, -2]
  ];

  return (
    <group ref={groupRef}>
      {nodes.map((pos, i) => (
        <React.Fragment key={i}>
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, ...pos])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00f5ff" opacity={0.3} transparent />
          </line>
          <mesh position={pos}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={1} />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
}

export default function Immersive3DTechnology() {
  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden mb-12">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <color attach="background" args={['#0a0a0f']} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
        <pointLight position={[-10, -10, 10]} intensity={0.5} color="#a855f7" />
        <pointLight position={[0, 0, -10]} intensity={0.5} color="#ec4899" />

        <TechSphere position={[0, 0, 0]} color="#00f5ff" scale={1.2} />
        <TechSphere position={[3, 1, -2]} color="#a855f7" scale={0.6} />
        <TechSphere position={[-3, -1, -2]} color="#ec4899" scale={0.8} />

        <NetworkLines />

        <Environment preset="night" />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
      </Canvas>

      <div className="relative -mt-[500px] pointer-events-none flex items-center justify-center h-[500px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center max-w-3xl px-6"
        >
          <h2 className="text-5xl font-bold text-white mb-4 drop-shadow-[0_0_20px_rgba(0,245,255,0.5)]">
            Cutting-Edge <span className="text-cyan-400">Technology</span>
          </h2>
          <p className="text-white/80 text-lg">
            Powered by advanced neural networks, quantum-inspired algorithms, and decentralized infrastructure
          </p>
        </motion.div>
      </div>
    </div>
  );
}