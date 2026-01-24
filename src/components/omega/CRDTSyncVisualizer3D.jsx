import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { GitBranch, Wifi, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

const DeviceNode = ({ position, device, hasDelta, isOnline }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && hasDelta) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.25, 32, 32]}>
        <meshStandardMaterial
          color={isOnline ? '#10b981' : '#6b7280'}
          emissive={isOnline ? '#10b981' : '#000000'}
          emissiveIntensity={hasDelta ? 1 : 0.4}
        />
      </Sphere>
      <Text position={[0, 0.45, 0]} fontSize={0.15} color="white" anchorX="center">
        {device}
      </Text>
      {!isOnline && (
        <Sphere args={[0.35, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#ef4444"
            transparent
            opacity={0.3}
            wireframe
          />
        </Sphere>
      )}
    </group>
  );
};

const DeltaPacket = ({ from, to, progress }) => {
  const position = new THREE.Vector3().lerpVectors(
    new THREE.Vector3(...from),
    new THREE.Vector3(...to),
    progress
  );
  
  return (
    <Sphere args={[0.08, 16, 16]} position={position.toArray()}>
      <meshStandardMaterial
        color="#8b5cf6"
        emissive="#8b5cf6"
        emissiveIntensity={1.5}
      />
    </Sphere>
  );
};

export default function CRDTSyncVisualizer3D() {
  const [devices, setDevices] = useState([
    { id: 'phone', position: [-2, 0, 0], online: true, hasDelta: false },
    { id: 'headset', position: [0, 2, 0], online: true, hasDelta: false },
    { id: 'desktop', position: [2, 0, 0], online: true, hasDelta: false },
    { id: 'watch', position: [0, -2, 0], online: false, hasDelta: false }
  ]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deltaProgress, setDeltaProgress] = useState(0);
  const [syncResult, setSyncResult] = useState(null);

  const generateDelta = async () => {
    setIsSyncing(true);
    
    try {
      // Generate delta from phone
      const response = await base44.functions.invoke('CRDTSyncFabric', {
        action: 'generate_delta',
        source_node_id: 'phone',
        target_node_ids: ['headset', 'desktop', 'watch'],
        state_path: 'user.preferences.theme',
        delta_payload: { theme: 'omega_dark', timestamp: Date.now() }
      });

      if (response.data.success) {
        // Mark source device
        setDevices(prev => prev.map(d => 
          d.id === 'phone' ? { ...d, hasDelta: true } : d
        ));

        // Animate sync to online devices
        const onlineDevices = devices.filter(d => d.online && d.id !== 'phone');
        
        for (const device of onlineDevices) {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          await base44.functions.invoke('CRDTSyncFabric', {
            action: 'apply_delta',
            delta_id: response.data.delta_id,
            receiving_node_id: device.id
          });
          
          setDevices(prev => prev.map(d => 
            d.id === device.id ? { ...d, hasDelta: true } : d
          ));
        }

        setSyncResult(response.data);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleDeviceOnline = (deviceId) => {
    setDevices(prev => prev.map(d => 
      d.id === deviceId ? { ...d, online: !d.online } : d
    ));
  };

  const runAntiEntropy = async () => {
    try {
      const response = await base44.functions.invoke('CRDTSyncFabric', {
        action: 'anti_entropy_sync',
        node_a_id: 'phone',
        node_b_id: 'watch'
      });

      console.log('Anti-entropy result:', response.data);
    } catch (error) {
      console.error('Anti-entropy failed:', error);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-violet-950/90 via-purple-950/90 to-fuchsia-950/90 backdrop-blur-xl border-violet-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <GitBranch className="w-7 h-7 text-violet-400" />
          CRDT Sync Fabric: The "Soul"
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Delta-State CRDTs for eventual consistency
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[450px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-violet-500/20">
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />

            {/* Device nodes */}
            {devices.map((device) => (
              <DeviceNode
                key={device.id}
                position={device.position}
                device={device.id}
                hasDelta={device.hasDelta}
                isOnline={device.online}
              />
            ))}

            {/* Connections between devices */}
            {devices.map((device, idx) => {
              if (!device.online) return null;
              return devices.slice(idx + 1).map((otherDevice, otherIdx) => {
                if (!otherDevice.online) return null;
                return (
                  <Line
                    key={`conn_${idx}_${otherIdx}`}
                    points={[
                      new THREE.Vector3(...device.position),
                      new THREE.Vector3(...otherDevice.position)
                    ]}
                    color="#8b5cf6"
                    lineWidth={1}
                    opacity={0.3}
                    transparent
                  />
                );
              });
            })}

            {/* Central lattice representation */}
            <group position={[0, 0, 0]}>
              <Sphere args={[0.15, 32, 32]}>
                <meshStandardMaterial
                  color="#fbbf24"
                  emissive="#fbbf24"
                  emissiveIntensity={isSyncing ? 1.5 : 0.6}
                />
              </Sphere>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color="#fbbf24" anchorX="center">
                Join ⊔
              </Text>
            </group>

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {devices.map((device) => (
            <Button
              key={device.id}
              size="sm"
              onClick={() => toggleDeviceOnline(device.id)}
              className={device.online ? 'bg-green-600' : 'bg-gray-600'}
            >
              <Wifi className="w-3 h-3 mr-1" />
              {device.id}
            </Button>
          ))}
        </div>

        {syncResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 rounded-lg p-4 border border-violet-500/30 mb-4"
          >
            <div className="text-violet-400 font-bold text-sm mb-2">Sync Status</div>
            <div className="space-y-1 text-xs">
              <div className="text-gray-300">Delta ID: {syncResult.delta_id}</div>
              <div className="text-gray-300">Payload Size: {syncResult.delta.payload_size_bytes} bytes</div>
              <Badge className={syncResult.delta.eventual_consistency_achieved ? 'bg-green-600' : 'bg-amber-600'}>
                {syncResult.delta.eventual_consistency_achieved ? 'Converged' : 'Propagating'}
              </Badge>
            </div>
          </motion.div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={generateDelta}
            disabled={isSyncing}
            className="flex-1 bg-violet-600 hover:bg-violet-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {isSyncing ? 'Syncing...' : 'Generate & Propagate Delta'}
          </Button>
          <Button
            onClick={runAntiEntropy}
            variant="outline"
            className="border-violet-500/50 text-violet-300"
          >
            Anti-Entropy
          </Button>
        </div>

        <div className="mt-4 bg-black/40 rounded-lg p-3 border border-violet-500/20">
          <div className="text-violet-300 text-xs font-mono">
            X' = X ⊔ m^δ(X)
          </div>
          <p className="text-gray-400 text-[10px] mt-1">
            Delta-mutator ensures monotonic state growth with associative, commutative, idempotent join
          </p>
        </div>
      </CardContent>
    </Card>
  );
}