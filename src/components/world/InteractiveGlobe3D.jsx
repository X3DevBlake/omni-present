import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

function GlobeMarker({ position, event, onClick }) {
  const markerRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (markerRef.current) {
      markerRef.current.scale.lerp(
        new THREE.Vector3(hovered ? 0.15 : 0.1, hovered ? 0.15 : 0.1, hovered ? 0.15 : 0.1),
        0.1
      );
    }
  });

  const color = event.severity === 'critical' ? '#ef4444' :
                event.severity === 'high' ? '#f97316' :
                event.severity === 'medium' ? '#eab308' : '#3b82f6';

  return (
    <group position={position}>
      <Sphere
        ref={markerRef}
        args={[0.1, 16, 16]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.9}
        />
      </Sphere>
      {hovered && (
        <Html position={[0, 0.3, 0]} center>
          <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 min-w-[200px]">
            <p className="text-white font-bold text-sm mb-1">{event.event_name}</p>
            <p className="text-slate-400 text-xs mb-2">{event.region}</p>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs ${
                event.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                event.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                event.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {event.severity}
              </span>
            </div>
          </div>
        </Html>
      )}
      {/* Pulse Effect */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function DeviceMarker({ position, device }) {
  return (
    <group position={position}>
      <Sphere args={[0.05, 8, 8]}>
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  );
}

function Globe({ events, devices }) {
  const globeRef = useRef();

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });

  // Convert lat/long to 3D coordinates
  const latLongToVector3 = (lat, lon, radius = 2) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return [x, y, z];
  };

  const eventMarkers = useMemo(() => {
    return events
      .filter(e => e.coordinates?.latitude && e.coordinates?.longitude)
      .map(event => ({
        position: latLongToVector3(event.coordinates.latitude, event.coordinates.longitude),
        event
      }));
  }, [events]);

  const deviceMarkers = useMemo(() => {
    return devices
      .filter(d => d.metadata?.location?.latitude && d.metadata?.location?.longitude)
      .map(device => ({
        position: latLongToVector3(
          device.metadata.location.latitude,
          device.metadata.location.longitude
        ),
        device
      }));
  }, [devices]);

  return (
    <group ref={globeRef}>
      {/* Earth Sphere */}
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.3}
          roughness={0.7}
          wireframe={false}
        />
      </Sphere>

      {/* Continents (simplified overlay) */}
      <Sphere args={[2.01, 64, 64]}>
        <meshBasicMaterial
          color="#334155"
          transparent
          opacity={0.3}
          wireframe
        />
      </Sphere>

      {/* Event Markers */}
      {eventMarkers.map((marker, idx) => (
        <GlobeMarker
          key={`event-${idx}`}
          position={marker.position}
          event={marker.event}
          onClick={() => console.log('Event clicked:', marker.event)}
        />
      ))}

      {/* Device Markers */}
      {deviceMarkers.map((marker, idx) => (
        <DeviceMarker
          key={`device-${idx}`}
          position={marker.position}
          device={marker.device}
        />
      ))}

      {/* Atmosphere Glow */}
      <Sphere args={[2.3, 64, 64]}>
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
}

export default function InteractiveGlobe3D({ events, devices, weatherData, onRegionClick }) {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={0.8} color="#22d3ee" />

      <Globe events={events} devices={devices} />

      <OrbitControls
        enableZoom={true}
        minDistance={4}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}