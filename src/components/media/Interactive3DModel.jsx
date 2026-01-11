import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import { RotateCcw, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

function Model3D({ geometry = 'box', color = '#00f5ff', wireframe = false }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const renderGeometry = () => {
    switch(geometry) {
      case 'sphere':
        return <sphereGeometry args={[1, 32, 32]} />;
      case 'torus':
        return <torusGeometry args={[1, 0.4, 16, 100]} />;
      case 'cone':
        return <coneGeometry args={[1, 2, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[1, 1, 2, 32]} />;
      default:
        return <boxGeometry args={[2, 2, 2]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {renderGeometry()}
      <meshStandardMaterial 
        color={color} 
        wireframe={wireframe}
        emissive={color}
        emissiveIntensity={hovered ? 0.5 : 0.2}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

export default function Interactive3DModel({ 
  geometry = 'box',
  color = '#00f5ff',
  enableWireframe = true,
  className = ""
}) {
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef();

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 3, 5]} />
        <OrbitControls 
          ref={controlsRef}
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          enablePan={true}
          enableZoom={true}
          minDistance={3}
          maxDistance={15}
        />
        
        <ambientLight intensity={0.5} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={1}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Model3D geometry={geometry} color={color} wireframe={wireframe} />
        
        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.5}
          scale={10}
          blur={2}
          far={4}
        />
        
        <Environment preset="city" />
      </Canvas>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-xl rounded-full p-2 border border-white/10"
      >
        <Button
          size="icon"
          variant="ghost"
          onClick={resetCamera}
          className="bg-white/10 hover:bg-white/20 text-white rounded-full"
          title="Reset Camera"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`${autoRotate ? 'bg-cyan-500/30' : 'bg-white/10'} hover:bg-white/20 text-white rounded-full`}
          title="Toggle Auto Rotate"
        >
          <Move className="w-4 h-4" />
        </Button>

        {enableWireframe && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setWireframe(!wireframe)}
            className={`${wireframe ? 'bg-cyan-500/30' : 'bg-white/10'} hover:bg-white/20 text-white rounded-full`}
            title="Toggle Wireframe"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        )}
      </motion.div>

      {/* Info Badge */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xl rounded-lg px-3 py-2 border border-white/10">
        <p className="text-white/80 text-xs">
          Click & drag to rotate • Scroll to zoom
        </p>
      </div>
    </div>
  );
}