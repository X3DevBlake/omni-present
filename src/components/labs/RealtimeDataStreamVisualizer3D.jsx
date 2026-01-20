import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function DataFlow({ isActive }) {
  const particlesRef = useRef();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        position: new THREE.Vector3(-5, Math.random() * 2 - 1, Math.random() * 2 - 1),
        speed: 0.05 + Math.random() * 0.05
      }));
      setParticles(newParticles);
    }
  }, [isActive]);

  useFrame(() => {
    if (particlesRef.current && isActive) {
      particles.forEach((p, i) => {
        p.position.x += p.speed;
        if (p.position.x > 5) p.position.x = -5;
        
        if (particlesRef.current.geometry.attributes.position) {
          particlesRef.current.geometry.attributes.position.setXYZ(
            i,
            p.position.x,
            p.position.y,
            p.position.z
          );
        }
      });
      if (particlesRef.current.geometry.attributes.position) {
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length}
          array={new Float32Array(particles.flatMap(p => [p.position.x, p.position.y, p.position.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#00f5ff" />
    </points>
  );
}

function ProcessingPipeline({ pipeline }) {
  return (
    <group position={[0, -2, 0]}>
      {pipeline?.map((step, i) => (
        <group key={i} position={[i * 2 - 2, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.8, 0.5, 0.5]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#a855f7"
              emissiveIntensity={0.3}
            />
          </mesh>
          <Text position={[0, -0.6, 0]} fontSize={0.12} color="white">
            {step.step}
          </Text>
        </group>
      ))}
    </group>
  );
}

function HealthIndicator({ metrics }) {
  const color = metrics?.uptime_percentage > 95 ? '#44ff44' : '#ffaa00';
  
  return (
    <group position={[4, 2, 0]}>
      <mesh>
        <sphereGeometry args={[0.5]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>
      <Text position={[0, -0.8, 0]} fontSize={0.15} color="white">
        {metrics?.uptime_percentage?.toFixed(2)}% UP
      </Text>
    </group>
  );
}

export default function RealtimeDataStreamVisualizer3D({ stream }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 3, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
        
        {stream && (
          <>
            <group>
              <Text position={[0, 4, 0]} fontSize={0.4} color="#00f5ff">
                {stream.stream_name}
              </Text>
              <Text position={[0, 3.3, 0]} fontSize={0.2} color="#ffffff">
                {stream.stream_type.toUpperCase()}
              </Text>
              <Text position={[0, 2.8, 0]} fontSize={0.18} color={stream.status === 'active' ? '#44ff44' : '#ff4444'}>
                Status: {stream.status}
              </Text>
              <Text position={[0, 2.3, 0]} fontSize={0.15} color="#ffaa00">
                {stream.data_rate?.messages_per_second?.toFixed(1)} msg/s
              </Text>
            </group>

            <DataFlow isActive={stream.status === 'active'} />
            <ProcessingPipeline pipeline={stream.processing_pipeline} />
            <HealthIndicator metrics={stream.health_metrics} />

            <group position={[-4, 0, 0]}>
              <Text fontSize={0.15} color="white">
                Consumers: {stream.consumers?.length || 0}
              </Text>
            </group>

            <group position={[0, -4, 0]}>
              <Text fontSize={0.12} color="#ffffff">
                Latency: {stream.health_metrics?.latency_ms?.toFixed(1)}ms
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color="#ffffff">
                Error Rate: {(stream.health_metrics?.error_rate * 100)?.toFixed(3)}%
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}