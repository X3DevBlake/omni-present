import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function EventParticle({ event, position, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const speed = event.routing?.priority === 'critical' ? 0.05 : 0.02;
      meshRef.current.position.x += speed;
      if (meshRef.current.position.x > 5) {
        meshRef.current.position.x = -5;
      }
      meshRef.current.rotation.y += 0.02;
    }
  });

  const getPriorityColor = () => {
    switch (event.routing?.priority) {
      case 'critical': return '#ff4444';
      case 'high': return '#ff8800';
      case 'normal': return '#00f5ff';
      default: return '#44ff44';
    }
  };

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.15]} />
      <meshStandardMaterial
        color={getPriorityColor()}
        emissive={getPriorityColor()}
        emissiveIntensity={0.7}
      />
    </mesh>
  );
}

function ServiceNode({ service, position, deliveryCount }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && deliveryCount > 0) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.4} />
      </mesh>
      <Text position={[0, -0.6, 0]} fontSize={0.12} color="white">
        {service}
      </Text>
      {deliveryCount > 0 && (
        <Text position={[0, 0.6, 0]} fontSize={0.1} color="#44ff44">
          {deliveryCount}
        </Text>
      )}
    </group>
  );
}

export default function EventBus3D({ events }) {
  const uniqueServices = [...new Set(events?.flatMap(e => e.routing?.target_services || []))];

  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 3, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
        
        <Text position={[0, 4, 0]} fontSize={0.4} color="#00f5ff">
          Event Bus
        </Text>
        <Text position={[0, 3.4, 0]} fontSize={0.2} color="#ffffff">
          {events?.length || 0} Events in Transit
        </Text>

        {events?.slice(0, 20).map((event, i) => (
          <EventParticle
            key={event.id}
            event={event}
            position={[-5 + (i % 10) * 0.3, (i % 3) - 1, 0]}
            index={i}
          />
        ))}

        {uniqueServices.slice(0, 6).map((service, i) => {
          const angle = (i / uniqueServices.length) * Math.PI * 2;
          const deliveries = events?.filter(e => 
            e.delivery_status?.delivered_to?.includes(service)
          ).length || 0;
          
          return (
            <ServiceNode
              key={i}
              service={service}
              position={[Math.cos(angle) * 4, Math.sin(angle) * 2, 0]}
              deliveryCount={deliveries}
            />
          );
        })}

        <group position={[0, -3, 0]}>
          <Text fontSize={0.15} color="#44ff44">
            Delivered: {events?.reduce((sum, e) => sum + (e.delivery_status?.delivered_to?.length || 0), 0)}
          </Text>
          <Text position={[0, -0.4, 0]} fontSize={0.15} color="#ff4444">
            Failed: {events?.reduce((sum, e) => sum + (e.delivery_status?.failed_deliveries?.length || 0), 0)}
          </Text>
        </group>
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}