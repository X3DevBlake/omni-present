import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';

export function AgentSpawnEffect({ onComplete }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        className="relative"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.5, 1] }}
        transition={{ duration: 1.5 }}
      >
        <motion.div
          className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          animate={{
            boxShadow: [
              '0 0 20px #8b5cf6',
              '0 0 60px #8b5cf6',
              '0 0 20px #8b5cf6'
            ]
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              marginLeft: '-4px',
              marginTop: '-4px'
            }}
            animate={{
              x: Math.cos((i / 12) * Math.PI * 2) * 100,
              y: Math.sin((i / 12) * Math.PI * 2) * 100,
              opacity: [1, 0]
            }}
            transition={{ duration: 1, delay: i * 0.05 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

export function DataFlowAnimation({ from, to, color = '#00ffff' }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <motion.path
        d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${from.y - 50} ${to.x} ${to.y}`}
        stroke={color}
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  );
}

export function NeuralPulseEffect() {
  return (
    <div className="relative inline-block">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-cyan-400"
          animate={{
            scale: [1, 2, 2],
            opacity: [0.8, 0, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.6
          }}
        />
      ))}
      <div className="w-4 h-4 bg-cyan-400 rounded-full" />
    </div>
  );
}

export function ThreatAlertAnimation() {
  return (
    <motion.div
      className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4"
      animate={{
        borderColor: ['#ef4444', '#fbbf24', '#ef4444'],
        boxShadow: [
          '0 0 10px rgba(239, 68, 68, 0.5)',
          '0 0 30px rgba(239, 68, 68, 0.8)',
          '0 0 10px rgba(239, 68, 68, 0.5)'
        ]
      }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      <motion.div
        animate={{ x: [-2, 2, -2] }}
        transition={{ duration: 0.3, repeat: Infinity }}
      >
        ⚠️ Security Threat Detected
      </motion.div>
    </motion.div>
  );
}

function ParticleField3D() {
  const particlesRef = useRef();

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.elapsedTime * 0.1;
    }
  });

  const particles = Array.from({ length: 100 }, () => ({
    position: [
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    ],
    color: Math.random() > 0.5 ? '#00ffff' : '#ff00ff'
  }));

  return (
    <group ref={particlesRef}>
      {particles.map((p, i) => (
        <Sphere key={i} args={[0.05, 8, 8]} position={p.position}>
          <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={1} />
        </Sphere>
      ))}
    </group>
  );
}

export function EnvironmentalEffect3D() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <ParticleField3D />
      </Canvas>
    </div>
  );
}