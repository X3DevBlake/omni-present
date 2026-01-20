import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function InsightNode({ insight, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
      meshRef.current.scale.setScalar(scale * insight.confidence);
    }
  });

  const getColor = () => {
    switch (insight.insight_type) {
      case 'correlation': return '#00f5ff';
      case 'pattern': return '#a855f7';
      case 'opportunity': return '#44ff44';
      case 'risk': return '#ff4444';
      default: return '#ffffff';
    }
  };

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={insight.impact_score}
        />
      </mesh>
      <Text position={[0, -0.5, 0]} fontSize={0.08} color="white">
        {insight.insight_type}
      </Text>
      <Text position={[0, 0.5, 0]} fontSize={0.07} color="#44ff44">
        {(insight.confidence * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function CorrelationLine({ corr, fromPos, toPos }) {
  const points = [
    new THREE.Vector3(fromPos[0], fromPos[1], fromPos[2]),
    new THREE.Vector3(toPos[0], toPos[1], toPos[2])
  ];

  return (
    <Line
      points={points}
      color={corr.correlation_coefficient > 0 ? '#44ff44' : '#ff4444'}
      lineWidth={Math.abs(corr.correlation_coefficient) * 5}
      opacity={Math.abs(corr.correlation_coefficient)}
      transparent
    />
  );
}

export default function InsightEngine3D({ engine }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        {engine && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              {engine.engine_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {engine.analysis_domain?.replace('_', ' ').toUpperCase()}
            </Text>
            <Text position={[0, 3.3, 0]} fontSize={0.18} color="#a855f7">
              {engine.data_aggregation?.total_records?.toLocaleString()} Records Analyzed
            </Text>

            {engine.insights_generated?.slice(0, 6).map((insight, i) => {
              const angle = (i / Math.min(engine.insights_generated.length, 6)) * Math.PI * 2;
              return (
                <InsightNode
                  key={i}
                  insight={insight}
                  position={[Math.cos(angle) * 3, Math.sin(angle) * 2, 0]}
                />
              );
            })}

            {engine.correlation_analysis?.map((corr, i) => {
              const angle1 = (i / (engine.correlation_analysis.length + 1)) * Math.PI * 2;
              const angle2 = ((i + 1) / (engine.correlation_analysis.length + 1)) * Math.PI * 2;
              return (
                <CorrelationLine
                  key={i}
                  corr={corr}
                  fromPos={[Math.cos(angle1) * 3, Math.sin(angle1) * 2, 0]}
                  toPos={[Math.cos(angle2) * 3, Math.sin(angle2) * 2, 0]}
                />
              );
            })}

            <group position={[0, -3, 0]}>
              <Text fontSize={0.15} color="#44ff44">
                {engine.insights_generated?.length || 0} Insights
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color="#00f5ff">
                {engine.trend_detection?.trends_identified || 0} Trends Identified
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}