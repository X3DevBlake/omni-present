import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function LearningCurve({ curve }) {
  const points = curve?.map((point, i) => 
    new THREE.Vector3(i * 0.8 - 2, point.proficiency / 25, 0)
  ) || [];

  return points.length > 1 ? (
    <group>
      <Line points={points} color="#00f5ff" lineWidth={3} />
      {curve.map((point, i) => (
        <Sphere key={i} args={[0.1, 16, 16]} position={[i * 0.8 - 2, point.proficiency / 25, 0]}>
          <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.6} />
        </Sphere>
      ))}
    </group>
  ) : null;
}

function Sphere({ children, ...props }) {
  return (
    <mesh {...props}>
      <sphereGeometry args={props.args || [1, 32, 32]} />
      {children}
    </mesh>
  );
}

function ProficiencyMeter({ level }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = (level / 100) * Math.PI * 2;
    }
  });

  const getColor = () => {
    if (level >= 80) return '#44ff44';
    if (level >= 50) return '#ffaa00';
    return '#ff4444';
  };

  return (
    <group position={[3.5, 0, 0]}>
      <mesh ref={meshRef}>
        <torusGeometry args={[1, 0.1, 16, 100, (level / 100) * Math.PI * 2]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.6}
        />
      </mesh>
      <Text position={[0, 0, 0]} fontSize={0.5} color={getColor()}>
        {level.toFixed(0)}%
      </Text>
      <Text position={[0, -1.5, 0]} fontSize={0.15} color="white">
        Proficiency
      </Text>
    </group>
  );
}

function ResourceNodes({ resources }) {
  return (
    <group position={[-3.5, 0, 0]}>
      {resources?.slice(0, 3).map((res, i) => (
        <group key={i} position={[0, 1 - i * 0.8, 0]}>
          <mesh>
            <boxGeometry args={[0.6, 0.4, 0.4]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#a855f7"
              emissiveIntensity={res.completion_status}
            />
          </mesh>
          <Text position={[0, -0.5, 0]} fontSize={0.1} color="white">
            {res.resource_type}
          </Text>
          <Text position={[0, -0.7, 0]} fontSize={0.09} color="#00f5ff">
            {(res.completion_status * 100).toFixed(0)}%
          </Text>
        </group>
      ))}
    </group>
  );
}

export default function SkillAcquisition3D({ skillData }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
        
        {skillData && (
          <>
            <Text position={[0, 4, 0]} fontSize={0.4} color="#00f5ff">
              {skillData.skill_name}
            </Text>
            <Text position={[0, 3.4, 0]} fontSize={0.2} color="#ffffff">
              {skillData.acquisition_method.replace('_', ' ').toUpperCase()}
            </Text>
            <Text position={[0, 2.9, 0]} fontSize={0.18} color={
              skillData.learning_status === 'mastered' ? '#44ff44' : '#ffaa00'
            }>
              Status: {skillData.learning_status}
            </Text>
            {skillData.autonomous_discovery && (
              <Text position={[0, 2.4, 0]} fontSize={0.15} color="#a855f7">
                🤖 Self-Discovered
              </Text>
            )}

            <LearningCurve curve={skillData.learning_curve} />
            <ProficiencyMeter level={skillData.proficiency_level} />
            <ResourceNodes resources={skillData.training_resources} />

            <group position={[0, -3, 0]}>
              <Text fontSize={0.15} color="#ffffff">
                Current: {skillData.performance_benchmarks?.current_score?.toFixed(0)} | 
                Target: {skillData.performance_benchmarks?.target_score}
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.15} color="#00f5ff">
                Percentile: {skillData.performance_benchmarks?.percentile_rank?.toFixed(0)}th
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}