import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function HubNode({ position, hubName, color, active }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += active ? 0.02 : 0.005;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 2) * (active ? 0.1 : 0.02));
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={active ? 0.6 : 0.3}
        />
      </Sphere>
      <Text
        position={[0, -0.9, 0]}
        fontSize={0.18}
        color="white"
        anchorX="center"
      >
        {hubName}
      </Text>
    </group>
  );
}

function DataFlowLine({ from, to, strength, bidirectional }) {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.3 + Math.sin(state.clock.getElapsedTime() * 2) * 0.2;
    }
  });

  const points = [
    new THREE.Vector3(...from),
    new THREE.Vector3(...to)
  ];

  return (
    <>
      <Line
        ref={lineRef}
        points={points}
        color="#00f5ff"
        lineWidth={strength * 3}
        transparent
        opacity={0.5}
      />
      {bidirectional && (
        <Line
          points={[...points].reverse()}
          color="#a855f7"
          lineWidth={strength * 2}
          transparent
          opacity={0.4}
          dashed
          dashScale={10}
          gapSize={0.5}
        />
      )}
    </>
  );
}

export default function CrossHubInsights3D({ insights = [], dataFlows = [] }) {
  const hubs = [
    { name: 'Security', color: '#ef4444', position: [3, 2, 0] },
    { name: 'DeFi', color: '#10b981', position: [-3, 2, 0] },
    { name: 'Simulation', color: '#3b82f6', position: [3, -2, 0] },
    { name: 'Marketplace', color: '#a855f7', position: [-3, -2, 0] },
    { name: 'Governance', color: '#fbbf24', position: [0, 3, 0] },
    { name: 'Collaboration', color: '#06b6d4', position: [0, -3, 0] }
  ];

  const getHubActivity = (hubName) => {
    return insights.filter(i => 
      i.source_hubs?.includes(hubName.toLowerCase()) || 
      i.affected_hubs?.includes(hubName.toLowerCase())
    ).length;
  };

  return (
    <div className="w-full h-[700px] bg-black/20 rounded-xl overflow-hidden relative">
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />

        {/* Hub nodes */}
        {hubs.map((hub) => (
          <HubNode
            key={hub.name}
            position={hub.position}
            hubName={hub.name}
            color={hub.color}
            active={getHubActivity(hub.name) > 0}
          />
        ))}

        {/* Data flow connections */}
        {dataFlows.map((flow, i) => {
          const sourceHub = hubs.find(h => h.name.toLowerCase() === flow.source_hub);
          const targetHub = hubs.find(h => h.name.toLowerCase() === flow.target_hub);
          
          if (sourceHub && targetHub) {
            return (
              <DataFlowLine
                key={i}
                from={sourceHub.position}
                to={targetHub.position}
                strength={flow.flow_metrics?.success_rate || 50}
                bidirectional={flow.flow_type === 'bi_directional'}
              />
            );
          }
          return null;
        })}

        {/* Center intelligence core */}
        <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#00f5ff" 
            emissiveIntensity={0.8}
            wireframe
          />
        </Sphere>
        <Text position={[0, 0, 1]} fontSize={0.2} color="white">
          AI CORE
        </Text>

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      <div className="absolute bottom-4 left-4 bg-black/60 p-4 rounded-lg backdrop-blur-sm">
        <div className="text-white text-sm font-bold mb-3">Cross-Hub Intelligence</div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Active Insights:</span>
            <span className="text-cyan-400">{insights.length}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Data Flows:</span>
            <span className="text-purple-400">{dataFlows.length}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Critical:</span>
            <span className="text-red-400">
              {insights.filter(i => i.urgency_level === 'critical').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}