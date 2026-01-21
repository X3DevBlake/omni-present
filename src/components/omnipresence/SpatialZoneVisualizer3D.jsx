import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';

function Zone3D({ zone, onClick }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef();
  
  const bounds = zone.boundaries || { min_x: 0, max_x: 2, min_y: 0, max_y: 0.1, min_z: 0, max_z: 2 };
  const width = bounds.max_x - bounds.min_x;
  const height = bounds.max_y - bounds.min_y || 0.1;
  const depth = bounds.max_z - bounds.min_z;
  const centerX = (bounds.min_x + bounds.max_x) / 2;
  const centerZ = (bounds.min_z + bounds.max_z) / 2;

  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={[centerX, 0.05, centerZ]}>
      <mesh
        ref={ref}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onClick(zone)}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial
          color={zone.color_code || '#00f5ff'}
          transparent
          opacity={hovered ? 0.4 : 0.2}
        />
      </mesh>
      
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
        <lineBasicMaterial color={zone.color_code || '#00f5ff'} />
      </lineSegments>

      <Text
        position={[0, 0.3, 0]}
        fontSize={0.15}
        color={zone.color_code || '#00f5ff'}
        anchorX="center"
      >
        {zone.zone_name}
      </Text>

      {hovered && (
        <Html position={[0, 0.6, 0]} center>
          <div className="bg-black/90 text-white px-3 py-2 rounded text-xs min-w-32">
            <p className="font-bold text-cyan-400">{zone.zone_type}</p>
            <p className="text-white/70">Heat: {zone.activity_heat_score}%</p>
            <p className="text-white/70">Occupancy: {zone.real_time_occupancy}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function AgentMarker({ agent, position }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={ref} position={position}>
      <Sphere args={[0.15, 32, 32]}>
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.7}
        />
      </Sphere>
      <Sphere args={[0.25, 16, 16]}>
        <meshBasicMaterial color="#a855f7" transparent opacity={0.2} wireframe />
      </Sphere>
    </group>
  );
}

function DeviceMarker({ device, position }) {
  return (
    <group position={position}>
      <Box args={[0.2, 0.2, 0.2]}>
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.5}
        />
      </Box>
    </group>
  );
}

function Room({ dimensions = { width: 12, height: 3, depth: 10 } }) {
  return (
    <group>
      <Box args={[dimensions.width, 0.05, dimensions.depth]} position={[dimensions.width/2, 0, dimensions.depth/2]}>
        <meshStandardMaterial color="#1a1a2e" />
      </Box>
      
      <Grid
        args={[dimensions.width, dimensions.depth]}
        position={[dimensions.width/2, 0.03, dimensions.depth/2]}
        cellColor="#334155"
        sectionColor="#475569"
      />

      {/* Walls */}
      <Box args={[dimensions.width, dimensions.height, 0.1]} position={[dimensions.width/2, dimensions.height/2, 0]}>
        <meshStandardMaterial color="#16213e" transparent opacity={0.3} />
      </Box>
      <Box args={[0.1, dimensions.height, dimensions.depth]} position={[0, dimensions.height/2, dimensions.depth/2]}>
        <meshStandardMaterial color="#16213e" transparent opacity={0.3} />
      </Box>
    </group>
  );
}

export default function SpatialZoneVisualizer3D({ zones = [], agents = [], devices = [], onZoneClick }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [12, 8, 12], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-5, 10, -5]} intensity={0.5} color="#a855f7" />

        <Text
          position={[6, 4, 5]}
          fontSize={0.4}
          color="white"
          anchorX="center"
        >
          Spatial Zone Map
        </Text>

        <Room dimensions={{ width: 12, height: 3, depth: 10 }} />

        {zones.map((zone, idx) => (
          <Zone3D
            key={zone.id || idx}
            zone={zone}
            onClick={onZoneClick || (() => {})}
          />
        ))}

        {agents.map((agent, idx) => (
          <AgentMarker
            key={agent.id || idx}
            agent={agent}
            position={[
              3 + idx * 2,
              0.5,
              5 + Math.sin(idx) * 2
            ]}
          />
        ))}

        {devices.map((device, idx) => (
          <DeviceMarker
            key={device.id || idx}
            device={device}
            position={[
              1 + (idx % 4) * 3,
              0.3,
              1 + Math.floor(idx / 4) * 3
            ]}
          />
        ))}

        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}