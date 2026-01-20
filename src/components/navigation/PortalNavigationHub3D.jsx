import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import NavigationPortal3D from './NavigationPortal3D';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PortalNavigationHub3D({ hubs = [] }) {
  const navigate = useNavigate();

  const handlePortalClick = (hub) => {
    if (hub.target_page) {
      navigate(createPageUrl(hub.target_page));
    }
  };

  const getPortalPosition = (index, total) => {
    const radius = 4;
    const angle = (index / total) * Math.PI * 2;
    const y = Math.sin(angle) * 1.5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle * 0.5) * 2;
    return [x, y, z];
  };

  return (
    <div className="w-full h-[600px] bg-black/20 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, 10, -10]} intensity={0.7} color="#a855f7" />
        <pointLight position={[0, -10, 5]} intensity={0.5} color="#00f5ff" />
        
        <Environment preset="night" />

        {hubs.map((hub, index) => (
          <NavigationPortal3D
            key={hub.id || hub.hub_name}
            hub={hub}
            position={getPortalPosition(index, hubs.length)}
            onClick={() => handlePortalClick(hub)}
          />
        ))}
        
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={20}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}