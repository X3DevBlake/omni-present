import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Html, Trail } from '@react-three/drei';
import * as THREE from 'three';

function AlertParticle({ alert, position, index }) {
  const meshRef = useRef();
  const [time, setTime] = useState(0);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      setTime(t => t + delta);
      
      const offset = Math.sin(time * 2 + index) * 0.5;
      meshRef.current.position.y = position[1] + offset;
      meshRef.current.rotation.y += 0.05;
      
      const pulse = 1 + Math.sin(time * 3) * 0.2;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff4444';
      case 'medium': return '#ff8800';
      case 'low': return '#ffaa00';
      default: return '#00f5ff';
    }
  };

  const getSize = () => {
    switch (alert.severity) {
      case 'critical': return 0.4;
      case 'high': return 0.3;
      case 'medium': return 0.25;
      default: return 0.2;
    }
  };

  return (
    <group position={position}>
      <Trail width={2} length={6} color={getSeverityColor()} attenuation={(t) => t * t}>
        <Sphere ref={meshRef} args={[getSize(), 16, 16]}>
          <meshStandardMaterial
            color={getSeverityColor()}
            emissive={getSeverityColor()}
            emissiveIntensity={alert.severity === 'critical' ? 1.5 : 0.8}
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>
      </Trail>

      <Html position={[0, 0.5, 0]} center>
        <div className={`text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${
          alert.severity === 'critical' ? 'bg-red-900/90 animate-pulse' : 'bg-black/70'
        }`}>
          {alert.title}
        </div>
      </Html>
    </group>
  );
}

function PropagationPath({ path }) {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  const points = path.map((p, i) => 
    new THREE.Vector3(
      Math.cos((i / path.length) * Math.PI * 2) * 2,
      (i - path.length / 2) * 0.5,
      Math.sin((i / path.length) * Math.PI * 2) * 2
    )
  );

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#ff8800" transparent opacity={0.5} />
    </line>
  );
}

function ImpactWave({ alert, time }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
      meshRef.current.scale.setScalar(scale);
      meshRef.current.material.opacity = 0.5 - (scale - 1);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial
        color={alert.severity === 'critical' ? '#ff0000' : '#ff8800'}
        transparent
        opacity={0.2}
        wireframe
      />
    </mesh>
  );
}

export default function RealTimeAlertFlow3D({ alerts = [], onAlertClick }) {
  const activeAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="w-full h-[600px] bg-black/20 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff4444" />
        
        <Text position={[0, 4, 0]} fontSize={0.4} color="#ff4444">
          Real-Time Alert System
        </Text>

        {activeAlerts.map((alert, i) => {
          const angle = (i / activeAlerts.length) * Math.PI * 2;
          const radius = 2.5;
          return (
            <AlertParticle
              key={i}
              alert={alert}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                (Math.random() - 0.5) * 2
              ]}
              index={i}
            />
          );
        })}

        {activeAlerts.filter(a => a.severity === 'critical').map((alert, i) => (
          <ImpactWave key={i} alert={alert} time={i} />
        ))}

        {activeAlerts.filter(a => a.propagation_path?.length > 0).map((alert, i) => (
          <PropagationPath key={i} path={alert.propagation_path} />
        ))}

        <Text position={[0, -4, 0]} fontSize={0.25} color="white">
          {activeAlerts.filter(a => a.severity === 'critical').length} Critical |{' '}
          {activeAlerts.filter(a => a.severity === 'high').length} High |{' '}
          {activeAlerts.length} Total
        </Text>
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}