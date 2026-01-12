import React from 'react';
import { Html, Box, Cone } from '@react-three/drei';
import { Smartphone, Monitor, Glasses } from 'lucide-react';

export default function DeviceMarker3D({ device, position }) {
  const getDeviceIcon = () => {
    switch (device.device_type) {
      case 'holographic_projector': return Monitor;
      case 'ar_glasses': return Glasses;
      case 'mobile': return Smartphone;
      default: return Monitor;
    }
  };

  const Icon = getDeviceIcon();
  const isOnline = device.status === 'online';

  return (
    <group position={position}>
      {/* Device Platform */}
      <Box args={[2, 0.2, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={isOnline ? '#39FF14' : '#666666'}
          emissive={isOnline ? '#39FF14' : '#333333'}
          emissiveIntensity={0.3}
        />
      </Box>

      {/* Status Indicator */}
      <Cone args={[0.2, 0.5, 8]} position={[0, 1, 0]}>
        <meshStandardMaterial 
          color={isOnline ? '#39FF14' : '#FF3939'}
          emissive={isOnline ? '#39FF14' : '#FF3939'}
          emissiveIntensity={1}
        />
      </Cone>

      {/* Device Info */}
      <Html position={[0, 2, 0]} center distanceFactor={8}>
        <div className="bg-black/80 backdrop-blur-sm border border-green-400/50 rounded px-3 py-2 flex items-center gap-2">
          <Icon className="w-4 h-4 text-green-400" />
          <div>
            <p className="text-green-400 font-bold text-xs whitespace-nowrap">{device.device_name}</p>
            <p className="text-white/60 text-xs">{device.device_type}</p>
            {device.connected_agents?.length > 0 && (
              <p className="text-cyan-400 text-xs">{device.connected_agents.length} agents</p>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}