import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function MetricBar({ label, value, position, color }) {
  const barRef = useRef();

  useFrame(() => {
    if (barRef.current) {
      const targetHeight = (value / 100) * 3;
      barRef.current.scale.y += (targetHeight - barRef.current.scale.y) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Box ref={barRef} args={[0.5, 1, 0.5]} position={[0, 0.5, 0]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.4}
        />
      </Box>

      <Text position={[0, -0.5, 0]} fontSize={0.15} color="white" anchorX="center">
        {label}
      </Text>

      <Text position={[0, 2, 0]} fontSize={0.2} color={color} anchorX="center">
        {Math.round(value)}%
      </Text>
    </group>
  );
}

function JobParticle({ job, position }) {
  const particleRef = useRef();

  useFrame((state) => {
    if (particleRef.current) {
      particleRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3 + position[0]) * 0.3;
      particleRef.current.rotation.x += 0.02;
      particleRef.current.rotation.y += 0.03;
    }
  });

  const statusColor = job.status === 'completed' ? '#10b981' :
                      job.status === 'running' ? '#3b82f6' :
                      job.status === 'failed' ? '#ef4444' : '#6b7280';

  return (
    <Sphere ref={particleRef} args={[0.15, 16, 16]} position={position}>
      <meshStandardMaterial
        color={statusColor}
        emissive={statusColor}
        emissiveIntensity={0.5}
      />
    </Sphere>
  );
}

export default function OrchestrationMetrics3D({ jobs, automations }) {
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const failedJobs = jobs.filter(j => j.status === 'failed');
  const runningJobs = jobs.filter(j => j.status === 'running');

  const successRate = jobs.length > 0 ? (completedJobs.length / jobs.length * 100) : 100;
  const activeRate = automations.filter(a => a.is_active).length / Math.max(automations.length, 1) * 100;
  const avgEfficiency = jobs.reduce((acc, j) => acc + (j.performance_metrics?.efficiency_score || 0), 0) / Math.max(jobs.length, 1);

  return (
    <Canvas camera={{ position: [0, 4, 8], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#fbbf24" />

      <Text position={[0, 4, 0]} fontSize={0.4} color="white" anchorX="center">
        Performance Metrics
      </Text>

      {/* Metric Bars */}
      <MetricBar
        label="Success Rate"
        value={successRate}
        position={[-3, 0, 0]}
        color="#10b981"
      />

      <MetricBar
        label="Active Rate"
        value={activeRate}
        position={[0, 0, 0]}
        color="#3b82f6"
      />

      <MetricBar
        label="Efficiency"
        value={avgEfficiency}
        position={[3, 0, 0]}
        color="#fbbf24"
      />

      {/* Job Particles */}
      {jobs.slice(0, 20).map((job, idx) => {
        const angle = (idx / 20) * Math.PI * 2;
        const radius = 5;
        return (
          <JobParticle
            key={job.id}
            job={job}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle * 3),
              Math.sin(angle) * radius
            ]}
          />
        );
      })}

      {/* Grid Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#0f172a"
          wireframe
          opacity={0.2}
          transparent
        />
      </mesh>

      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={18}
      />
    </Canvas>
  );
}