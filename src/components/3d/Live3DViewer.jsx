import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function AvatarModel({ baseUrl, components, properties }) {
  const group = useRef();
  
  return (
    <group ref={group}>
      {baseUrl && <primitive object={useGLTF(baseUrl).scene} />}
      {components.map((comp, i) => (
        <ComponentMesh key={i} comp={comp} properties={properties[comp.id]} />
      ))}
    </group>
  );
}

function ComponentMesh({ comp, properties }) {
  const mesh = useGLTF(comp.asset_url).scene;
  
  useEffect(() => {
    if (properties?.color && mesh) {
      mesh.traverse((child) => {
        if (child.isMesh) {
          child.material.color.set(properties.color);
        }
      });
    }
  }, [properties, mesh]);
  
  return <primitive object={mesh} scale={properties?.scale || 1} />;
}

export default function Live3DViewer({ baseModel, selectedComponents, componentProperties }) {
  return (
    <div className="w-full h-full bg-black/20 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <spotLight position={[-10, 10, -5]} angle={0.3} intensity={0.5} />
        
        <AvatarModel 
          baseUrl={baseModel?.base_mesh_url} 
          components={selectedComponents}
          properties={componentProperties}
        />
        
        <OrbitControls 
          enablePan={false}
          minDistance={2}
          maxDistance={10}
          target={[0, 1, 0]}
        />
        
        <gridHelper args={[10, 10, '#333', '#111']} />
      </Canvas>
    </div>
  );
}