import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Text, Stars, Trail } from '@react-three/drei';
import * as THREE from 'three';

function HubPortal({ position, color, label, metrics, onClick, isSelected, onHover }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      if (isSelected) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.1);
      } else if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Outer Glow Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2, 0.05, 16, 100]} />
          <meshBasicMaterial color={color} opacity={0.3} transparent />
        </mesh>

        {/* Main Portal Sphere */}
        <Sphere
          ref={meshRef}
          args={[1.5, 64, 64]}
          onClick={onClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHover && onHover(true, label, metrics);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
            onHover && onHover(false);
            document.body.style.cursor = 'default';
          }}
        >
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            emissive={color}
            emissiveIntensity={hovered ? 0.8 : 0.4}
          />
        </Sphere>

        {/* Inner Core */}
        <Sphere args={[0.8, 32, 32]}>
          <meshBasicMaterial color={color} opacity={0.6} transparent />
        </Sphere>

        {/* Label */}
        <Text
          position={[0, -2.5, 0]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          {label}
        </Text>

        {/* Particle Ring */}
        {hovered && (
          <Trail
            width={0.1}
            length={10}
            color={color}
            attenuation={(t) => t * t}
          >
            <mesh>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </Trail>
        )}
      </Float>

      {/* Connection Lines to Center */}
      <mesh>
        <tubeGeometry args={[
          new THREE.LineCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(-position[0] * 0.5, -position[1] * 0.5, -position[2] * 0.5)
          ),
          20,
          0.02,
          8,
          false
        ]} />
        <meshBasicMaterial color={color} opacity={0.2} transparent />
      </mesh>
    </group>
  );
}

function CentralCore() {
  const coreRef = useRef();
  const particlesRef = useRef();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 1000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 3 + Math.random() * 2;
      
      temp.push({
        position: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        ],
        speed: 0.5 + Math.random() * 0.5,
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6)
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.002;
      coreRef.current.rotation.x += 0.001;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group>
      {/* Central Core Sphere */}
      <Sphere ref={coreRef} args={[2, 64, 64]}>
        <MeshDistortMaterial
          color="#00f5ff"
          distort={0.6}
          speed={3}
          roughness={0.1}
          metalness={0.9}
          emissive="#00f5ff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Inner Glow */}
      <Sphere args={[2.2, 32, 32]}>
        <meshBasicMaterial color="#00f5ff" opacity={0.1} transparent side={THREE.BackSide} />
      </Sphere>

      {/* Particle Cloud */}
      <group ref={particlesRef}>
        {particles.map((particle, i) => (
          <mesh key={i} position={particle.position}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color={particle.color} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function DataStreams() {
  const streamsRef = useRef();

  useFrame((state) => {
    if (streamsRef.current) {
      streamsRef.current.rotation.y += 0.001;
    }
  });

  const streams = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      const radius = 8;
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(Math.cos(angle) * radius, -5, Math.sin(angle) * radius),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle + Math.PI) * radius, 5, Math.sin(angle + Math.PI) * radius)
      );
      temp.push(curve);
    }
    return temp;
  }, []);

  return (
    <group ref={streamsRef}>
      {streams.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 20, 0.01, 8, false]} />
          <meshBasicMaterial
            color={new THREE.Color().setHSL(i / streams.length, 0.8, 0.5)}
            opacity={0.3}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

export default function ImmersiveNavEnvironment({ hubData, onHubClick, selectedHub, controlMode }) {
  const [hoveredHub, setHoveredHub] = useState(null);

  const hubPositions = {
    home: [0, 6, 0],
    agents: [-8, 2, -5],
    banking: [8, 2, -5],
    ailab: [-6, -2, 5],
    simulation: [6, -2, 5],
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={1} color="#00f5ff" />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#a855f7" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />

      {/* Background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade speed={1} />
      
      {/* Fog */}
      <fog attach="fog" args={['#000000', 20, 50]} />

      {/* Central Core */}
      <CentralCore />

      {/* Data Streams */}
      <DataStreams />

      {/* Hub Portals */}
      {Object.entries(hubData).map(([key, hub]) => (
        <HubPortal
          key={key}
          position={hubPositions[key]}
          color={hub.color}
          label={hub.name}
          metrics={hub.metrics}
          onClick={() => onHubClick(hub.name, hub.path)}
          isSelected={selectedHub === hub.name}
          onHover={(hovered, label, metrics) => {
            if (hovered) {
              setHoveredHub({ label, metrics });
            } else {
              setHoveredHub(null);
            }
          }}
        />
      ))}

      {/* Camera Controls */}
      <OrbitControls
        enablePan={controlMode === 'fps'}
        enableZoom={true}
        maxDistance={30}
        minDistance={10}
        autoRotate={controlMode === 'orbit'}
        autoRotateSpeed={0.5}
      />
    </>
  );
}