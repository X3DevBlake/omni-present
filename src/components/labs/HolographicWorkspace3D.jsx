import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';

function FloatingPanel({ panel, isSelected, onSelect }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.position.y = panel.position.y + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const getPanelColor = () => {
    switch (panel.panel_type) {
      case 'chart': return '#00f5ff';
      case 'controls': return '#a855f7';
      case 'visualization': return '#ec4899';
      case '3d_graph': return '#3b82f6';
      default: return '#10b981';
    }
  };

  return (
    <group
      position={[panel.position.x, panel.position.y, panel.position.z]}
      onClick={() => onSelect?.(panel)}
    >
      <mesh ref={meshRef}>
        <boxGeometry args={[panel.size.w, panel.size.h, 0.1]} />
        <meshStandardMaterial
          color={getPanelColor()}
          emissive={getPanelColor()}
          emissiveIntensity={isSelected ? 0.5 : 0.2}
          transparent
          opacity={0.7}
        />
      </mesh>
      <Html position={[0, 0, 0.1]} center>
        <div className="bg-black/80 backdrop-blur-sm rounded px-3 py-2 text-white text-sm">
          {panel.panel_id}
        </div>
      </Html>
    </group>
  );
}

function VisualizationMarkers({ visualizations }) {
  return (
    <>
      {visualizations?.map((viz, i) => (
        <group key={i} position={[i * 2 - 2, 3, 0]}>
          <mesh>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial
              color="#00ff00"
              emissive="#00ff00"
              emissiveIntensity={0.6}
            />
          </mesh>
          <Text position={[0, -0.5, 0]} fontSize={0.15} color="white">
            {viz.viz_type}
          </Text>
        </group>
      ))}
    </>
  );
}

function AvatarRepresentation({ position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <capsuleGeometry args={[0.3, 1, 8, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

export default function HolographicWorkspace3D({ workspace, onPanelSelect }) {
  const [selectedPanel, setSelectedPanel] = useState(null);

  const handlePanelSelect = (panel) => {
    setSelectedPanel(panel.panel_id);
    onPanelSelect?.(panel);
  };

  return (
    <div className="w-full h-[700px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#a855f7" />
        
        {workspace && (
          <>
            <group>
              <Text position={[0, 5, 0]} fontSize={0.5} color="#00f5ff">
                {workspace.workspace_name}
              </Text>
              <Text position={[0, 4.3, 0]} fontSize={0.2} color="#ffffff">
                {workspace.workspace_type.replace('_', ' ').toUpperCase()}
              </Text>
            </group>

            {workspace.layout_config?.panels?.map((panel, i) => (
              <FloatingPanel
                key={i}
                panel={panel}
                isSelected={selectedPanel === panel.panel_id}
                onSelect={handlePanelSelect}
              />
            ))}

            <VisualizationMarkers visualizations={workspace.active_visualizations} />
            
            {workspace.personalization?.avatar_config && (
              <AvatarRepresentation position={[0, 0, 3]} />
            )}

            <group position={[0, -1, -3]}>
              <Text fontSize={0.15} color="#ffffff">
                {workspace.gesture_controls?.enabled ? '✋ Gestures: ON' : '✋ Gestures: OFF'}
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.15} color="#ffffff">
                {workspace.voice_commands?.enabled ? '🎤 Voice: ON' : '🎤 Voice: OFF'}
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
        <gridHelper args={[20, 20, '#333333', '#111111']} position={[0, -2, 0]} />
      </Canvas>
    </div>
  );
}