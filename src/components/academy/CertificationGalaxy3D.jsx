import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html, Float, MeshDistortMaterial } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Award, Download, Share2, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import * as THREE from 'three';

const CertificateOrb = ({ cert, position, onClick, isSelected }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = isSelected ? 1.6 : hovered ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.12);
      meshRef.current.rotation.y = state.clock.elapsedTime * (isSelected ? 1.5 : 0.4);
    }
  });

  const tierColors = {
    beginner: '#3b82f6',
    intermediate: '#8b5cf6',
    advanced: '#ec4899',
    expert: '#fbbf24'
  };
  
  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.8}>
        <Sphere 
          ref={meshRef}
          args={[0.4, 32, 32]}
          onClick={(e) => {
            e.stopPropagation();
            onClick(cert);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <MeshDistortMaterial
            color={tierColors[cert.tier] || '#8b5cf6'}
            distort={hovered ? 0.5 : 0.3}
            speed={isSelected ? 3 : 2}
            roughness={0.1}
            metalness={0.9}
          />
        </Sphere>
        
        {(hovered || isSelected) && (
          <Html distanceFactor={8}>
            <div className="bg-black/95 border-2 border-amber-400 rounded-xl p-4 min-w-[260px] backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-amber-400" />
                <div className="text-amber-400 font-bold text-sm">{cert.name}</div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tier:</span>
                  <Badge className={`bg-${cert.tier === 'expert' ? 'amber' : 'purple'}-600`}>
                    {cert.tier}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Issued:</span>
                  <span className="text-white">{cert.issued_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Credential ID:</span>
                  <span className="text-cyan-400 font-mono">{cert.id?.slice(0, 8)}</span>
                </div>
              </div>
            </div>
          </Html>
        )}
      </Float>
      
      <Text position={[0, -0.7, 0]} fontSize={0.12} color="white" anchorX="center">
        {cert.name.split(' ')[0]}
      </Text>
    </group>
  );
};

export default function CertificationGalaxy3D() {
  const [selectedCert, setSelectedCert] = useState(null);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: certifications = [] } = useQuery({
    queryKey: ['certifications', user?.email],
    queryFn: async () => {
      const data = await base44.entities.Certification.filter({ user_email: user?.email });
      return data;
    },
    enabled: !!user
  });

  const sampleCerts = certifications.length > 0 ? certifications : [
    { id: 1, name: 'Deep Learning Expert', tier: 'expert', issued_date: '2026-01-15' },
    { id: 2, name: 'Quantum Computing', tier: 'advanced', issued_date: '2026-01-10' },
    { id: 3, name: 'Consciousness Engineering', tier: 'intermediate', issued_date: '2026-01-05' },
    { id: 4, name: 'Neural Interfaces', tier: 'beginner', issued_date: '2025-12-20' }
  ];

  const certPositions = sampleCerts.map((cert, idx) => {
    const angle = (idx / sampleCerts.length) * Math.PI * 2;
    const radius = 3.5;
    return {
      cert,
      position: [Math.cos(angle) * radius, Math.sin(angle) * 1.5, Math.sin(angle) * radius]
    };
  });

  return (
    <Card className="bg-gradient-to-br from-amber-950/90 via-orange-950/90 to-yellow-950/90 backdrop-blur-xl border-amber-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Award className="w-7 h-7 text-amber-400" />
          Certification Galaxy
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">Your earned credentials in 3D space</p>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-amber-500/20">
          <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#fbbf24" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#f59e0b" />

            {/* Central achievement core */}
            <Float speed={1.5} rotationIntensity={0.4}>
              <Sphere args={[0.5, 64, 64]} position={[0, 0, 0]}>
                <meshPhysicalMaterial
                  color="#fbbf24"
                  emissive="#fbbf24"
                  emissiveIntensity={1.5}
                  metalness={0.9}
                  roughness={0.1}
                />
              </Sphere>
            </Float>

            {certPositions.map(({ cert, position }) => (
              <CertificateOrb
                key={cert.id}
                cert={cert}
                position={position}
                onClick={setSelectedCert}
                isSelected={selectedCert?.id === cert.id}
              />
            ))}

            <OrbitControls enableZoom autoRotate autoRotateSpeed={0.8} />
          </Canvas>
        </div>

        {selectedCert && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-12 h-12 text-amber-400" />
              <div>
                <h3 className="text-white font-bold text-xl">{selectedCert.name}</h3>
                <Badge className="bg-amber-600 mt-1">{selectedCert.tier}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="border-white/20 text-white">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}