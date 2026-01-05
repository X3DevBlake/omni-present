import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const componentsData = [
  { position: [0, 0, 0], size: [0.8, 0.8, 0.8], color: '#00f5ff', label: 'Neural Core', connections: [1, 2] },
  { position: [1.5, 0, 0], size: [0.5, 0.5, 0.5], color: '#a855f7', label: 'GPU Array 1', connections: [0, 5] },
  { position: [-1.5, 0, 0], size: [0.5, 0.5, 0.5], color: '#a855f7', label: 'GPU Array 2', connections: [0, 5] },
  { position: [0, 1.2, 0], size: [0.4, 0.3, 0.6], color: '#ec4899', label: 'Memory Pool', connections: [0, 4] },
  { position: [0, -1.2, 0], size: [0.4, 0.3, 0.6], color: '#ec4899', label: 'Storage Layer', connections: [0, 3] },
  { position: [0, 0, 1.2], size: [0.3, 0.3, 0.3], color: '#3b82f6', label: 'Network Hub', connections: [1, 2, 6] },
  { position: [0, 0, -1.2], size: [0.3, 0.3, 0.3], color: '#3b82f6', label: 'I/O Controller', connections: [5] },
];

function ConnectionLines({ components, showConnections }) {
  if (!showConnections) return null;
  
  return (
    <group>
      {components.map((comp, i) => {
        if (!comp.connections) return null;
        return comp.connections.map(targetIdx => {
          if (targetIdx >= components.length) return null;
          const target = components[targetIdx];
          const start = new THREE.Vector3(...comp.position);
          const end = new THREE.Vector3(...target.position);
          const points = [start, end];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          
          return (
            <line key={`${i}-${targetIdx}`} geometry={geometry}>
              <lineBasicMaterial color={comp.color} opacity={0.3} transparent />
            </line>
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

function BlueprintComponent({ component, index, exploded, scrollProgress, isSelected, onClick, buildMode, onBuildModeClick }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered || isSelected ? 1.15 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      if (!buildMode && !exploded) {
        meshRef.current.rotation.y = scrollProgress * Math.PI * 2 + index * 0.5;
      }

      if (isSelected) {
        meshRef.current.rotation.y += 0.01;
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
          emissiveIntensity={hovered || isSelected ? 0.8 : 0.2}
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
  collaborators
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
  collaborators = []
}) {
  return (
    <Canvas
      camera={{ position: [5, 3, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#00f5ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#a855f7" />
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