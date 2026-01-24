import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Html } from '@react-three/drei';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Award, Shield, Download, Share2 } from 'lucide-react';
import * as THREE from 'three';

const HolographicCertificate = ({ certification }) => {
  const meshRef = useRef();
  const particlesRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.3;
    }
    
    if (particlesRef.current) {
      particlesRef.current.rotation.z += 0.001;
    }
  });

  const particleCount = 100;
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 4 + Math.random();
    particles.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        (Math.random() - 0.5) * 2
      )
    );
  }

  return (
    <group>
      {/* Certificate Card */}
      <Box ref={meshRef} args={[5, 7, 0.2]}>
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.3}
          transparent
          opacity={0.9}
        />
      </Box>

      {/* Particles */}
      <group ref={particlesRef}>
        {particles.map((pos, idx) => (
          <mesh key={idx} position={pos}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Certificate Content */}
      <Html distanceFactor={6} transform>
        <div className="w-96 h-[32rem] bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-xl rounded-2xl border-4 border-yellow-400/50 p-8 text-center">
          <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Certificate of Achievement</h2>
          <div className="h-px bg-yellow-400/50 w-full mb-4"></div>
          <p className="text-gray-300 text-sm mb-6">This certifies that</p>
          <h3 className="text-xl font-bold text-white mb-6">{certification.recipient_id}</h3>
          <p className="text-gray-300 text-sm mb-2">has successfully completed</p>
          <h4 className="text-lg font-bold text-white mb-6">{certification.title}</h4>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">Blockchain Verified</span>
          </div>
          <p className="text-xs text-gray-400 font-mono">
            {certification.blockchain_record?.transaction_hash?.substring(0, 30)}...
          </p>
          <div className="mt-6 text-xs text-gray-400">
            Issued: {new Date(certification.issued_date).toLocaleDateString()}
          </div>
        </div>
      </Html>
    </group>
  );
};

export default function CertificationViewer3D({ certificationId }) {
  const { data: certification } = useQuery({
    queryKey: ['certification', certificationId],
    queryFn: async () => {
      const certs = await base44.entities.Certification.filter({ certification_id: certificationId });
      return certs[0];
    },
    enabled: !!certificationId
  });

  if (!certification) {
    return (
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-8">
        <p className="text-white text-center">Loading certification...</p>
      </Card>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 relative">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 right-6 z-10"
      >
        <Card className="bg-black/40 backdrop-blur-xl border-white/20 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Holographic Certificate</h2>
            <div className="flex gap-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button size="sm" variant="outline" className="border-white/20 text-white">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#fbbf24" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

        <HolographicCertificate certification={certification} />

        <OrbitControls enableZoom enablePan />
      </Canvas>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-6 left-6 right-6 z-10"
      >
        <Card className="bg-black/60 backdrop-blur-xl border-white/20 p-4 text-white">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-400 mb-1">Blockchain</div>
              <div className="font-semibold">{certification.blockchain_record?.blockchain}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Block #</div>
              <div className="font-semibold">{certification.blockchain_record?.block_number}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">NFT Token</div>
              <div className="font-semibold">{certification.blockchain_record?.nft_token_id?.substring(0, 10)}...</div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}