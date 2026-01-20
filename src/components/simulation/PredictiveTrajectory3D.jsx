import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

function OutcomeNode({ outcome, position, rank }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const pulse = 1 + outcome.probability * Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const getColor = () => {
    if (rank === 0) return '#44ff44';
    if (rank === 1) return '#00f5ff';
    return '#ffaa00';
  };

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3 + outcome.probability * 0.4, 32, 32]}>
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.9}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      <Html position={[0, 0.8, 0]} center>
        <div className="text-white text-xs font-medium bg-black/70 px-3 py-1 rounded whitespace-nowrap">
          {outcome.scenario}
        </div>
      </Html>

      <Text position={[0, -0.6, 0]} fontSize={0.15} color={getColor()}>
        {(outcome.probability * 100).toFixed(1)}%
      </Text>

      <Text position={[0, -0.9, 0]} fontSize={0.1} color="white">
        Value: {outcome.expected_value?.toFixed(2)}
      </Text>
    </group>
  );
}

function TrajectoryPath({ points, confidence }) {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  const pathPoints = points.map((p, i) => 
    new THREE.Vector3(
      (i - points.length / 2) * 0.5,
      p.value * 2,
      p.confidence * 3
    )
  );

  return (
    <Line
      ref={lineRef}
      points={pathPoints}
      color="#00f5ff"
      lineWidth={2 + confidence * 2}
      transparent
      opacity={0.7}
    />
  );
}

function ConfidenceZone({ outcome }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const ci = outcome.confidence_interval;
  const range = ci ? ci.upper - ci.lower : 1;

  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[range * 0.5, range * 0.5, 0.5, 32]} />
      <meshBasicMaterial color="#00f5ff" transparent opacity={0.1} wireframe />
    </mesh>
  );
}

function RiskIndicator({ riskFactor, position }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.03;
    }
  });

  const getSeverityColor = () => {
    switch (riskFactor.severity) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      default: return '#00f5ff';
    }
  };

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial
          color={getSeverityColor()}
          emissive={getSeverityColor()}
          emissiveIntensity={1}
        />
      </mesh>
      <Html position={[0, 0.4, 0]} center>
        <div className="text-white text-xs bg-red-900/90 px-2 py-1 rounded whitespace-nowrap">
          {riskFactor.factor}
        </div>
      </Html>
    </group>
  );
}

export default function PredictiveTrajectory3D({ prediction }) {
  if (!prediction) return null;

  const outcomes = prediction.predicted_outcomes || [];
  const trajectory = prediction.trajectory_forecast || [];
  const risks = prediction.risk_assessment?.risk_factors || [];

  return (
    <div className="w-full h-[700px] bg-black/20 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />
        
        <Text position={[0, 6, 0]} fontSize={0.5} color="#00f5ff">
          Predictive Simulation Outcomes
        </Text>

        {outcomes.map((outcome, i) => {
          const angle = (i / outcomes.length) * Math.PI * 2;
          const radius = 3;
          return (
            <OutcomeNode
              key={i}
              outcome={outcome}
              position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
              rank={i}
            />
          );
        })}

        {trajectory.length > 0 && (
          <TrajectoryPath
            points={trajectory.map(t => ({
              value: t.predicted_state?.value || 0,
              confidence: t.confidence
            }))}
            confidence={prediction.ai_confidence || 0.7}
          />
        )}

        {outcomes[0] && <ConfidenceZone outcome={outcomes[0]} />}

        {risks.map((risk, i) => {
          const angle = (i / risks.length) * Math.PI * 2;
          return (
            <RiskIndicator
              key={i}
              riskFactor={risk}
              position={[Math.cos(angle) * 5, -2, Math.sin(angle) * 5]}
            />
          );
        })}

        <Text position={[0, -6, 0]} fontSize={0.25} color="white">
          AI Confidence: {((prediction.ai_confidence || 0) * 100).toFixed(0)}%
        </Text>

        {prediction.risk_assessment && (
          <Text position={[0, -6.7, 0]} fontSize={0.2} color="#ff4444">
            Risk Score: {(prediction.risk_assessment.overall_risk_score * 100).toFixed(0)}%
          </Text>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}