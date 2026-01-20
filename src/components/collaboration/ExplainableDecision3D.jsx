import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function ReasoningPath({ chain }) {
  const points = chain?.map((step, i) => 
    new THREE.Vector3(i * 1.5 - 3, step.confidence * 2, 0)
  ) || [];

  return points.length > 1 ? (
    <>
      <Line points={points} color="#00f5ff" lineWidth={3} />
      {chain.map((step, i) => (
        <group key={i} position={[i * 1.5 - 3, step.confidence * 2, 0]}>
          <Sphere args={[0.15, 16, 16]}>
            <meshStandardMaterial
              color="#00f5ff"
              emissive="#00f5ff"
              emissiveIntensity={step.confidence}
            />
          </Sphere>
          <Text position={[0, -0.5, 0]} fontSize={0.08} color="white">
            Step {step.step}
          </Text>
        </group>
      ))}
    </>
  ) : null;
}

function FeatureImportanceBars({ features }) {
  return (
    <group position={[4, 0, 0]}>
      {features?.slice(0, 6).map((feature, i) => (
        <group key={i} position={[0, 2 - i * 0.6, 0]}>
          <mesh>
            <boxGeometry args={[feature.importance * 2, 0.25, 0.25]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#a855f7"
              emissiveIntensity={feature.importance}
            />
          </mesh>
          <Text position={[-1.5, 0, 0]} fontSize={0.1} color="white">
            {feature.feature}
          </Text>
          <Text position={[1.5, 0, 0]} fontSize={0.09} color="#00f5ff">
            {(feature.importance * 100).toFixed(0)}%
          </Text>
        </group>
      ))}
    </group>
  );
}

function AlternativeNodes({ alternatives }) {
  return (
    <group position={[-4, 0, 0]}>
      {alternatives?.slice(0, 4).map((alt, i) => (
        <group key={i} position={[0, 1.5 - i * 0.8, 0]}>
          <mesh>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial
              color="#ff8800"
              emissive="#ff8800"
              emissiveIntensity={0.3}
              opacity={0.5}
              transparent
            />
          </mesh>
          <Text position={[0, -0.5, 0]} fontSize={0.08} color="#ff8800">
            Alt {i + 1}
          </Text>
          <Text position={[0, -0.7, 0]} fontSize={0.07} color="white">
            Score: {alt.score?.toFixed(2)}
          </Text>
        </group>
      ))}
    </group>
  );
}

function ConfidenceGauge({ confidence }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z = -(confidence || 0) * Math.PI * 1.5 + Math.PI * 0.75;
    }
  });

  return (
    <group position={[0, -2, 0]}>
      <mesh>
        <torusGeometry args={[1, 0.08, 16, 100, Math.PI * 1.5]} rotation={[0, 0, Math.PI * 0.75]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.8, 0.04, 0.04]} />
        <meshStandardMaterial color="#44ff44" emissive="#44ff44" emissiveIntensity={0.6} />
      </mesh>
      <Text position={[0, -0.3, 0]} fontSize={0.3} color="#44ff44">
        {(confidence * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

export default function ExplainableDecision3D({ decision }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 12], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
        
        {decision && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              Decision Explanation
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {decision.explanation_method?.toUpperCase()}
            </Text>
            <Text position={[0, 3.3, 0]} fontSize={0.18} color={decision.human_understandable ? '#44ff44' : '#ffaa00'}>
              {decision.human_understandable ? '✓ Human Readable' : '⚠ Technical'}
            </Text>

            <ReasoningPath chain={decision.reasoning_chain} />
            <FeatureImportanceBars features={decision.feature_importance} />
            <AlternativeNodes alternatives={decision.alternatives_considered} />
            <ConfidenceGauge confidence={decision.confidence_score} />

            {decision.queryable && (
              <group position={[0, -4.5, 0]}>
                <Text fontSize={0.12} color="#a855f7">
                  💬 Queryable for More Details
                </Text>
              </group>
            )}
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}