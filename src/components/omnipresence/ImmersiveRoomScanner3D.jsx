import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Box, Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

function ScanningBeam({ active }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current && active) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={ref} position={[0, 1.5, 0]}>
      <mesh>
        <cylinderGeometry args={[0.02, 5, 3, 32, 1, true]} />
        <meshBasicMaterial
          color="#00f5ff"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function DetectedObject({ obj, index }) {
  const [info, setInfo] = useState(false);
  const position = obj.position || { x: index * 1.5 - 3, y: 0.3, z: index * 1.2 - 2 };

  return (
    <group position={[position.x, position.y, position.z]}>
      <Sphere
        args={[0.15, 16, 16]}
        onPointerOver={() => setInfo(true)}
        onPointerOut={() => setInfo(false)}
      >
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.5}
        />
      </Sphere>
      {info && (
        <Html position={[0, 0.3, 0]} center>
          <div className="bg-black/90 text-white px-2 py-1 rounded text-xs">
            {obj.detected_object?.object_type || 'Object'}
            <br />
            <span className="text-green-400">
              {((obj.detected_object?.confidence || 0) * 100).toFixed(0)}% confident
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

function ScanProgressRing({ progress }) {
  const ref = useRef();

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.z += 0.02;
    }
  });

  return (
    <group ref={ref} position={[0, 0.1, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 2, 64, 1, 0, (progress / 100) * Math.PI * 2]} />
        <meshBasicMaterial color="#00f5ff" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function ImmersiveRoomScanner3D({ scanning, detections = [], scanProgress = 0 }) {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[8, 5, 8]} fov={60} />
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#a855f7" />

        {/* Floor */}
        <Box args={[10, 0.1, 10]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#0a0a1a" />
        </Box>

        {scanning && <ScanningBeam active={scanning} />}
        {scanning && <ScanProgressRing progress={scanProgress} />}

        {detections.map((obj, idx) => (
          <DetectedObject key={obj.id || idx} obj={obj} index={idx} />
        ))}

        <OrbitControls enableZoom={true} autoRotate={!scanning} />
      </Canvas>
    </div>
  );
}