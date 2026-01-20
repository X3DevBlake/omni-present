import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

function InsightNode({ insight, position, index }) {
  const nodeRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (nodeRef.current) {
      const offset = Math.sin(state.clock.elapsedTime + index) * 0.1;
      nodeRef.current.position.y = position[1] + offset;
      nodeRef.current.rotation.y += 0.01;
    }
  });

  const categoryColors = {
    'pattern': '#3b82f6',
    'anomaly': '#ef4444',
    'opportunity': '#10b981',
    'risk': '#f59e0b',
    'trend': '#8b5cf6',
    'correlation': '#06b6d4'
  };

  const color = categoryColors[insight.insight_category] || '#6366f1';
  const impact = insight.business_impact?.impact_score || 0;
  const size = 0.3 + (impact / 100) * 0.3;

  return (
    <group position={position}>
      <RoundedBox
        ref={nodeRef}
        args={[size, size, size]}
        radius={0.05}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.3}
        />
      </RoundedBox>

      {hovered && (
        <Html position={[0, size + 0.2, 0]} center>
          <div className="bg-slate-900/95 backdrop-blur-sm border border-purple-500 rounded-lg p-3 max-w-xs">
            <p className="text-white font-bold text-xs mb-1">{insight.insight_category}</p>
            <p className="text-slate-400 text-xs mb-2 line-clamp-2">
              {insight.insight_text?.substring(0, 80)}...
            </p>
            <div className="flex items-center gap-2">
              <span className="text-purple-400 text-xs">Impact: {Math.round(impact)}</span>
              <span className="text-cyan-400 text-xs">
                Confidence: {Math.round((insight.confidence_level || 0) * 100)}%
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function InsightClusters3D({ insights }) {
  const categories = ['pattern', 'anomaly', 'opportunity', 'risk', 'trend', 'correlation'];
  
  const positions = React.useMemo(() => {
    return insights.slice(0, 20).map((insight, idx) => {
      const categoryIdx = categories.indexOf(insight.insight_category);
      const angle = (categoryIdx / categories.length) * Math.PI * 2;
      const radiusBase = 3;
      const radiusOffset = (idx % 3) * 0.8;
      const radius = radiusBase + radiusOffset;
      
      return [
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2,
        Math.sin(angle) * radius
      ];
    });
  }, [insights]);

  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />

      <Text position={[0, 4, 0]} fontSize={0.35} color="white" anchorX="center">
        Intelligence Insights
      </Text>

      {insights.slice(0, 20).map((insight, idx) => (
        <InsightNode
          key={insight.id}
          insight={insight}
          position={positions[idx]}
          index={idx}
        />
      ))}

      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={18}
      />
    </Canvas>
  );
}