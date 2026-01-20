import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

function ThreatMarker({ threat, position }) {
  const markerRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (markerRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1;
      markerRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
    }
  });

  const severityColors = {
    'critical': '#dc2626',
    'high': '#ea580c',
    'medium': '#f59e0b',
    'low': '#3b82f6',
    'info': '#6b7280'
  };

  const color = severityColors[threat.severity_level] || '#6366f1';

  return (
    <group position={position}>
      <Sphere
        ref={markerRef}
        args={[0.15, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {hovered && (
        <Html position={[0, 0.4, 0]} center>
          <div className="bg-slate-900/95 backdrop-blur-sm border border-red-500 rounded-lg p-3 min-w-[200px]">
            <p className="text-white font-bold text-xs mb-1">{threat.threat_type}</p>
            <p className="text-slate-400 text-xs mb-2">
              Origin: {threat.threat_intelligence?.origin_location?.country || 'Unknown'}
            </p>
            <Badge className={`${
              threat.severity_level === 'critical' ? 'bg-red-500/20 text-red-400' :
              threat.severity_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {threat.severity_level}
            </Badge>
          </div>
        </Html>
      )}

      {/* Pulsing Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.02, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function Globe() {
  const globeRef = useRef();

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });

  return (
    <Sphere ref={globeRef} args={[2, 64, 64]}>
      <meshStandardMaterial
        color="#1e293b"
        metalness={0.4}
        roughness={0.6}
        wireframe
      />
    </Sphere>
  );
}

export default function ThreatMap3D({ threats }) {
  const latLongToVector3 = (lat, lon, radius = 2.2) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return [x, y, z];
  };

  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#dc2626" />

      <Globe />

      {threats.filter(t => t.threat_intelligence?.origin_location).map((threat, idx) => {
        const { latitude, longitude } = threat.threat_intelligence.origin_location;
        if (latitude && longitude) {
          return (
            <ThreatMarker
              key={threat.id}
              threat={threat}
              position={latLongToVector3(latitude, longitude)}
            />
          );
        }
        return null;
      })}

      <Text position={[0, 3.5, 0]} fontSize={0.3} color="white" anchorX="center">
        Global Threat Map
      </Text>

      <OrbitControls
        enableZoom={true}
        minDistance={4}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}