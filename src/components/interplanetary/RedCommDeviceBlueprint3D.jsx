import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cpu, Radio, Zap, DollarSign, Settings, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import * as THREE from 'three';

function DeviceModel({ device, rotate }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current && rotate) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  // Base station structure
  if (device.device_model === 'RedComm_XG_Base_Station') {
    return (
      <group ref={groupRef}>
        {/* Main tower */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
          <meshStandardMaterial color="#1e40af" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Antenna array */}
        {[0, 1, 2, 3].map(i => (
          <mesh key={i} position={[Math.cos(i * Math.PI / 2) * 0.5, 1.2, Math.sin(i * Math.PI / 2) * 0.5]}>
            <boxGeometry args={[0.05, 0.6, 0.05]} />
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
          </mesh>
        ))}

        {/* Dishes */}
        {[0, 1, 2].map(i => {
          const angle = (i / 3) * Math.PI * 2;
          return (
            <mesh key={`dish_${i}`} position={[Math.cos(angle) * 0.6, 0.5, Math.sin(angle) * 0.6]} rotation={[Math.PI / 4, angle, 0]}>
              <cylinderGeometry args={[0.25, 0.05, 0.1, 32]} />
              <meshStandardMaterial color="#60a5fa" metalness={0.9} roughness={0.1} />
            </mesh>
          );
        })}
      </group>
    );
  }

  // Satellite model
  if (device.device_model === 'RedComm_XG_Satellite') {
    return (
      <group ref={groupRef}>
        {/* Main body */}
        <mesh>
          <boxGeometry args={[0.8, 0.4, 0.4]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Solar panels */}
        <mesh position={[-1.2, 0, 0]}>
          <boxGeometry args={[0.8, 1.2, 0.02]} />
          <meshStandardMaterial color="#1e40af" emissive="#3b82f6" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[1.2, 0, 0]}>
          <boxGeometry args={[0.8, 1.2, 0.02]} />
          <meshStandardMaterial color="#1e40af" emissive="#3b82f6" emissiveIntensity={0.3} />
        </mesh>

        {/* Antenna */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.08, 0.02, 0.8, 16]} />
          <meshStandardMaterial color="#60a5fa" metalness={0.9} />
        </mesh>
      </group>
    );
  }

  // Quantum link device
  if (device.device_model === 'RedComm_XG_Quantum_Link') {
    return (
      <group ref={groupRef}>
        {/* Quantum chamber */}
        <mesh>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial 
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
            metalness={0.9}
          />
        </mesh>

        {/* Focusing rings */}
        {[0.5, 0.7, 0.9].map((radius, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.03, 16, 64]} />
            <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.5} />
          </mesh>
        ))}

        {/* Entanglement nodes */}
        {[0, 1, 2, 3].map(i => {
          const angle = (i / 4) * Math.PI * 2;
          return (
            <mesh key={`node_${i}`} position={[Math.cos(angle) * 0.6, 0, Math.sin(angle) * 0.6]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.2} />
            </mesh>
          );
        })}
      </group>
    );
  }

  // Default mesh node
  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[0.5, 0.3, 0.3]} />
        <meshStandardMaterial color="#2563eb" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

export default function RedCommDeviceBlueprint3D() {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [rotateEnabled, setRotateEnabled] = useState(true);

  const { data: devices } = useQuery({
    queryKey: ['redcommDevices'],
    queryFn: () => base44.entities.RedCommDevice.list(),
    initialData: []
  });

  const deviceModels = [
    {
      device_model: 'RedComm_XG_Base_Station',
      name: 'XG Base Station',
      description: 'Ground-based THz relay tower',
      specs: {
        frequency_range_thz: '0.1 - 1.0',
        max_bandwidth_gbps: 150,
        transmission_power_w: 5000,
        operating_temp_range: '200K - 350K'
      },
      cost: 12500000
    },
    {
      device_model: 'RedComm_XG_Satellite',
      name: 'XG Orbital Relay',
      description: 'Orbital communication satellite',
      specs: {
        frequency_range_thz: '0.3 - 0.8',
        max_bandwidth_gbps: 200,
        transmission_power_w: 2000,
        operating_temp_range: '150K - 400K'
      },
      cost: 45000000
    },
    {
      device_model: 'RedComm_XG_Quantum_Link',
      name: 'XG Quantum Link',
      description: 'Entangled particle command channel',
      specs: {
        frequency_range_thz: 'N/A - Quantum',
        max_bandwidth_gbps: 0.001,
        transmission_power_w: 500,
        operating_temp_range: '4K - 10K'
      },
      cost: 180000000
    },
    {
      device_model: 'RedComm_XG_Mesh_Node',
      name: 'XG Mesh Node',
      description: 'Portable mesh network node',
      specs: {
        frequency_range_thz: '0.2 - 0.6',
        max_bandwidth_gbps: 80,
        transmission_power_w: 500,
        operating_temp_range: '180K - 380K'
      },
      cost: 2500000
    }
  ];

  const currentDevice = selectedDevice || deviceModels[0];

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Radio className="w-6 h-6 text-blue-400" />
          RedComm XG Device Blueprints
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] rounded-lg bg-black/60 mb-4">
          <Canvas camera={{ position: [3, 2, 3], fov: 50 }}>
            <ambientLight intensity={0.7} />
            <pointLight position={[5, 5, 5]} intensity={1.5} />
            <pointLight position={[-5, -5, -5]} intensity={0.5} color="#3b82f6" />
            
            <DeviceModel device={currentDevice} rotate={rotateEnabled} />
            
            <gridHelper args={[10, 10, '#333333', '#1a1a1a']} />
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {deviceModels.map((model, idx) => (
            <Button
              key={idx}
              variant={selectedDevice?.device_model === model.device_model ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDevice(model)}
              className="text-xs"
            >
              {model.name}
            </Button>
          ))}
        </div>

        <motion.div
          key={currentDevice.device_model}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4 mb-4"
        >
          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400" />
            {currentDevice.name}
          </h3>
          <p className="text-gray-300 text-xs mb-3">{currentDevice.description}</p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-400 block mb-1">Frequency Range:</span>
              <Badge variant="outline">{currentDevice.specs.frequency_range_thz}</Badge>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">Bandwidth:</span>
              <Badge className="bg-green-600">{currentDevice.specs.max_bandwidth_gbps} Gbps</Badge>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">TX Power:</span>
              <Badge className="bg-yellow-600">{currentDevice.specs.transmission_power_w} W</Badge>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">Operating Temp:</span>
              <Badge variant="outline">{currentDevice.specs.operating_temp_range}</Badge>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-blue-700 flex justify-between items-center">
            <span className="text-gray-400 text-xs">Manufacturing Cost:</span>
            <Badge className="bg-purple-600 text-sm">
              <DollarSign className="w-3 h-3 mr-1" />
              {(currentDevice.cost / 1000000).toFixed(1)}M
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => setRotateEnabled(!rotateEnabled)}
            className="text-xs"
          >
            <Settings className="w-3 h-3 mr-1" />
            {rotateEnabled ? 'Pause' : 'Rotate'}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-xs">
            <Eye className="w-3 h-3 mr-1" />
            View Specs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}