import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

function HubNode({ hub, position, onSelect }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const pulse = 1 + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const categoryColors = {
    'ai_ml': '#00f5ff',
    'finance': '#44ff44',
    'collaboration': '#a855f7',
    'security': '#ff4444',
    'analytics': '#ffaa00',
    'infrastructure': '#3b82f6'
  };

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[0.4, 32, 32]}
        onClick={() => onSelect?.(hub)}
      >
        <meshStandardMaterial
          color={categoryColors[hub.hub_category] || '#00f5ff'}
          emissive={categoryColors[hub.hub_category] || '#00f5ff'}
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      <Html position={[0, 0.8, 0]} center>
        <div className="text-white text-xs font-medium bg-black/70 px-2 py-1 rounded whitespace-nowrap">
          {hub.display_name}
        </div>
      </Html>

      {hub.usage_stats?.total_visits > 0 && (
        <Text position={[0, -0.7, 0]} fontSize={0.1} color="#ffaa00">
          {hub.usage_stats.total_visits} visits
        </Text>
      )}
    </group>
  );
}

function ConnectionPath({ link, sourcePos, targetPos }) {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
      lineRef.current.material.opacity = pulse * link.strength;
    }
  });

  const getColor = () => {
    switch (link.link_type) {
      case 'data_flow': return '#00f5ff';
      case 'user_navigation': return '#44ff44';
      case 'ai_suggestion': return '#a855f7';
      case 'workflow': return '#ffaa00';
      default: return '#ffffff';
    }
  };

  const points = [
    new THREE.Vector3(...sourcePos),
    new THREE.Vector3(
      (sourcePos[0] + targetPos[0]) / 2,
      (sourcePos[1] + targetPos[1]) / 2 + 1,
      (sourcePos[2] + targetPos[2]) / 2
    ),
    new THREE.Vector3(...targetPos)
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const curvePoints = curve.getPoints(50);

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={curvePoints.length}
          array={new Float32Array(curvePoints.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={getColor()}
        transparent
        opacity={0.6}
        linewidth={link.strength * 5}
      />
    </line>
  );
}

export default function CrossHubNetwork3D({ hubs = [], links = [], onHubSelect }) {
  const hubPositions = hubs.map((hub, i) => {
    const angle = (i / hubs.length) * Math.PI * 2;
    const layer = Math.floor(i / 6);
    const radius = 3 + layer * 1.5;
    return {
      hub,
      position: [
        Math.cos(angle) * radius,
        layer * 2 - 2,
        Math.sin(angle) * radius
      ]
    };
  });

  return (
    <div className="w-full h-[700px] bg-black/20 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.7} color="#a855f7" />
        <pointLight position={[0, 10, 0]} intensity={0.8} color="#00f5ff" />
        
        <Text position={[0, 6, 0]} fontSize={0.5} color="#00f5ff">
          Navigation Hub Network
        </Text>

        {hubPositions.map((item, i) => (
          <HubNode
            key={i}
            hub={item.hub}
            position={item.position}
            onSelect={onHubSelect}
          />
        ))}

        {links.map((link, i) => {
          const source = hubPositions.find(hp => hp.hub.hub_name === link.source_hub);
          const target = hubPositions.find(hp => hp.hub.hub_name === link.target_hub);
          
          if (!source || !target) return null;
          
          return (
            <ConnectionPath
              key={i}
              link={link}
              sourcePos={source.position}
              targetPos={target.position}
            />
          );
        })}

        <Text position={[0, -6, 0]} fontSize={0.25} color="white">
          {hubs.length} Hubs • {links.filter(l => l.is_active).length} Active Paths
        </Text>
        
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
}