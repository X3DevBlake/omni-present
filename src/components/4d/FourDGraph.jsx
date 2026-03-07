import React, { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { project4Dto3D, FourDAxes } from './FourDEngine';

// Generate mock 4D dataset
export function generateMockData(count = 100, type = 'random') {
  const data = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    let point;
    switch (type) {
      case 'spiral':
        point = {
          x: Math.cos(t * Math.PI * 6) * (1 + t),
          y: Math.sin(t * Math.PI * 6) * (1 + t),
          z: t * 3 - 1.5,
          w: Math.sin(t * Math.PI * 2) * 1.5,
          label: `Point ${i}`,
          value: Math.round(t * 100),
          category: t < 0.33 ? 'low' : t < 0.66 ? 'mid' : 'high',
        };
        break;
      case 'clusters':
        const cluster = Math.floor(Math.random() * 4);
        const offsets = [[1, 1, 1, 1], [-1, 1, -1, 1], [1, -1, 1, -1], [-1, -1, -1, -1]];
        point = {
          x: offsets[cluster][0] + (Math.random() - 0.5) * 0.8,
          y: offsets[cluster][1] + (Math.random() - 0.5) * 0.8,
          z: offsets[cluster][2] + (Math.random() - 0.5) * 0.8,
          w: offsets[cluster][3] + (Math.random() - 0.5) * 0.8,
          label: `Cluster ${cluster} - ${i}`,
          value: Math.round(Math.random() * 100),
          category: ['alpha', 'beta', 'gamma', 'delta'][cluster],
        };
        break;
      case 'surface':
        const u = (Math.random() - 0.5) * 4;
        const v = (Math.random() - 0.5) * 4;
        point = {
          x: u,
          y: v,
          z: Math.sin(u) * Math.cos(v),
          w: Math.cos(u * v * 0.5),
          label: `Surface ${i}`,
          value: Math.round((Math.sin(u) * Math.cos(v) + 1) * 50),
          category: u > 0 ? 'positive' : 'negative',
        };
        break;
      default:
        point = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 3,
          z: (Math.random() - 0.5) * 3,
          w: (Math.random() - 0.5) * 3,
          label: `Data ${i}`,
          value: Math.round(Math.random() * 100),
          category: Math.random() > 0.5 ? 'A' : 'B',
        };
    }
    data.push(point);
  }
  return data;
}

const CATEGORY_COLORS = {
  low: '#22c55e',
  mid: '#eab308',
  high: '#ef4444',
  alpha: '#a855f7',
  beta: '#22d3ee',
  gamma: '#ec4899',
  delta: '#f97316',
  positive: '#22d3ee',
  negative: '#ef4444',
  A: '#a855f7',
  B: '#22d3ee',
};

function DataPoint({ point, viewAngle, selected, onSelect }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const pos3D = useMemo(
    () => project4Dto3D(point.x, point.y, point.z, point.w, viewAngle),
    [point, viewAngle]
  );
  const color = CATEGORY_COLORS[point.category] || '#ffffff';

  useFrame(() => {
    if (meshRef.current) {
      const s = hovered || selected ? 1.8 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
    }
  });

  return (
    <group position={pos3D}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect?.(point)}
      >
        <octahedronGeometry args={[0.05, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered || selected ? 3 : 1}
          transparent
          opacity={0.9}
        />
      </mesh>
      {(hovered || selected) && (
        <Html center distanceFactor={5}>
          <div className="bg-black/95 border border-purple-500/40 rounded-lg px-3 py-2 text-[10px] text-white whitespace-nowrap backdrop-blur-xl shadow-lg shadow-purple-500/20">
            <div className="font-bold text-purple-400 text-xs">{point.label}</div>
            <div className="text-white/60 mt-1">
              Value: <span className="text-cyan-400">{point.value}</span>
            </div>
            <div className="text-white/40">
              4D: [{point.x.toFixed(1)}, {point.y.toFixed(1)}, {point.z.toFixed(1)}, {point.w.toFixed(1)}]
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Connection lines between related points
function DataConnections({ data, viewAngle, maxDist = 0.8 }) {
  const lines = useMemo(() => {
    const result = [];
    for (let i = 0; i < Math.min(data.length, 50); i++) {
      for (let j = i + 1; j < Math.min(data.length, 50); j++) {
        if (data[i].category === data[j].category) {
          const dx = data[i].x - data[j].x;
          const dy = data[i].y - data[j].y;
          const dz = data[i].z - data[j].z;
          const dw = data[i].w - data[j].w;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
          if (dist < maxDist) {
            const p1 = project4Dto3D(data[i].x, data[i].y, data[i].z, data[i].w, viewAngle);
            const p2 = project4Dto3D(data[j].x, data[j].y, data[j].z, data[j].w, viewAngle);
            result.push({ p1, p2, color: CATEGORY_COLORS[data[i].category] || '#ffffff' });
          }
        }
      }
    }
    return result;
  }, [data, viewAngle, maxDist]);

  return (
    <>
      {lines.map((line, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...line.p1, ...line.p2])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={line.color} transparent opacity={0.15} />
        </line>
      ))}
    </>
  );
}

// Main 4D Graph component
export default function FourDGraph({
  data = [],
  showAxes = true,
  showConnections = true,
  autoRotateW = true,
  rotateSpeed = 0.2,
  onSelectPoint,
}) {
  const [viewAngle, setViewAngle] = useState(0);
  const [selectedPoint, setSelectedPoint] = useState(null);

  useFrame((_, delta) => {
    if (autoRotateW) {
      setViewAngle(prev => prev + delta * rotateSpeed);
    }
  });

  const handleSelect = useCallback((point) => {
    setSelectedPoint(point);
    onSelectPoint?.(point);
  }, [onSelectPoint]);

  return (
    <group>
      {showAxes && <FourDAxes size={2} viewAngle={viewAngle} />}
      {showConnections && <DataConnections data={data} viewAngle={viewAngle} />}
      {data.map((point, i) => (
        <DataPoint
          key={i}
          point={point}
          viewAngle={viewAngle}
          selected={selectedPoint === point}
          onSelect={handleSelect}
        />
      ))}
    </group>
  );
}
