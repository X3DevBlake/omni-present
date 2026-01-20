import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, RoundedBox, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function UIWidget({ widget, isHovered, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const scale = hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  const colors = {
    kpi_dashboard: '#00f5ff',
    ecosystem_map: '#a855f7',
    activity_stream: '#44ff44',
    recommendations: '#ff8800',
    quick_actions: '#ff4444'
  };

  return (
    <group position={[widget.x, widget.y, widget.z]}>
      <RoundedBox
        ref={meshRef}
        args={[widget.scale, widget.scale, widget.scale * 0.3]}
        radius={0.1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <meshStandardMaterial
          color={colors[widget.widget_id] || '#00f5ff'}
          emissive={colors[widget.widget_id] || '#00f5ff'}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </RoundedBox>
      
      <Html position={[0, -widget.scale * 0.7, 0]} center>
        <div className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
          {widget.widget_id?.replace(/_/g, ' ').toUpperCase()}
        </div>
      </Html>

      <Text
        position={[0, widget.scale * 0.7, 0]}
        fontSize={0.15}
        color="white"
      >
        {widget.order}
      </Text>
    </group>
  );
}

function AdaptiveGrid({ rules }) {
  const lineRefs = useRef([]);
  
  useFrame((state) => {
    lineRefs.current.forEach((line, i) => {
      if (line) {
        line.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime + i) * 0.2;
      }
    });
  });

  return (
    <group>
      {[-2, -1, 0, 1, 2].map((x, i) => (
        <mesh key={`grid-x-${i}`} position={[x, 0, 0]} ref={el => lineRefs.current[i] = el}>
          <boxGeometry args={[0.02, 6, 0.02]} />
          <meshBasicMaterial color="#00f5ff" transparent opacity={0.3} />
        </mesh>
      ))}
      {[-2, -1, 0, 1, 2].map((y, i) => (
        <mesh key={`grid-y-${i}`} position={[0, y, 0]} ref={el => lineRefs.current[i + 5] = el}>
          <boxGeometry args={[6, 0.02, 0.02]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export default function DynamicUIConfigurator3D({ config, onWidgetClick }) {
  const widgets = config?.widget_positions?.map((pos, i) => ({
    widget_id: pos.widget_id,
    x: pos.x || (i % 3 - 1) * 2,
    y: pos.y || Math.floor(i / 3) * 2 - 1,
    z: pos.z || 0,
    scale: pos.scale || 1,
    rotation: pos.rotation || 0,
    order: i + 1
  })) || [];

  return (
    <div className="w-full h-[600px] bg-black/20 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        <Text position={[0, 3.5, 0]} fontSize={0.4} color="#00f5ff">
          Dynamic UI Configuration
        </Text>

        <AdaptiveGrid rules={config?.adaptive_rules} />

        {widgets.map((widget, i) => (
          <UIWidget
            key={i}
            widget={widget}
            onClick={() => onWidgetClick?.(widget)}
          />
        ))}

        {config?.ai_optimizations?.auto_arrange && (
          <Text position={[0, -3.5, 0]} fontSize={0.2} color="#44ff44">
            AI Auto-Arrange: ENABLED
          </Text>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}