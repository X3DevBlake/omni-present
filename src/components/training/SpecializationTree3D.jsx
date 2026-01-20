import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

function SpecializationNode({ specialization, position, verified }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });
  
  const proficiency = specialization.proficiency || 0;
  const size = 0.2 + (proficiency / 100) * 0.3;
  const color = verified ? '#10b981' : '#fbbf24';
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.3}
        />
      </Sphere>
      
      <Text
        position={[0, size + 0.4, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        {specialization.name}
      </Text>
      
      <Text
        position={[0, -size - 0.3, 0]}
        fontSize={0.1}
        color={color}
        anchorX="center"
      >
        {proficiency.toFixed(0)}%
      </Text>
      
      {verified && (
        <Sphere args={[0.08, 16, 16]} position={[size, 0, 0]}>
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
        </Sphere>
      )}
    </group>
  );
}

export default function SpecializationTree3D({ specializationData }) {
  if (!specializationData?.specialization_tree) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No specialization data</p>
      </div>
    );
  }
  
  const treeData = specializationData.specialization_tree;
  
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f5ff" />
      
      {/* Trunk */}
      <Cylinder args={[0.2, 0.3, 3, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </Cylinder>
      
      {/* Root sphere */}
      <Sphere args={[0.4, 32, 32]} position={[0, -1.8, 0]}>
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.4}
        />
      </Sphere>
      
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {specializationData.primary_specialization}
      </Text>
      
      {/* Categories and specializations */}
      {treeData.map((category, catIdx) => {
        const angle = (catIdx / treeData.length) * Math.PI * 2;
        const categoryRadius = 3;
        const categoryPos = [
          Math.cos(angle) * categoryRadius,
          1.5,
          Math.sin(angle) * categoryRadius
        ];
        
        return (
          <React.Fragment key={catIdx}>
            {/* Category branch */}
            <Line
              points={[[0, 1.5, 0], categoryPos]}
              color="#8b4513"
              lineWidth={3}
            />
            
            {/* Category node */}
            <group position={categoryPos}>
              <Sphere args={[0.3, 32, 32]}>
                <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.3} />
              </Sphere>
              <Text position={[0, 0.5, 0]} fontSize={0.15} color="white" anchorX="center">
                {category.category}
              </Text>
            </group>
            
            {/* Subcategories */}
            {category.subcategories?.map((subcat, subIdx) => {
              const subAngle = angle + (subIdx - category.subcategories.length / 2) * 0.3;
              const subRadius = categoryRadius + 1.5;
              const subPos = [
                Math.cos(subAngle) * subRadius,
                1.5 + (subIdx - category.subcategories.length / 2) * 0.5,
                Math.sin(subAngle) * subRadius
              ];
              
              return (
                <React.Fragment key={subIdx}>
                  <Line
                    points={[categoryPos, subPos]}
                    color="#00f5ff"
                    lineWidth={2}
                    transparent
                    opacity={0.5}
                  />
                  
                  <SpecializationNode
                    specialization={subcat}
                    position={subPos}
                    verified={subcat.verified}
                  />
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
      
      <Text
        position={[0, 5, -5]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        Specialization Tree
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={25}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}