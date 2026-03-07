import React, { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// Generate Earth geometry with continent outlines
function generateContinentPoints() {
  // Simplified continent outlines as lat/lon pairs
  const continents = {
    northAmerica: [
      [70, -160], [72, -130], [68, -100], [60, -95], [50, -60], [45, -65],
      [30, -80], [25, -80], [20, -105], [15, -90], [10, -85], [15, -75],
      [30, -115], [35, -120], [48, -125], [55, -130], [60, -150], [65, -168],
    ],
    southAmerica: [
      [10, -75], [5, -77], [0, -80], [-5, -80], [-10, -78], [-15, -75],
      [-20, -70], [-25, -65], [-35, -57], [-40, -62], [-45, -65], [-50, -70],
      [-55, -68], [-50, -75], [-40, -73], [-30, -70], [-20, -40], [-10, -35],
      [-5, -35], [0, -50], [5, -60], [10, -72],
    ],
    europe: [
      [35, -10], [37, -5], [43, -8], [47, -1], [48, 3], [51, 5], [54, 10],
      [55, 12], [57, 10], [60, 5], [62, 5], [65, 12], [70, 20], [70, 30],
      [65, 30], [60, 28], [55, 22], [50, 20], [47, 15], [45, 12], [42, 15],
      [38, 12], [37, 15], [35, 25], [35, -5],
    ],
    africa: [
      [35, -5], [37, 10], [33, 12], [30, 32], [22, 37], [12, 44], [5, 42],
      [0, 42], [-5, 40], [-10, 40], [-15, 35], [-20, 35], [-25, 33],
      [-30, 30], [-35, 20], [-34, 18], [-30, 17], [-20, 12], [-15, 12],
      [-5, 10], [0, 10], [5, 1], [5, -5], [10, -15], [15, -17], [20, -17],
      [25, -15], [30, -10], [35, -5],
    ],
    asia: [
      [70, 30], [70, 60], [70, 90], [72, 120], [70, 140], [65, 170],
      [55, 163], [50, 140], [45, 135], [35, 130], [30, 122], [22, 115],
      [20, 110], [10, 105], [5, 100], [0, 105], [-5, 105], [-8, 115],
      [-5, 120], [0, 130], [5, 120], [15, 100], [20, 95], [25, 90],
      [28, 85], [25, 68], [30, 65], [35, 60], [40, 50], [42, 45],
      [38, 35], [35, 35], [35, 25], [40, 28], [45, 40], [50, 55],
      [55, 60], [60, 55], [65, 40], [70, 30],
    ],
    australia: [
      [-12, 130], [-12, 142], [-18, 147], [-24, 153], [-28, 153],
      [-33, 152], [-37, 150], [-38, 145], [-35, 137], [-32, 133],
      [-32, 128], [-25, 114], [-22, 114], [-15, 125], [-12, 130],
    ],
  };

  return continents;
}

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Continent Outline
function ContinentOutline({ points, radius, color = '#22d3ee' }) {
  const linePoints = useMemo(() => {
    return points.map(([lat, lon]) => latLonToVector3(lat, lon, radius + 0.005));
  }, [points, radius]);

  if (linePoints.length < 2) return null;

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={linePoints.length}
          array={new Float32Array(linePoints.flatMap(v => [v.x, v.y, v.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.7} linewidth={2} />
    </line>
  );
}

// Data marker on globe
function GlobeMarker({ lat, lon, radius, color = '#ef4444', label, value, size = 0.02 }) {
  const pos = useMemo(() => latLonToVector3(lat, lon, radius + 0.01), [lat, lon, radius]);
  const beamEnd = useMemo(() => latLonToVector3(lat, lon, radius + 0.05 + (value || 0) * 0.001), [lat, lon, radius, value]);
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.2);
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={pos}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
      </mesh>
      {/* Beam */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([pos.x, pos.y, pos.z, beamEnd.x, beamEnd.y, beamEnd.z])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.4} />
      </line>
      {hovered && (
        <Html position={[beamEnd.x, beamEnd.y, beamEnd.z]} center>
          <div className="bg-black/90 border border-white/20 rounded-lg px-3 py-2 text-xs text-white whitespace-nowrap backdrop-blur-xl">
            <div className="font-bold text-cyan-400">{label}</div>
            {value !== undefined && <div className="text-white/70">{value}</div>}
          </div>
        </Html>
      )}
    </group>
  );
}

// Connection arc between two points on globe
function GlobeConnection({ from, to, radius, color = '#a855f7' }) {
  const curve = useMemo(() => {
    const start = latLonToVector3(from[0], from[1], radius);
    const end = latLonToVector3(to[0], to[1], radius);
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(radius * 1.3);
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [from, to, radius]);

  const points = useMemo(() => curve.getPoints(50), [curve]);
  const positions = useMemo(() => new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), [points]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={points.length} array={positions} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.35} />
    </line>
  );
}

// Atmosphere glow
function Atmosphere({ radius }) {
  return (
    <Sphere args={[radius * 1.05, 64, 64]}>
      <meshStandardMaterial
        color="#4488ff"
        transparent
        opacity={0.08}
        side={THREE.BackSide}
      />
    </Sphere>
  );
}

// Grid lines
function GlobeGrid({ radius }) {
  const lines = useMemo(() => {
    const result = [];
    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts = [];
      for (let lon = -180; lon <= 180; lon += 5) {
        pts.push(latLonToVector3(lat, lon, radius + 0.002));
      }
      result.push(pts);
    }
    // Longitude lines
    for (let lon = -180; lon < 180; lon += 30) {
      const pts = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        pts.push(latLonToVector3(lat, lon, radius + 0.002));
      }
      result.push(pts);
    }
    return result;
  }, [radius]);

  return (
    <>
      {lines.map((pts, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={pts.length}
              array={new Float32Array(pts.flatMap(v => [v.x, v.y, v.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#1e3a5f" transparent opacity={0.15} />
        </line>
      ))}
    </>
  );
}

// Main Earth component
export default function Earth4D({
  radius = 1.5,
  markers = [],
  connections = [],
  autoRotate = true,
  rotateSpeed = 0.15,
  showGrid = true,
  showAtmosphere = true,
  continentColor = '#22d3ee',
  oceanColor = '#0a1628',
}) {
  const earthRef = useRef();
  const continents = useMemo(() => generateContinentPoints(), []);

  useFrame((_, delta) => {
    if (earthRef.current && autoRotate) {
      earthRef.current.rotation.y += delta * rotateSpeed;
    }
  });

  return (
    <group ref={earthRef}>
      {/* Ocean sphere */}
      <Sphere args={[radius, 64, 64]}>
        <meshStandardMaterial
          color={oceanColor}
          roughness={0.8}
          metalness={0.1}
          transparent
          opacity={0.95}
        />
      </Sphere>

      {showAtmosphere && <Atmosphere radius={radius} />}
      {showGrid && <GlobeGrid radius={radius} />}

      {/* Continent outlines */}
      {Object.values(continents).map((pts, i) => (
        <ContinentOutline key={i} points={pts} radius={radius} color={continentColor} />
      ))}

      {/* Data markers */}
      {markers.map((marker, i) => (
        <GlobeMarker
          key={i}
          lat={marker.lat}
          lon={marker.lon}
          radius={radius}
          color={marker.color || '#ef4444'}
          label={marker.label}
          value={marker.value}
          size={marker.size || 0.02}
        />
      ))}

      {/* Connections between points */}
      {connections.map((conn, i) => (
        <GlobeConnection
          key={i}
          from={conn.from}
          to={conn.to}
          radius={radius}
          color={conn.color || '#a855f7'}
        />
      ))}
    </group>
  );
}
