import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const componentsData = [
  { position: [0, 0, 0], size: [0.8, 0.8, 0.8], color: '#00f5ff', label: 'Neural Core', connections: [1, 2], load: 85 },
  { position: [1.5, 0, 0], size: [0.5, 0.5, 0.5], color: '#a855f7', label: 'GPU Array 1', connections: [0, 5], load: 92 },
  { position: [-1.5, 0, 0], size: [0.5, 0.5, 0.5], color: '#a855f7', label: 'GPU Array 2', connections: [0, 5], load: 78 },
  { position: [0, 1.2, 0], size: [0.4, 0.3, 0.6], color: '#ec4899', label: 'Memory Pool', connections: [0, 4], load: 65 },
  { position: [0, -1.2, 0], size: [0.4, 0.3, 0.6], color: '#ec4899', label: 'Storage Layer', connections: [0, 3], load: 45 },
  { position: [0, 0, 1.2], size: [0.3, 0.3, 0.3], color: '#3b82f6', label: 'Network Hub', connections: [1, 2, 6], load: 88 },
  { position: [0, 0, -1.2], size: [0.3, 0.3, 0.3], color: '#3b82f6', label: 'I/O Controller', connections: [5], load: 55 },
];

function AnimatedConnectionLine({ start, end, color, active }) {
  const lineRef = useRef();
  const [particleOffset, setParticleOffset] = useState(0);

  useFrame((state) => {
    setParticleOffset((prev) => (prev + 0.02) % 1);
    if (lineRef.current && active) {
      lineRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const points = [startVec, endVec];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const particlePos = startVec.clone().lerp(endVec, particleOffset);

  return (
    <group>
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial color={color} opacity={0.3} transparent linewidth={2} />
      </line>
      {active && (
        <mesh position={[particlePos.x, particlePos.y, particlePos.z]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}
    </group>
  );
}

function ConnectionLines({ components, showConnections }) {
  if (!showConnections) return null;
  
  return (
    <group>
      {components.map((comp, i) => {
        if (!comp.connections) return null;
        return comp.connections.map(targetIdx => {
          if (targetIdx >= components.length) return null;
          const target = components[targetIdx];
          const isActive = comp.load > 70 || target.load > 70;
          
          return (
            <AnimatedConnectionLine
              key={`${i}-${targetIdx}`}
              start={comp.position}
              end={target.position}
              color={comp.color}
              active={isActive}
            />
          );
        });
      })}
    </group>
  );
}

function CollaboratorCursor({ position, name, color }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function PerformanceOverlay({ component, position }) {
  const load = component.load || 0;
  const color = load > 80 ? '#ff4444' : load > 60 ? '#ffaa00' : '#00ff88';
  
  return (
    <group position={position}>
      <mesh position={[0, component.size[1] / 2 + 0.5, 0]}>
        <ringGeometry args={[0.15, 0.2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, component.size[1] / 2 + 0.5, 0]} rotation={[0, 0, -Math.PI / 2 + (load / 100) * Math.PI * 2]}>
        <ringGeometry args={[0.15, 0.2, 32, 1, 0, (load / 100) * Math.PI * 2]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function BlueprintComponent({ component, index, exploded, scrollProgress, isSelected, onClick, buildMode, onBuildModeClick, showPerformance }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useFrame((state) => {
    if (meshRef.current) {
      const targetScale = hovered || isSelected ? 1.15 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      if (!buildMode && !exploded) {
        meshRef.current.rotation.y = scrollProgress * Math.PI * 2 + index * 0.5;
      }

      if (isSelected) {
        meshRef.current.rotation.y += 0.01;
      }

      // Pulse based on load
      const load = component.load || 0;
      if (load > 70) {
        setPulseIntensity(0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.3);
      } else {
        setPulseIntensity(0.2);
      }
    }
  });

  useEffect(() => {
    if (groupRef.current && !buildMode) {
      const displacement = new THREE.Vector3(...component.position)
        .normalize()
        .multiplyScalar(exploded ? 2 : 0);
      
      groupRef.current.position.x = component.position[0] + displacement.x;
      groupRef.current.position.y = component.position[1] + displacement.y;
      groupRef.current.position.z = component.position[2] + displacement.z;
    }
  }, [exploded, component.position, buildMode]);

  return (
    <group ref={groupRef} position={component.position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (buildMode) {
            onBuildModeClick?.();
          } else {
            onClick?.();
          }
        }}
      >
        <boxGeometry args={component.size} />
        <meshStandardMaterial
          color={component.color}
          transparent
          opacity={buildMode ? 0.7 : 0.85}
          emissive={component.color}
          emissiveIntensity={hovered || isSelected ? 0.8 : pulseIntensity}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <mesh>
        <boxGeometry args={component.size.map(s => s * 1.02)} />
        <meshBasicMaterial 
          color={component.color} 
          wireframe 
          transparent 
          opacity={hovered || isSelected ? 0.8 : 0.5} 
        />
      </mesh>

      {isSelected && (
        <mesh>
          <sphereGeometry args={[Math.max(...component.size) * 0.9, 16, 16]} />
          <meshBasicMaterial color={component.color} transparent opacity={0.15} />
        </mesh>
      )}

      {showPerformance && <PerformanceOverlay component={component} position={[0, 0, 0]} />}
    </group>
  );
}

function BlueprintCore({ 
  exploded, 
  scrollProgress, 
  selectedComponent, 
  onComponentClick, 
  buildMode, 
  buildComponents, 
  onBuildComponentClick,
  showConnections,
  collaborators,
  showPerformance
}) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current && !exploded && !buildMode) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  const componentsToRender = buildMode ? buildComponents : componentsData;

  return (
    <group ref={groupRef}>
      {componentsToRender.map((comp, i) => (
        <BlueprintComponent
          key={buildMode ? comp.id : i}
          component={comp}
          index={i}
          exploded={exploded}
          scrollProgress={scrollProgress}
          isSelected={selectedComponent === i}
          onClick={() => !buildMode && onComponentClick(i)}
          buildMode={buildMode}
          onBuildModeClick={() => buildMode && onBuildComponentClick(i)}
          showPerformance={showPerformance}
        />
      ))}

      <ConnectionLines components={componentsToRender} showConnections={showConnections} />

      {collaborators.map((collab, i) => (
        <CollaboratorCursor 
          key={i}
          position={[collab.name === 'Alice' ? 1 : -1, 0.5, 0]}
          name={collab.name}
          color={collab.color}
        />
      ))}

      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial 
          color="#00f5ff" 
          transparent 
          opacity={0.03} 
          wireframe 
        />
      </mesh>
    </group>
  );
}

export default function Blueprint3DViewer({
  exploded,
  scrollProgress,
  selectedComponent,
  onComponentClick,
  buildMode,
  buildComponents,
  onBuildComponentClick,
  showConnections,
  collaborators = [],
  showPerformance = false,
  lightingPreset = 'default'
}) {
  const getLightingConfig = () => {
    switch (lightingPreset) {
      case 'dramatic':
        return {
          ambient: 0.2,
          lights: [
            { position: [15, 15, 15], intensity: 2, color: "#00f5ff" },
            { position: [-15, -15, -15], intensity: 1.5, color: "#a855f7" }
          ]
        };
      case 'soft':
        return {
          ambient: 0.6,
          lights: [
            { position: [10, 10, 10], intensity: 0.8, color: "#ffffff" },
            { position: [-10, -10, -10], intensity: 0.4, color: "#ffffff" }
          ]
        };
      case 'neon':
        return {
          ambient: 0.3,
          lights: [
            { position: [10, 10, 10], intensity: 1.5, color: "#00ffff" },
            { position: [-10, -10, -10], intensity: 1.2, color: "#ff00ff" },
            { position: [0, 15, 0], intensity: 0.8, color: "#ffff00" }
          ]
        };
      default:
        return {
          ambient: 0.4,
          lights: [
            { position: [10, 10, 10], intensity: 1.2, color: "#00f5ff" },
            { position: [-10, -10, -10], intensity: 0.6, color: "#a855f7" }
          ]
        };
    }
  };

  const lighting = getLightingConfig();

  return (
    <Canvas
      camera={{ position: [5, 3, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={lighting.ambient} />
      {lighting.lights.map((light, i) => (
        <pointLight key={i} position={light.position} intensity={light.intensity} color={light.color} />
      ))}
      <spotLight position={[0, 10, 0]} intensity={0.5} color="#ec4899" />
      
      <BlueprintCore 
        exploded={exploded} 
        scrollProgress={scrollProgress}
        selectedComponent={selectedComponent}
        onComponentClick={onComponentClick}
        buildMode={buildMode}
        buildComponents={buildComponents}
        onBuildComponentClick={onBuildComponentClick}
        showConnections={showConnections}
        collaborators={collaborators}
        showPerformance={showPerformance}
      />
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={10}
      />
    </Canvas>
  );
}