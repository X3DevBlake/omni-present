import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text, RoundedBox } from '@react-three/drei';
import { Button } from '@/components/ui/button';

function PermissionSwitch({ position, label, enabled, onClick }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.3}>
      <group position={position} onClick={onClick}>
        <mesh ref={meshRef}>
          <RoundedBox args={[1, 0.5, 0.3]} radius={0.1}>
            <meshStandardMaterial
              color={enabled ? '#00ff88' : '#ff4444'}
              emissive={enabled ? '#00ff88' : '#ff4444'}
              emissiveIntensity={0.5}
            />
          </RoundedBox>
        </mesh>
        <Text position={[0, -0.6, 0]} fontSize={0.15} color="white" anchorX="center">
          {label}
        </Text>
        <Text position={[0, 0, 0.2]} fontSize={0.12} color="white" anchorX="center">
          {enabled ? 'ON' : 'OFF'}
        </Text>
      </group>
    </Float>
  );
}

function DataAccessSphere({ position, app, access }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial
            color={access === 'full' ? '#00f5ff' : access === 'limited' ? '#ffaa00' : '#ff4444'}
            emissive={access === 'full' ? '#00f5ff' : access === 'limited' ? '#ffaa00' : '#ff4444'}
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
          />
        </mesh>
        <Text position={[0, -0.8, 0]} fontSize={0.12} color="white" anchorX="center">
          {app}
        </Text>
      </group>
    </Float>
  );
}

export default function DIDPermissionsControlPanel3D() {
  const [permissions, setPermissions] = useState({
    shareEmail: true,
    shareLocation: false,
    shareTransactions: false,
    shareSocial: true
  });

  const togglePermission = (key) => {
    setPermissions({ ...permissions, [key]: !permissions[key] });
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden" style={{ height: '600px' }}>
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-bold text-xl">🎛️ DID Permissions Control Panel</h3>
        <p className="text-white/60 text-sm">Manage data access and consent intuitively in 3D</p>
      </div>

      <Canvas camera={{ position: [0, 2, 6], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#a855f7" />

        {/* Permission Switches */}
        <PermissionSwitch
          position={[-2, 1, 0]}
          label="Email"
          enabled={permissions.shareEmail}
          onClick={() => togglePermission('shareEmail')}
        />
        <PermissionSwitch
          position={[2, 1, 0]}
          label="Location"
          enabled={permissions.shareLocation}
          onClick={() => togglePermission('shareLocation')}
        />
        <PermissionSwitch
          position={[-2, -0.5, 0]}
          label="Transactions"
          enabled={permissions.shareTransactions}
          onClick={() => togglePermission('shareTransactions')}
        />
        <PermissionSwitch
          position={[2, -0.5, 0]}
          label="Social"
          enabled={permissions.shareSocial}
          onClick={() => togglePermission('shareSocial')}
        />

        {/* Apps with Access */}
        <DataAccessSphere position={[-3, -2, 2]} app="DeFi App" access="full" />
        <DataAccessSphere position={[0, -2, 2]} app="Social" access="limited" />
        <DataAccessSphere position={[3, -2, 2]} app="Analytics" access="none" />

        <OrbitControls enableZoom={false} />
      </Canvas>

      <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4">
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div>
            <div className="text-cyan-400 font-bold">2</div>
            <div className="text-white/60 text-xs">Full Access</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold">1</div>
            <div className="text-white/60 text-xs">Limited</div>
          </div>
          <div>
            <div className="text-red-400 font-bold">1</div>
            <div className="text-white/60 text-xs">Blocked</div>
          </div>
        </div>
      </div>
    </div>
  );
}