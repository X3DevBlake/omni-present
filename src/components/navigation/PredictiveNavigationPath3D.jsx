import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Html } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import * as THREE from 'three';

function PathNode({ page, position, probability, isRecommended, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const scale = hovered ? 1.5 : 1 + probability * 0.5;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  const getColor = () => {
    if (isRecommended) return '#44ff44';
    if (probability > 0.7) return '#00f5ff';
    if (probability > 0.4) return '#a855f7';
    return '#ffaa00';
  };

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[0.3 + probability * 0.2, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={hovered ? 1.2 : 0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      <Html position={[0, 0.6, 0]} center>
        <div className={`text-white text-xs font-medium px-3 py-1 rounded whitespace-nowrap cursor-pointer ${
          isRecommended ? 'bg-green-900/90' : 'bg-black/70'
        }`}>
          {page.page_name?.replace(/([A-Z])/g, ' $1').trim()}
        </div>
      </Html>

      <Text position={[0, -0.6, 0]} fontSize={0.12} color={getColor()}>
        {(probability * 100).toFixed(0)}% confidence
      </Text>
    </group>
  );
}

function PredictivePath({ points, confidence }) {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.dashOffset -= 0.02;
    }
  });

  const color = confidence > 0.7 ? '#44ff44' : '#00f5ff';

  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={2 + confidence * 3}
      dashed
      dashScale={20}
      dashSize={0.5}
      gapSize={0.3}
    />
  );
}

function CurrentLocation() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.05;
      const pulse = 1.2 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={1.5}
        metalness={1}
        roughness={0}
      />
    </mesh>
  );
}

export default function PredictiveNavigationPath3D({ predictions = [], currentPage }) {
  const navigate = useNavigate();

  const handlePageClick = (page) => {
    navigate(createPageUrl(page.page_name));
  };

  const pathNodes = predictions.slice(0, 5).map((pred, i) => {
    const angle = (i / predictions.slice(0, 5).length) * Math.PI * 2;
    const radius = 2 + i * 0.5;
    return {
      prediction: pred,
      position: [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.5,
        i * 0.5
      ]
    };
  });

  return (
    <div className="w-full h-[600px] bg-black/20 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.7} color="#a855f7" />
        
        <Text position={[0, 4, 0]} fontSize={0.4} color="#00f5ff">
          AI-Predicted Navigation Path
        </Text>

        <CurrentLocation />

        {pathNodes.map((node, i) => (
          <PathNode
            key={i}
            page={node.prediction}
            position={node.position}
            probability={node.prediction.probability}
            isRecommended={i === 0}
            onClick={() => handlePageClick(node.prediction)}
          />
        ))}

        {pathNodes.map((node, i) => {
          if (i === 0) return null;
          const prevNode = pathNodes[i - 1];
          return (
            <PredictivePath
              key={i}
              points={[
                new THREE.Vector3(...prevNode.position),
                new THREE.Vector3(...node.position)
              ]}
              confidence={node.prediction.probability}
            />
          );
        })}

        <Text position={[0, -4, 0]} fontSize={0.2} color="#44ff44">
          Top Recommendation: {predictions[0]?.page_name?.replace(/([A-Z])/g, ' $1').trim()}
        </Text>
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}