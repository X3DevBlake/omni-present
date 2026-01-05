import React, { useRef, useState, useEffect, useMemo } from 'react';
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

function AnimatedConnectionLine({ start, end, color, active, isDependency }) {
  const lineRef = useRef();
  const arrowRef = useRef();
  const [particleOffset, setParticleOffset] = useState(0);

  useFrame((state) => {
    setParticleOffset((prev) => (prev + 0.02) % 1);
    if (lineRef.current && active) {
      lineRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
    if (arrowRef.current && isDependency) {
      arrowRef.current.rotation.z = state.clock.elapsedTime * 2;
    }
  });

  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const points = [startVec, endVec];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const particlePos = startVec.clone().lerp(endVec, particleOffset);
  const direction = endVec.clone().sub(startVec).normalize();
  const midpoint = startVec.clone().lerp(endVec, 0.5);

  return (
    <group>
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial 
          color={color} 
          opacity={isDependency ? 0.6 : 0.3} 
          transparent 
          linewidth={isDependency ? 3 : 2} 
        />
      </line>
      
      {active && (
        <mesh position={[particlePos.x, particlePos.y, particlePos.z]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}

      {isDependency && (
        <mesh ref={arrowRef} position={[midpoint.x, midpoint.y, midpoint.z]} lookAt={endVec}>
          <coneGeometry args={[0.05, 0.15, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} />
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
          const isActive = (comp.load || 0) > 70 || (target.load || 0) > 70;
          const isDependency = i < targetIdx; // Direction indicator
          
          return (
            <AnimatedConnectionLine
              key={`${i}-${targetIdx}`}
              start={comp.position}
              end={target.position}
              color={comp.color}
              active={isActive}
              isDependency={isDependency}
            />
          );
        });
      })}
    </group>
  );
}

function CollaboratorCursor({ position, name, color }) {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.lerp(new THREE.Vector3(...position), 0.1);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <planeGeometry args={[0.5, 0.15]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <coneGeometry args={[0.05, 0.15, 3]} />
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

function BlueprintComponent({ component, index, exploded, scrollProgress, isSelected, onClick, buildMode, onBuildModeClick, showPerformance, onDragStart, onDragEnd, onPositionUpdate }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const velocityRef = useRef([0, 0, 0]);
  const lastPositionRef = useRef([...component.position]);

  // Memoize geometry to avoid recreating on every render
  const geometry = useMemo(() => new THREE.BoxGeometry(...component.size), [component.size[0], component.size[1], component.size[2]]);
  const wireframeGeometry = useMemo(() => 
    new THREE.BoxGeometry(...component.size.map(s => s * 1.02)), 
    [component.size[0], component.size[1], component.size[2]]
  );

  useFrame((state, delta) => {
    if (meshRef.current) {
      const targetScale = hovered || isSelected || isDragging ? 1.15 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      if (!buildMode && !exploded && !isDragging) {
        meshRef.current.rotation.y = scrollProgress * Math.PI * 2 + index * 0.5;
      }

      if (isSelected && !isDragging) {
        meshRef.current.rotation.y += 0.01;
      }

      const load = component.load || 0;
      if (load > 70) {
        setPulseIntensity(0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.3);
      } else {
        setPulseIntensity(0.2);
      }
    }

    // Optimized physics simulation (reduced iterations)
    if (buildMode && groupRef.current && !isDragging && state.clock.elapsedTime % 0.016 < delta) {
      velocityRef.current[1] -= 2 * delta;
      
      const newPos = [
        groupRef.current.position.x + velocityRef.current[0] * delta,
        groupRef.current.position.y + velocityRef.current[1] * delta,
        groupRef.current.position.z + velocityRef.current[2] * delta
      ];

      if (newPos[1] < -2) {
        newPos[1] = -2;
        velocityRef.current[1] = Math.abs(velocityRef.current[1]) > 0.1 ? -velocityRef.current[1] * 0.6 : 0;
        velocityRef.current[0] *= 0.8;
        velocityRef.current[2] *= 0.8;
      }

      velocityRef.current[0] *= 0.98;
      velocityRef.current[1] *= 0.98;
      velocityRef.current[2] *= 0.98;

      groupRef.current.position.set(newPos[0], newPos[1], newPos[2]);
      
      const moved = Math.abs(newPos[0] - lastPositionRef.current[0]) > 0.02 ||
                    Math.abs(newPos[1] - lastPositionRef.current[1]) > 0.02 ||
                    Math.abs(newPos[2] - lastPositionRef.current[2]) > 0.02;
      if (moved) {
        lastPositionRef.current = newPos;
        onPositionUpdate?.(newPos);
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

  const handlePointerDown = (e) => {
    if (buildMode) {
      e.stopPropagation();
      setIsDragging(true);
      setDragStart(e.point);
      velocityRef.current = [0, 0, 0];
      onDragStart?.();
    }
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      e.stopPropagation();
      setIsDragging(false);
      setDragStart(null);
      onDragEnd?.();
    } else if (buildMode) {
      onBuildModeClick?.();
    } else {
      onClick?.();
    }
  };

  const handlePointerMove = (e) => {
    if (isDragging && dragStart && groupRef.current) {
      e.stopPropagation();
      const delta = {
        x: e.point.x - dragStart.x,
        y: e.point.y - dragStart.y,
        z: e.point.z - dragStart.z
      };
      groupRef.current.position.x = component.position[0] + delta.x;
      groupRef.current.position.y = component.position[1] + delta.y;
      groupRef.current.position.z = component.position[2] + delta.z;
    }
  };

  return (
    <group ref={groupRef} position={component.position}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = buildMode ? 'grab' : 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        <meshStandardMaterial
          color={component.color}
          transparent
          opacity={isDragging ? 0.9 : buildMode ? 0.7 : 0.85}
          emissive={component.color}
          emissiveIntensity={hovered || isSelected || isDragging ? 0.8 : pulseIntensity}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <mesh geometry={wireframeGeometry}>
        <meshBasicMaterial 
          color={component.color} 
          wireframe 
          transparent 
          opacity={hovered || isSelected || isDragging ? 0.8 : 0.5} 
        />
      </mesh>

      {isSelected && (
        <mesh>
          <sphereGeometry args={[Math.max(...component.size) * 0.9, 16, 16]} />
          <meshBasicMaterial color={component.color} transparent opacity={0.15} />
        </mesh>
      )}

      {isDragging && (
        <mesh>
          <sphereGeometry args={[Math.max(...component.size) * 1.1, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.1} wireframe />
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
  showPerformance,
  onComponentPositionUpdate
}) {
  const groupRef = useRef();
  const [draggingIndex, setDraggingIndex] = useState(null);

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
          onDragStart={() => setDraggingIndex(i)}
          onDragEnd={() => setDraggingIndex(null)}
          onPositionUpdate={(newPos) => onComponentPositionUpdate?.(i, newPos)}
        />
      ))}

      <ConnectionLines components={componentsToRender} showConnections={showConnections} />

      {collaborators.map((collab, i) => (
        <CollaboratorCursor 
          key={i}
          position={collab.position || [collab.name === 'Alice' ? 1 : -1, 0.5, 0]}
          name={collab.name}
          color={collab.color}
        />
      ))}

      {/* Ground plane for visual reference in build mode */}
      {buildMode && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
          <planeGeometry args={[10, 10, 10, 10]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.05} wireframe />
        </mesh>
      )}

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
  lightingPreset = 'default',
  onComponentPositionUpdate
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
        onComponentPositionUpdate={onComponentPositionUpdate}
      />
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={10}
        enabled={!buildMode}
      />
    </Canvas>
  );
}