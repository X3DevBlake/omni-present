import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Trail, Html } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Lock } from 'lucide-react';

function MessagePacket({ message, position, targetPosition }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && targetPosition) {
      const t = (Math.sin(state.clock.elapsedTime * 1.5) + 1) / 2;
      meshRef.current.position.lerpVectors(
        { x: position[0], y: position[1], z: position[2] },
        { x: targetPosition[0], y: targetPosition[1], z: targetPosition[2] },
        t
      );
      meshRef.current.rotation.x = state.clock.elapsedTime * 2;
      meshRef.current.rotation.y = state.clock.elapsedTime;
    }
  });

  const statusColor = {
    'pending': '#94a3b8',
    'transmitting': '#3b82f6',
    'delivered': '#22c55e',
    'failed': '#ef4444',
    'retrying': '#f59e0b'
  }[message.transmission_status] || '#3b82f6';

  const encryptionColor = {
    'none': '#6b7280',
    'standard': '#3b82f6',
    'military': '#8b5cf6',
    'quantum': '#ec4899'
  }[message.encryption_level] || '#3b82f6';

  return (
    <group>
      <Trail
        width={1}
        length={8}
        color={statusColor}
        attenuation={(t) => t * t}
      >
        <mesh ref={meshRef} position={position}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial
            color={statusColor}
            emissive={encryptionColor}
            emissiveIntensity={message.ai_optimized ? 1.5 : 0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </Trail>
      {meshRef.current && (
        <Html position={meshRef.current.position}>
          <div className="bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap -translate-x-1/2 -translate-y-8">
            {message.message_id}
            {message.encryption_level !== 'none' && (
              <Lock className="w-3 h-3 inline ml-1" />
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function RedCommMessageStream3D() {
  const { data: messages = [] } = useQuery({
    queryKey: ['redcomm-messages-stream'],
    queryFn: () => base44.entities.RedCommMessage.list('-created_date', 15),
    refetchInterval: 2000
  });

  const activeMessages = messages.filter(m => m.transmission_status === 'transmitting');
  const deliveredCount = messages.filter(m => m.transmission_status === 'delivered').length;
  const totalPayload = messages.reduce((sum, m) => sum + (m.payload_size_kb || 0), 0);

  const devicePositions = {
    'RCX-001': [-4, 0, 0],
    'RCX-002': [0, 0, 0],
    'RCX-003': [4, 0, 0],
    'central_hub': [0, 3, 0]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-blue-900/30 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center gap-2">
            <Send className="w-6 h-6 text-blue-400" />
            RedComm Message Stream - Real-Time 3D
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
              {activeMessages.length} In Flight
            </Badge>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
              {deliveredCount} Delivered
            </Badge>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
              {(totalPayload / 1024).toFixed(2)} MB Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] bg-black/40 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />

              {/* Render message packets */}
              {messages.map((message) => {
                const sourcePos = devicePositions[message.source_device_id] || [0, 0, 0];
                const destPos = devicePositions[message.destination_device_id] || [0, 0, 0];
                return (
                  <MessagePacket
                    key={message.id}
                    message={message}
                    position={sourcePos}
                    targetPosition={destPos}
                  />
                );
              })}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          <div className="mt-6 space-y-2">
            {messages.slice(0, 5).map((msg) => (
              <div key={msg.id} className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    {msg.message_id}
                    {msg.ai_optimized && (
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-400 text-xs">
                        AI Optimized
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {msg.source_device_id} → {msg.destination_device_id} • 
                    {msg.payload_size_kb} KB • {msg.latency_ms}ms
                  </div>
                </div>
                <Badge variant="outline" className={
                  msg.transmission_status === 'delivered' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                  msg.transmission_status === 'transmitting' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                  'bg-gray-500/20 text-gray-400 border-gray-500/50'
                }>
                  {msg.transmission_status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}