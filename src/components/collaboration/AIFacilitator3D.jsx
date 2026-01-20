import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';

function FacilitatorCore() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 100, 16]} />
      <meshStandardMaterial
        color="#44ff44"
        emissive="#44ff44"
        emissiveIntensity={0.6}
        wireframe
      />
    </mesh>
  );
}

function TechniqueOrbs({ techniques }) {
  return (
    <group>
      {techniques?.slice(0, 6).map((tech, i) => {
        const angle = (i / Math.min(techniques.length, 6)) * Math.PI * 2;
        const radius = 2.5;
        
        return (
          <group key={i} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}>
            <Sphere args={[0.15 + tech.effectiveness_score * 0.15, 16, 16]}>
              <meshStandardMaterial
                color="#a855f7"
                emissive="#a855f7"
                emissiveIntensity={tech.effectiveness_score}
              />
            </Sphere>
            <Text position={[0, -0.4, 0]} fontSize={0.08} color="white">
              {tech.technique_name.replace('_', ' ')}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function InsightMarkers({ insights }) {
  return (
    <group position={[4, 0, 0]}>
      {insights?.slice(0, 5).map((insight, i) => {
        const colors = {
          pattern: '#00f5ff',
          recommendation: '#44ff44',
          warning: '#ff8800',
          opportunity: '#ffaa00'
        };
        
        return (
          <group key={i} position={[0, 2 - i * 0.8, 0]}>
            <Sphere args={[0.12, 16, 16]}>
              <meshStandardMaterial
                color={colors[insight.insight_type]}
                emissive={colors[insight.insight_type]}
                emissiveIntensity={0.7}
              />
            </Sphere>
            <Text position={[0.5, 0, 0]} fontSize={0.1} color="white">
              {insight.insight_type}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

export default function AIFacilitator3D({ facilitator }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#44ff44" />
        
        {facilitator && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#44ff44">
              {facilitator.facilitator_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {facilitator.specialization.replace('_', ' ').toUpperCase()}
            </Text>

            <FacilitatorCore />
            <TechniqueOrbs techniques={facilitator.facilitation_techniques} />
            <InsightMarkers insights={facilitator.insights_generated} />

            <group position={[-4, 1, 0]}>
              <Text fontSize={0.15} color="#ffffff">
                Sessions: {facilitator.performance_metrics?.sessions_facilitated}
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.15} color="#44ff44">
                Rating: {facilitator.performance_metrics?.average_session_rating?.toFixed(1)}⭐
              </Text>
              <Text position={[0, -0.8, 0]} fontSize={0.15} color="#00f5ff">
                Productivity: +{(facilitator.performance_metrics?.productivity_improvement * 100).toFixed(0)}%
              </Text>
            </group>

            <group position={[0, -3.5, 0]}>
              <Text fontSize={0.12} color="#a855f7">
                Conflict Resolution: {(facilitator.performance_metrics?.conflict_resolution_rate * 100).toFixed(0)}%
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color="#ffffff">
                {facilitator.learning_enabled ? '🧠 Learning Enabled' : 'Static Mode'}
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}