import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function HandModel({ gesture, position }) {
  const handRef = useRef();

  useFrame((state) => {
    if (handRef.current) {
      handRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.3;
    }
  });

  const gestureColors = {
    point: '#00f5ff',
    wave: '#a855f7',
    swipe: '#f59e0b',
    circle: '#10b981',
    thumbs_up: '#22c55e',
    stop: '#ef4444'
  };

  return (
    <group ref={handRef} position={position}>
      <Sphere args={[0.15, 16, 16]}>
        <meshStandardMaterial
          color={gestureColors[gesture] || '#ffffff'}
          emissive={gestureColors[gesture] || '#ffffff'}
          emissiveIntensity={0.6}
        />
      </Sphere>
      
      {/* Gesture trail */}
      {[...Array(5)].map((_, i) => (
        <Sphere key={i} args={[0.05, 8, 8]} position={[-i * 0.2, 0, 0]}>
          <meshBasicMaterial
            color={gestureColors[gesture] || '#ffffff'}
            transparent
            opacity={0.6 - i * 0.1}
          />
        </Sphere>
      ))}
    </group>
  );
}

function CommandVisualization({ command, position }) {
  return (
    <group position={position}>
      <Text
        fontSize={0.2}
        color="#00ff88"
        anchorX="center"
        anchorY="middle"
      >
        {command}
      </Text>
      
      <mesh position={[0, -0.3, 0]}>
        <ringGeometry args={[0.3, 0.35, 32]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

export default function GestureRecognition3D({ interactions }) {
  const recentGestures = interactions
    ?.filter(i => i.interaction_type === 'gesture_command')
    .slice(0, 5) || [];

  return (
    <Canvas camera={{ position: [4, 2, 4], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#a855f7" />

      <Text
        position={[0, 2.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        Gesture Recognition
      </Text>

      {recentGestures.map((interaction, idx) => (
        <group key={interaction.id}>
          <HandModel
            gesture={interaction.gesture_data?.gesture_type}
            position={[
              (idx - 2) * 1.5,
              0,
              0
            ]}
          />
          <CommandVisualization
            command={interaction.gesture_data?.interpreted_command?.slice(0, 20)}
            position={[(idx - 2) * 1.5, -1, 0]}
          />
        </group>
      ))}

      {recentGestures.length === 0 && (
        <Text position={[0, 0, 0]} fontSize={0.2} color="#666" anchorX="center">
          No recent gestures
        </Text>
      )}

      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}