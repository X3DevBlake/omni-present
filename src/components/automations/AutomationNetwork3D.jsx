import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Html } from '@react-three/drei';

function AutomationNode({ position, automation, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 0.95;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const categoryColors = {
    mlops: '#3b82f6',
    agent_orchestration: '#a855f7',
    financial: '#10b981',
    communication: '#f59e0b',
    system: '#ef4444'
  };

  const color = categoryColors[automation.category] || '#6b7280';
  const statusColor = automation.last_status === 'success' ? '#10b981' : 
                      automation.last_status === 'failed' ? '#ef4444' : '#6b7280';

  return (
    <group position={position}>
      <Sphere 
        ref={meshRef} 
        args={[0.4, 32, 32]}
        onClick={() => onClick && onClick(automation)}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.2 : 0.7}
        />
      </Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0.4, 0.4, 0]}>
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={1} />
      </Sphere>
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black/90 text-white p-3 rounded-lg text-xs backdrop-blur-md border border-white/20 min-w-[200px]">
            <div className="font-bold text-cyan-400">{automation.automation_name}</div>
            <div className="text-white/60 text-xs mt-1">{automation.category}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-white/60">Executions:</span>
                <span className="text-white">{automation.execution_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Success Rate:</span>
                <span className="text-green-400">
                  {((automation.success_count / (automation.execution_count || 1)) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Status:</span>
                <span className={automation.last_status === 'success' ? 'text-green-400' : 'text-red-400'}>
                  {automation.last_status || 'pending'}
                </span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function AutomationNetwork3D({ automations = [], onNodeClick }) {
  const categoryGroups = {
    mlops: [],
    agent_orchestration: [],
    financial: [],
    communication: [],
    system: []
  };

  automations.forEach(auto => {
    if (categoryGroups[auto.category]) {
      categoryGroups[auto.category].push(auto);
    }
  });

  const positions = [];
  let index = 0;
  
  Object.keys(categoryGroups).forEach((category, catIndex) => {
    const radius = 4 + catIndex * 2;
    const count = categoryGroups[category].length;
    
    categoryGroups[category].forEach((auto, i) => {
      const angle = (i / count) * Math.PI * 2;
      positions.push({
        automation: auto,
        position: [
          Math.cos(angle) * radius,
          Math.sin(catIndex * 1.5 - 3),
          Math.sin(angle) * radius
        ]
      });
    });
  });

  return (
    <div className="w-full h-[600px]">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />

        <Text position={[0, 6, 0]} fontSize={0.6} color="#00f5ff" anchorX="center">
          Automation Network
        </Text>
        <Text position={[0, 5, 0]} fontSize={0.3} color="white" anchorX="center">
          {automations.length} Active Automations
        </Text>

        {positions.map((item, i) => (
          <AutomationNode
            key={i}
            position={item.position}
            automation={item.automation}
            onClick={onNodeClick}
          />
        ))}

        {positions.map((item, i) => (
          <Line
            key={`line-${i}`}
            points={[[0, 0, 0], item.position]}
            color="rgba(255,255,255,0.1)"
            lineWidth={0.5}
          />
        ))}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}