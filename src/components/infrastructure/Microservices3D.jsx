import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function ServiceNode({ service, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (service.health_status === 'degraded') {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      }
    }
  });

  const getHealthColor = () => {
    switch (service.health_status) {
      case 'healthy': return '#44ff44';
      case 'degraded': return '#ffaa00';
      case 'down': return '#ff4444';
      default: return '#888888';
    }
  };

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.4, 0.4, 0.8, 8]} />
        <meshStandardMaterial
          color={getHealthColor()}
          emissive={getHealthColor()}
          emissiveIntensity={0.5}
        />
      </mesh>
      <Text position={[0, -0.8, 0]} fontSize={0.12} color="white">
        {service.service_name}
      </Text>
      <Text position={[0, 1, 0]} fontSize={0.1} color="#00f5ff">
        {service.performance_metrics?.requests_per_second?.toFixed(0)} req/s
      </Text>
    </group>
  );
}

function DependencyConnections({ services }) {
  return (
    <>
      {services?.flatMap((service, i) => 
        service.dependencies?.map((dep, j) => {
          const targetIndex = services.findIndex(s => s.service_name === dep.service_name);
          if (targetIndex === -1) return null;

          const angle1 = (i / services.length) * Math.PI * 2;
          const angle2 = (targetIndex / services.length) * Math.PI * 2;
          
          const points = [
            new THREE.Vector3(Math.cos(angle1) * 3, Math.sin(angle1) * 3, 0),
            new THREE.Vector3(Math.cos(angle2) * 3, Math.sin(angle2) * 3, 0)
          ];
          
          return (
            <Line
              key={`${i}-${j}`}
              points={points}
              color="#a855f7"
              lineWidth={2}
              opacity={0.3}
              transparent
            />
          );
        })
      )}
    </>
  );
}

function CircuitBreakerIndicator({ services }) {
  const openBreakers = services?.filter(s => s.circuit_breaker?.state === 'open').length || 0;
  
  return (
    <group position={[0, -3.5, 0]}>
      <Text fontSize={0.15} color={openBreakers > 0 ? '#ff4444' : '#44ff44'}>
        Circuit Breakers: {openBreakers} Open
      </Text>
    </group>
  );
}

export default function Microservices3D({ services }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 12], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
          Microservices Architecture
        </Text>
        <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
          {services?.length || 0} Services Running
        </Text>

        <DependencyConnections services={services} />

        {services?.slice(0, 12).map((service, i) => {
          const angle = (i / Math.min(services.length, 12)) * Math.PI * 2;
          return (
            <ServiceNode
              key={service.id}
              service={service}
              position={[Math.cos(angle) * 3, Math.sin(angle) * 3, 0]}
            />
          );
        })}

        <CircuitBreakerIndicator services={services} />
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}