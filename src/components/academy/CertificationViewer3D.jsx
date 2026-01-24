import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, RoundedBox, Html } from '@react-three/drei';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Award, Shield, ExternalLink, Download, Share2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import * as THREE from 'three';

const CredentialBadge3D = ({ certification, onClick }) => {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
    if (glowRef.current) {
      const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group onClick={onClick}>
      {/* Glow effect */}
      <Sphere ref={glowRef} args={[1.5, 32, 32]}>
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.2} />
      </Sphere>

      {/* Main badge */}
      <RoundedBox ref={meshRef} args={[1.2, 1.5, 0.2]} radius={0.1}>
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.8}
          roughness={0.2}
          emissive="#f59e0b"
          emissiveIntensity={0.5}
        />
      </RoundedBox>

      {/* Blockchain indicator */}
      <Sphere args={[0.15, 16, 16]} position={[0.6, 0.6, 0.15]}>
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1} />
      </Sphere>

      <Text
        position={[0, -1.2, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        maxWidth={2}
      >
        {certification.title?.substring(0, 30)}
      </Text>
    </group>
  );
};

const BlockchainProofVisualizer = ({ blockchain_record }) => {
  const nodesRef = useRef([]);

  useFrame((state) => {
    nodesRef.current.forEach((node, idx) => {
      if (node) {
        const speed = 1 + idx * 0.2;
        node.rotation.y = state.clock.elapsedTime * speed;
      }
    });
  });

  const blocks = Array.from({ length: 5 }, (_, i) => i);

  return (
    <group>
      {blocks.map((_, idx) => {
        const x = (idx - 2) * 2;
        return (
          <mesh
            key={idx}
            ref={(el) => (nodesRef.current[idx] = el)}
            position={[x, 0, 0]}
          >
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial
              color={idx === 2 ? '#3b82f6' : '#6b7280'}
              wireframe
              emissive={idx === 2 ? '#3b82f6' : '#000000'}
              emissiveIntensity={idx === 2 ? 0.5 : 0}
            />
          </mesh>
        );
      })}
      
      {/* Connection lines */}
      {blocks.slice(0, -1).map((_, idx) => {
        const start = [(idx - 2) * 2, 0, 0];
        const end = [(idx - 1) * 2, 0, 0];
        const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
        return (
          <line key={`line-${idx}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={points.length}
                array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#3b82f6" />
          </line>
        );
      })}
    </group>
  );
};

export default function CertificationViewer3D({ userId }) {
  const [selectedCert, setSelectedCert] = React.useState(null);

  const { data: certifications = [] } = useQuery({
    queryKey: ['certifications', userId],
    queryFn: () => base44.entities.Certification.filter({ recipient_id: userId }),
    enabled: !!userId
  });

  const verifyMutation = useMutation({
    mutationFn: async (certId) => {
      const response = await base44.functions.invoke('blockchainCredentialIssuer', {
        action: 'verify_credential',
        certification_id: certId
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.valid) {
        toast.success('Credential verified on blockchain!');
      } else {
        toast.error('Credential verification failed');
      }
    }
  });

  const downloadNFTMutation = useMutation({
    mutationFn: async (certId) => {
      const response = await base44.functions.invoke('blockchainCredentialIssuer', {
        action: 'generate_credential_nft',
        certification_id: certId
      });
      return response.data;
    },
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data.nft_metadata, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'credential-nft-metadata.json';
      a.click();
      toast.success('NFT metadata downloaded!');
    }
  });

  const certPositions = certifications.map((_, idx) => {
    const angle = (idx / certifications.length) * Math.PI * 2;
    const radius = 4;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
  });

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 h-[600px] relative">
        <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#fbbf24" />

          {/* Central hub */}
          <Sphere args={[0.8, 64, 64]}>
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={0.6}
              transparent
              opacity={0.4}
            />
          </Sphere>

          {/* Credential badges */}
          {certifications.map((cert, idx) => (
            <group key={cert.id} position={certPositions[idx]}>
              <CredentialBadge3D
                certification={cert}
                onClick={() => setSelectedCert(cert)}
              />
            </group>
          ))}

          {/* Blockchain visualization */}
          {selectedCert?.blockchain_record && (
            <group position={[0, -4, 0]}>
              <BlockchainProofVisualizer blockchain_record={selectedCert.blockchain_record} />
            </group>
          )}

          <OrbitControls enableZoom enablePan />
        </Canvas>

        {/* Selected Credential Details */}
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 w-96"
          >
            <Card className="bg-black/90 backdrop-blur-xl border-white/20 text-white">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-amber-400" />
                    <CardTitle className="text-lg">{selectedCert.title}</CardTitle>
                  </div>
                  <button
                    onClick={() => setSelectedCert(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-300">{selectedCert.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Issued:</span>
                      <span>{new Date(selectedCert.issued_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Grade:</span>
                      <Badge className="bg-amber-500">{selectedCert.grade}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Blockchain:</span>
                      <Badge className="bg-blue-500">
                        {selectedCert.blockchain_record?.blockchain}
                      </Badge>
                    </div>
                  </div>

                  {/* Blockchain Proof */}
                  {selectedCert.blockchain_record && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-semibold">Blockchain Anchored</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tx Hash:</span>
                          <span className="font-mono text-[10px]">
                            {selectedCert.blockchain_record.transaction_hash?.substring(0, 12)}...
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Block:</span>
                          <span>{selectedCert.blockchain_record.block_number}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {selectedCert.skills_acquired && (
                    <div>
                      <h4 className="text-xs font-semibold mb-2 text-gray-400">Skills Acquired</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCert.skills_acquired.map((skill, idx) => (
                          <Badge key={idx} className="bg-green-600 text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => verifyMutation.mutate(selectedCert.certification_id)}
                      disabled={verifyMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="w-3 h-3 mr-2" />
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(selectedCert.verification_url, '_blank')}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <ExternalLink className="w-3 h-3 mr-2" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadNFTMutation.mutate(selectedCert.certification_id)}
                      disabled={downloadNFTMutation.isPending}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Download className="w-3 h-3 mr-2" />
                      NFT
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Share2 className="w-3 h-3 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-white">{certifications.length}</div>
            <div className="text-sm text-gray-400">Total Credentials</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-white">
              {certifications.filter(c => c.blockchain_record).length}
            </div>
            <div className="text-sm text-gray-400">Blockchain Verified</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-white">
              {certifications.filter(c => c.certification_type === 'research_publication').length}
            </div>
            <div className="text-sm text-gray-400">Publications</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}