import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Trail, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Adaptive energy particles flowing through the loop
function EnergyParticles({ count = 200, systemActivity = 0.5 }) {
  const particles = useRef();
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const scale = 2 + Math.cos(t) * 0.8;
      positions[i * 3] = Math.cos(t) * scale;
      positions[i * 3 + 1] = Math.sin(t * 2) * 0.3;
      positions[i * 3 + 2] = Math.sin(t) * scale;
      
      // Color based on activity
      const hue = 0.5 + systemActivity * 0.3;
      colors[i * 3] = hue;
      colors[i * 3 + 1] = 0.8;
      colors[i * 3 + 2] = 1;
    }
    return { positions, colors };
  }, [count, systemActivity]);

  useFrame((state) => {
    if (particles.current) {
      const positions = particles.current.geometry.attributes.position.array;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < count; i++) {
        const t = ((i / count) * Math.PI * 2 + time * (0.5 + systemActivity)) % (Math.PI * 2);
        const scale = 2 + Math.cos(t) * 0.8;
        positions[i * 3] = Math.cos(t) * scale;
        positions[i * 3 + 1] = Math.sin(t * 2) * 0.3 + Math.sin(time * 3 + i) * 0.1;
        positions[i * 3 + 2] = Math.sin(t) * scale;
      }
      particles.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlePositions.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04 + systemActivity * 0.03}
        color={new THREE.Color().setHSL(0.55 + systemActivity * 0.15, 0.9, 0.6)}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Dynamic infinity loop with morphing capabilities
function DynamicInfinityLoop({ systemActivity = 0.5, dataTransferActive = false }) {
  const loopRef = useRef();
  const glowRef = useRef();
  const coreRef = useRef();

  const curve = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * Math.PI * 2;
      const scale = 2;
      points.push(new THREE.Vector3(
        Math.cos(t) * scale / (1 + Math.sin(t) ** 2),
        0,
        Math.sin(t) * Math.cos(t) * scale / (1 + Math.sin(t) ** 2)
      ));
    }
    return new THREE.CatmullRomCurve3(points, true);
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (loopRef.current) {
      loopRef.current.rotation.y = time * 0.15;
      loopRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
      
      // Pulse based on activity
      const pulse = 1 + Math.sin(time * (2 + systemActivity * 3)) * 0.05 * systemActivity;
      loopRef.current.scale.setScalar(pulse);
    }
    
    if (glowRef.current) {
      glowRef.current.rotation.y = -time * 0.1;
      glowRef.current.material.opacity = 0.15 + Math.sin(time * 2) * 0.05 + systemActivity * 0.1;
    }
    
    if (coreRef.current) {
      const corePulse = 1 + Math.sin(time * 4) * 0.15;
      coreRef.current.scale.setScalar(corePulse);
      coreRef.current.material.emissiveIntensity = 0.5 + systemActivity * 0.8 + Math.sin(time * 5) * 0.2;
    }
  });

  const baseColor = new THREE.Color().setHSL(0.55 + systemActivity * 0.1, 0.9, 0.5);
  const glowColor = new THREE.Color().setHSL(0.6, 0.8, 0.6);

  return (
    <group ref={loopRef}>
      {/* Main loop */}
      <mesh>
        <tubeGeometry args={[curve, 100, 0.08, 16, true]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={0.8 + systemActivity * 0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Outer glow */}
      <mesh ref={glowRef}>
        <tubeGeometry args={[curve, 100, 0.15, 16, true]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.2} />
      </mesh>

      {/* Inner core trail */}
      <mesh>
        <tubeGeometry args={[curve, 100, 0.03, 8, true]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>

      {/* Energy core */}
      <Sphere ref={coreRef} args={[0.25, 32, 32]}>
        <MeshDistortMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={1.2}
          distort={0.3 + systemActivity * 0.2}
          speed={3}
          metalness={0.5}
          roughness={0}
        />
      </Sphere>

      {/* Data transfer ripple effect */}
      {dataTransferActive && (
        <DataRippleEffect />
      )}
    </group>
  );
}

// Data ripple effect for significant data processing
function DataRippleEffect() {
  const rippleRef = useRef();
  
  useFrame((state) => {
    if (rippleRef.current) {
      const time = state.clock.elapsedTime;
      const scale = 1 + (time % 2) * 1.5;
      rippleRef.current.scale.setScalar(scale);
      rippleRef.current.material.opacity = Math.max(0, 0.6 - (time % 2) * 0.3);
    }
  });

  return (
    <mesh ref={rippleRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.8, 1, 64]} />
      <meshBasicMaterial color="#00f5ff" transparent opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Orbiting data spheres representing active agents/processes
function OrbitingDataSpheres({ agentCount = 5, systemActivity = 0.5 }) {
  const spheresRef = useRef([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    spheresRef.current.forEach((sphere, i) => {
      if (sphere) {
        const angle = (i / agentCount) * Math.PI * 2 + time * (0.5 + systemActivity * 0.5);
        const radius = 2.8 + Math.sin(time * 2 + i) * 0.2;
        sphere.position.x = Math.cos(angle) * radius;
        sphere.position.z = Math.sin(angle) * radius;
        sphere.position.y = Math.sin(time * 3 + i * 2) * 0.3;
        sphere.rotation.y = time * 2;
      }
    });
  });

  const colors = ['#00f5ff', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];

  return (
    <group>
      {Array.from({ length: Math.min(agentCount, 8) }).map((_, i) => (
        <group key={i} ref={el => spheresRef.current[i] = el}>
          <Trail width={0.3} length={6} color={colors[i % colors.length]} attenuation={(t) => t * t}>
            <Sphere args={[0.08, 16, 16]}>
              <meshStandardMaterial
                color={colors[i % colors.length]}
                emissive={colors[i % colors.length]}
                emissiveIntensity={0.8}
              />
            </Sphere>
          </Trail>
        </group>
      ))}
    </group>
  );
}

// Reactive background rings
function ReactiveBackgroundRings({ systemActivity = 0.5, alertLevel = 0 }) {
  const ringsRef = useRef([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    ringsRef.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.x = time * (0.1 + i * 0.05) * (i % 2 === 0 ? 1 : -1);
        ring.rotation.y = time * (0.08 + i * 0.03);
        ring.rotation.z = Math.sin(time + i) * 0.2;
        
        // Alert pulse
        if (alertLevel > 0 && i === 0) {
          ring.material.opacity = 0.1 + Math.sin(time * 8) * 0.1 * alertLevel;
        }
      }
    });
  });

  const ringConfigs = [
    { radius: 3.5, color: alertLevel > 0 ? '#ef4444' : '#00f5ff' },
    { radius: 4, color: '#a855f7' },
    { radius: 4.5, color: '#3b82f6' },
    { radius: 5, color: '#06b6d4' },
  ];

  return (
    <group>
      {ringConfigs.map((config, i) => (
        <mesh key={i} ref={el => ringsRef.current[i] = el}>
          <torusGeometry args={[config.radius, 0.02, 8, 100]} />
          <meshBasicMaterial color={config.color} transparent opacity={0.15 + systemActivity * 0.1} />
        </mesh>
      ))}
    </group>
  );
}

// Holographic grid floor
function HolographicGrid() {
  const gridRef = useRef();

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.material.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  const gridMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color('#00f5ff') }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec2 vUv;
        
        void main() {
          vec2 grid = abs(fract(vUv * 20.0 - 0.5) - 0.5) / fwidth(vUv * 20.0);
          float line = min(grid.x, grid.y);
          float alpha = 1.0 - min(line, 1.0);
          alpha *= 0.3 + sin(time + vUv.x * 10.0) * 0.1;
          alpha *= smoothstep(0.0, 0.3, 1.0 - length(vUv - 0.5) * 1.5);
          gl_FragColor = vec4(color, alpha * 0.4);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
  }, []);

  return (
    <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} material={gridMaterial}>
      <planeGeometry args={[15, 15]} />
    </mesh>
  );
}

// Main Ultra Logo Component
function UltraLogoScene({ systemActivity = 0.5, agentCount = 5, dataTransferActive = false, alertLevel = 0 }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#00f5ff" />
      <pointLight position={[-5, 3, -5]} intensity={0.8} color="#a855f7" />
      <pointLight position={[0, -3, 5]} intensity={0.5} color="#ec4899" />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <DynamicInfinityLoop systemActivity={systemActivity} dataTransferActive={dataTransferActive} />
      </Float>

      <EnergyParticles count={300} systemActivity={systemActivity} />
      <OrbitingDataSpheres agentCount={agentCount} systemActivity={systemActivity} />
      <ReactiveBackgroundRings systemActivity={systemActivity} alertLevel={alertLevel} />
      <HolographicGrid />

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
    </>
  );
}

export default function UltraOmniLoopLogo3D({ 
  systemActivity = 0.5, 
  agentCount = 5, 
  dataTransferActive = false, 
  alertLevel = 0,
  className = ""
}) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
        <UltraLogoScene
          systemActivity={systemActivity}
          agentCount={agentCount}
          dataTransferActive={dataTransferActive}
          alertLevel={alertLevel}
        />
      </Canvas>
    </div>
  );
}