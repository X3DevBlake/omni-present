import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Text, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

function DynamicObject({ detection }) {
  const objRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (objRef.current && detection.tracking_status === 'tracking') {
      const vel = detection.detected_object?.velocity || { vx: 0, vy: 0, vz: 0 };
      objRef.current.position.x += vel.vx * 0.001;
      objRef.current.position.z += vel.vz * 0.001;
    }
  });

  const pos = detection.detected_object?.position || { x: 0, y: 0, z: 0 };
  const bbox = detection.detected_object?.bounding_box || { width: 0.5, height: 0.5, depth: 0.5 };

  const statusColors = {
    new: '#3b82f6',
    tracking: '#10b981',
    lost: '#ef4444',
    stationary: '#f59e0b'
  };

  const color = statusColors[detection.tracking_status] || '#6366f1';

  return (
    <group position={[pos.x, pos.y, pos.z]}>
      <Box
        ref={objRef}
        args={[bbox.width, bbox.height, bbox.depth]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.6}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </Box>

      {/* Predicted Path */}
      {detection.predicted_path?.length > 0 && (
        <Line
          points={detection.predicted_path.map(p => [p.position?.x || 0, p.position?.y || 0, p.position?.z || 0])}
          color="#a855f7"
          lineWidth={2}
          dashed
          dashSize={0.1}
          gapSize={0.05}
        />
      )}

      {/* Avoidance Zone */}
      {detection.agent_avoidance_rules?.[0] && (
        <mesh position={[0, -bbox.height / 2, 0]}>
          <ringGeometry args={[
            detection.agent_avoidance_rules[0].avoidance_radius_meters - 0.1,
            detection.agent_avoidance_rules[0].avoidance_radius_meters,
            32
          ]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      )}

      {hovered && (
        <Html position={[0, bbox.height + 0.3, 0]} center>
          <div className="bg-slate-900/95 backdrop-blur-sm border border-green-500 rounded-lg p-3 min-w-[180px]">
            <p className="text-white font-bold text-sm mb-1">
              {detection.detected_object?.object_label}
            </p>
            <p className="text-green-400 text-xs mb-1">
              Status: {detection.tracking_status}
            </p>
            <p className="text-slate-400 text-xs">
              Confidence: {Math.round((detection.detected_object?.confidence || 0) * 100)}%
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function DynamicObjectTracker3D({ detections }) {
  return (
    <Canvas camera={{ position: [8, 6, 8], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#10b981" />

      <Text position={[0, 5, 0]} fontSize={0.35} color="white" anchorX="center">
        Dynamic Object Detection
      </Text>

      <gridHelper args={[20, 20, '#334155', '#1e293b']} />

      {detections.map(detection => (
        <DynamicObject key={detection.id} detection={detection} />
      ))}

      <OrbitControls
        enableZoom={true}
        minDistance={4}
        maxDistance={18}
      />
    </Canvas>
  );
}