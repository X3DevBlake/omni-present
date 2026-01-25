import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html, Float } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Users, MessageSquare, UserPlus, Video, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import * as THREE from 'three';

const PeerNode = ({ peer, position, onClick, isSelected }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = isSelected ? 1.4 : hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.12);
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.6;
    }
  });
  
  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5}>
        <Sphere 
          ref={meshRef}
          args={[0.3, 32, 32]}
          onClick={(e) => {
            e.stopPropagation();
            onClick(peer);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <meshPhysicalMaterial
            color={peer.online ? '#22c55e' : '#6b7280'}
            emissive={peer.online ? '#22c55e' : '#6b7280'}
            emissiveIntensity={isSelected ? 1.8 : hovered ? 1.2 : 0.8}
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>
        
        {(hovered || isSelected) && (
          <Html distanceFactor={8}>
            <div className="bg-black/95 border-2 border-green-400 rounded-xl p-4 min-w-[220px] backdrop-blur-xl">
              <div className="text-green-400 font-bold text-sm mb-2">{peer.name}</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <Badge className={peer.online ? 'bg-green-600' : 'bg-gray-600'}>
                    {peer.online ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Specialization:</span>
                  <span className="text-white">{peer.specialization}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-400 font-bold">{peer.rating}</span>
                  <span className="text-gray-400">({peer.reviews} reviews)</span>
                </div>
              </div>
            </div>
          </Html>
        )}
      </Float>
      
      <Text position={[0, -0.5, 0]} fontSize={0.1} color="white" anchorX="center">
        {peer.name.split(' ')[0]}
      </Text>
    </group>
  );
};

export default function PeerCollaborationNetwork3D() {
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const peers = [
    { id: 1, name: 'Sarah Chen', online: true, specialization: 'Quantum AI', rating: 4.9, reviews: 47 },
    { id: 2, name: 'Marcus Rodriguez', online: true, specialization: 'Neural Interfaces', rating: 4.8, reviews: 52 },
    { id: 3, name: 'Aisha Patel', online: false, specialization: 'Consciousness Theory', rating: 5.0, reviews: 38 },
    { id: 4, name: 'James Wilson', online: true, specialization: 'Holographic Systems', rating: 4.7, reviews: 29 },
    { id: 5, name: 'Yuki Tanaka', online: true, specialization: 'CRDT Architecture', rating: 4.9, reviews: 41 },
    { id: 6, name: 'Elena Volkov', online: false, specialization: 'Active Inference', rating: 4.8, reviews: 35 }
  ];

  const peerPositions = peers.map((peer, idx) => {
    const angle = (idx / peers.length) * Math.PI * 2;
    const radius = 4;
    return {
      peer,
      position: [Math.cos(angle) * radius, Math.sin(angle) * 1.5, Math.sin(angle) * radius]
    };
  });

  return (
    <Card className="bg-gradient-to-br from-green-950/90 via-emerald-950/90 to-teal-950/90 backdrop-blur-xl border-green-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Users className="w-7 h-7 text-green-400" />
          Peer Collaboration Network
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">Connect with fellow researchers and learners</p>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-green-500/20">
          <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#10b981" />
            
            {/* Central you */}
            <Float speed={1.5} rotationIntensity={0.4}>
              <Sphere args={[0.5, 64, 64]} position={[0, 0, 0]}>
                <meshPhysicalMaterial
                  color="#ec4899"
                  emissive="#ec4899"
                  emissiveIntensity={1.3}
                  metalness={0.9}
                  roughness={0.1}
                />
              </Sphere>
              <Text position={[0, 0.8, 0]} fontSize={0.18} color="#ec4899" anchorX="center">
                You
              </Text>
            </Float>

            {peerPositions.map(({ peer, position }) => (
              <React.Fragment key={peer.id}>
                <PeerNode
                  peer={peer}
                  position={position}
                  onClick={setSelectedPeer}
                  isSelected={selectedPeer?.id === peer.id}
                />
                
                <Line
                  points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(...position)]}
                  color={peer.online ? '#22c55e' : '#6b7280'}
                  lineWidth={selectedPeer?.id === peer.id ? 2.5 : 1}
                  transparent
                  opacity={peer.online ? 0.6 : 0.3}
                />
              </React.Fragment>
            ))}

            <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        {selectedPeer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-green-950/40 border border-green-500/40 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold text-xl">{selectedPeer.name}</h3>
                <p className="text-gray-400 text-sm">{selectedPeer.specialization}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-white font-bold">{selectedPeer.rating}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Video className="w-4 h-4 mr-2" />
                Video Call
              </Button>
              <Button variant="outline" className="border-white/20 text-white">
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-green-950/30 rounded-lg p-3 text-center border border-green-500/30">
            <div className="text-white font-bold text-xl">{peers.filter(p => p.online).length}</div>
            <div className="text-gray-400 text-xs">Online Now</div>
          </div>
          <div className="bg-purple-950/30 rounded-lg p-3 text-center border border-purple-500/30">
            <div className="text-white font-bold text-xl">{peers.length}</div>
            <div className="text-gray-400 text-xs">Total Peers</div>
          </div>
          <div className="bg-amber-950/30 rounded-lg p-3 text-center border border-amber-500/30">
            <div className="text-white font-bold text-xl">4.8</div>
            <div className="text-gray-400 text-xs">Avg Rating</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}