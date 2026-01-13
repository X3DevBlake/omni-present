import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useVideoTexture, Text, RoundedBox, Float } from '@react-three/drei';
import * as THREE from 'three';

function VideoScreen({ url }) {
  const texture = useVideoTexture(url);
  return (
    <mesh position={[0, 0, 0.06]}>
      <planeGeometry args={[3.2, 1.9]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

export default function VideoCard3D({ videoUrl, cardData, isHovered }) {
  const mesh = useRef();
  const [hover, setHover] = useState(false);

  useFrame((state, delta) => {
    if (mesh.current) {
      if (isHovered || hover) {
        mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, Math.PI * 0.1, delta * 2);
        mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, -Math.PI * 0.1, delta * 2);
      } else {
        mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, 0, delta * 2);
        mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, 0, delta * 2);
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group 
        ref={mesh} 
        onPointerOver={() => setHover(true)} 
        onPointerOut={() => setHover(false)}
      >
        {/* Card Body */}
        <RoundedBox args={[3.4, 2.1, 0.1]} radius={0.1} smoothness={4}>
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={0.8} 
            roughness={0.2} 
            envMapIntensity={1}
          />
        </RoundedBox>
        
        {/* Video Screen Face */}
        {videoUrl && <VideoScreen url={videoUrl} />}
        
        {/* Chip */}
        <mesh position={[-1.2, 0.3, 0.06]}>
          <planeGeometry args={[0.4, 0.3]} />
          <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.3} />
        </mesh>
        
        {/* Contactless Symbol */}
        <mesh position={[1.2, 0.6, 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>

        {/* Card Details */}
        <Text
          position={[-1.4, -0.6, 0.07]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="left"
          font="/fonts/Inter-Bold.ttf"
        >
          {cardData?.number || '•••• •••• •••• ••••'}
        </Text>
        
        <Text
          position={[-1.4, -0.85, 0.07]}
          fontSize={0.1}
          color="#ffffff"
          anchorX="left"
          font="/fonts/Inter-Medium.ttf"
        >
          {cardData?.name || 'VIRTUAL USER'}
        </Text>

        <Text
          position={[1.4, -0.85, 0.07]}
          fontSize={0.1}
          color="#ffffff"
          anchorX="right"
          font="/fonts/Inter-Medium.ttf"
        >
          {cardData?.expiry || '12/28'}
        </Text>
        
        {/* Visa Logo */}
        <Text
          position={[1.2, -0.6, 0.07]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          font="/fonts/Inter-Bold.ttf"
          fillOpacity={0.9}
        >
          VISA
        </Text>
      </group>
    </Float>
  );
}