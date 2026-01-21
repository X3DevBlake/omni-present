import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder, Html } from '@react-three/drei';
import * as THREE from 'three';

function DeviceBody({ dimensions, deviceType, autoRotate }) {
  const ref = useRef();
  const scale = 0.01;

  useFrame((state) => {
    if (ref.current && autoRotate) {
      ref.current.rotation.y += 0.005;
    }
  });

  const getDeviceColor = () => {
    const colors = {
      holographic_projector: '#00f5ff',
      robotic_arm: '#a855f7',
      smart_light: '#f59e0b',
      smart_thermostat: '#ef4444',
      smart_lock: '#10b981',
      ar_glasses: '#ec4899',
      projection_drone: '#06b6d4',
      smart_mirror: '#8b5cf6',
      sensor_hub: '#84cc16'
    };
    return colors[deviceType] || '#ffffff';
  };

  return (
    <group ref={ref}>
      <Box args={[
        (dimensions?.width_cm || 30) * scale,
        (dimensions?.height_cm || 20) * scale,
        (dimensions?.depth_cm || 15) * scale
      ]}>
        <meshStandardMaterial
          color={getDeviceColor()}
          emissive={getDeviceColor()}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </Box>
    </group>
  );
}

function ComponentMarker({ component, onClick }) {
  const [hovered, setHovered] = useState(false);
  const pos = component.position || { x: 0, y: 0, z: 0 };

  return (
    <group position={[pos.x * 0.01, pos.y * 0.01, pos.z * 0.01]}>
      <Sphere
        args={[0.03, 16, 16]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onClick(component)}
      >
        <meshStandardMaterial
          color={hovered ? '#00ff88' : '#ffffff'}
          emissive={hovered ? '#00ff88' : '#ffffff'}
          emissiveIntensity={hovered ? 0.8 : 0.3}
        />
      </Sphere>
      {hovered && (
        <Html position={[0, 0.1, 0]} center>
          <div className="bg-black/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            {component.component_name}
          </div>
        </Html>
      )}
    </group>
  );
}

function SensorCone({ sensor, index }) {
  const angle = (sensor.angle_degrees || 60) * (Math.PI / 180);
  const range = (sensor.range_meters || 2) * 0.5;

  return (
    <group rotation={[0, (index / 4) * Math.PI * 2, 0]}>
      <mesh position={[0, 0, range / 2]}>
        <coneGeometry args={[Math.tan(angle / 2) * range, range, 32]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.1} wireframe />
      </mesh>
    </group>
  );
}

function InteractiveHotspot({ hotspot, onClick }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef();
  const pos = hotspot.position || { x: 0, y: 0, z: 0 };

  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.2);
    }
  });

  return (
    <group position={[pos.x * 0.01, pos.y * 0.01, pos.z * 0.01]}>
      <mesh
        ref={ref}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onClick(hotspot)}
      >
        <ringGeometry args={[0.02, 0.04, 32]} />
        <meshBasicMaterial color={hovered ? '#00ff88' : '#f59e0b'} side={THREE.DoubleSide} />
      </mesh>
      {hovered && (
        <Html position={[0, 0.08, 0]} center>
          <div className="bg-black/90 text-yellow-400 px-3 py-2 rounded text-xs max-w-40">
            <p className="font-bold">{hotspot.hotspot_name}</p>
            <p className="text-white/70">{hotspot.tooltip}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function DeviceBlueprint3D({ blueprint, onHotspotClick, onComponentClick }) {
  if (!blueprint) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-lg">
        <p className="text-slate-400">Select a device blueprint to view</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [2, 1.5, 2], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#a855f7" />
        <spotLight position={[0, 5, 0]} intensity={0.5} angle={0.5} />

        <Text
          position={[0, 1.2, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
        >
          {blueprint.blueprint_name}
        </Text>

        <DeviceBody
          dimensions={blueprint.dimensions}
          deviceType={blueprint.device_type}
          autoRotate={blueprint.auto_rotation_enabled}
        />

        {blueprint.components?.map((comp, idx) => (
          <ComponentMarker
            key={idx}
            component={comp}
            onClick={onComponentClick || (() => {})}
          />
        ))}

        {blueprint.sensors?.map((sensor, idx) => (
          <SensorCone key={idx} sensor={sensor} index={idx} />
        ))}

        {blueprint.interactive_hotspots?.map((hotspot, idx) => (
          <InteractiveHotspot
            key={idx}
            hotspot={hotspot}
            onClick={onHotspotClick || (() => {})}
          />
        ))}

        <OrbitControls
          enableZoom={true}
          autoRotate={blueprint.auto_rotation_enabled}
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
}