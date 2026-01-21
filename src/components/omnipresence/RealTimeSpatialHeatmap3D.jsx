import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

function HeatmapCell({ x, z, heat, size, onClick }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  const getHeatColor = (value) => {
    if (value > 70) return '#ef4444';
    if (value > 40) return '#f59e0b';
    return '#10b981';
  };

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = (heat / 100) * 0.5 + Math.sin(state.clock.elapsedTime + x + z) * 0.05;
    }
  });

  return (
    <Box
      ref={ref}
      args={[size, (heat / 100) * 0.5 + 0.1, size]}
      position={[x, 0, z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onClick(x, z, heat)}
    >
      <meshStandardMaterial
        color={getHeatColor(heat)}
        emissive={getHeatColor(heat)}
        emissiveIntensity={0.4}
        transparent
        opacity={0.7}
      />
      {hovered && (
        <Html position={[0, 0.3, 0]} center>
          <div className="bg-black/90 text-white px-2 py-1 rounded text-xs">
            Heat: {heat}%
          </div>
        </Html>
      )}
    </Box>
  );
}

function useState(initial) {
  return React.useState(initial);
}

export default function RealTimeSpatialHeatmap3D({ zones = [], gridSize = 12 }) {
  const cellSize = 1;
  const cells = gridSize;

  const heatmap = Array.from({ length: cells }, (_, x) =>
    Array.from({ length: cells }, (_, z) => {
      const matchingZone = zones.find(zone => {
        const bounds = zone.boundaries || {};
        return x >= (bounds.min_x || 0) && x <= (bounds.max_x || 12) &&
               z >= (bounds.min_z || 0) && z <= (bounds.max_z || 12);
      });
      return matchingZone?.activity_heat_score || Math.random() * 30;
    })
  );

  const handleCellClick = (x, z, heat) => {
    console.log(`Cell (${x}, ${z}): ${heat}% heat`);
  };

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [8, 10, 8], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-5, 10, -5]} intensity={0.5} color="#a855f7" />

        <Text
          position={[cells * cellSize / 2, 3, cells * cellSize / 2]}
          fontSize={0.5}
          color="white"
          anchorX="center"
        >
          Activity Heatmap
        </Text>

        {heatmap.map((row, x) =>
          row.map((heat, z) => (
            <HeatmapCell
              key={`${x}-${z}`}
              x={x * cellSize}
              z={z * cellSize}
              heat={heat}
              size={cellSize * 0.9}
              onClick={handleCellClick}
            />
          ))
        )}

        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}