import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Shield } from 'lucide-react';

function AuditNode({ audit, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
    }
  });

  const color = audit.transparency_score > 0.8 ? '#22c55e' : 
                audit.transparency_score > 0.6 ? '#eab308' : '#ef4444';

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
      <Html distanceFactor={10}>
        <div className="bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          <div className="font-bold">{audit.action_type}</div>
          <div className="text-green-400">{(audit.transparency_score * 100).toFixed(0)}%</div>
        </div>
      </Html>
    </group>
  );
}

export default function GovernanceEthicalAuditTrail3D() {
  const { data: audits = [] } = useQuery({
    queryKey: ['governance-audits'],
    queryFn: () => base44.entities.GovernanceEthicalAudit.list('-created_date', 20),
    refetchInterval: 5000
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-indigo-900/30 border-indigo-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-indigo-400" />
            Governance Ethical Audit Trail
          </CardTitle>
          <Badge variant="outline" className="bg-indigo-500/20 text-indigo-400 border-indigo-500/50 mt-4">
            {audits.length} Audit Records
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 3D Audit Trail */}
          <div className="h-[350px] bg-black/50 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[5, 5, 5]} intensity={1} color="#6366f1" />

              {audits.slice(0, 15).map((audit, idx) => {
                const position = [
                  (idx % 5 - 2) * 1.5,
                  Math.floor(idx / 5) * 1.5,
                  0
                ];
                
                return (
                  <AuditNode
                    key={audit.id}
                    audit={audit}
                    position={position}
                  />
                );
              })}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          {/* Audit Records */}
          <div className="space-y-3">
            {audits.slice(0, 3).map((audit) => (
              <div key={audit.id} className="bg-gray-800/50 rounded-lg p-4 border border-indigo-500/20">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="bg-indigo-500/20 text-indigo-400 border-indigo-500/50">
                    {audit.action_type}
                  </Badge>
                  <Badge variant="outline" className={
                    audit.transparency_score > 0.8 ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                  }>
                    {(audit.transparency_score * 100).toFixed(0)}% Transparent
                  </Badge>
                </div>

                <div className="text-sm text-gray-400 mb-2">
                  Decision: {audit.decision_maker}
                </div>

                {audit.ethical_justification && (
                  <div className="bg-purple-500/10 rounded p-3 mb-2">
                    <div className="text-xs text-purple-400 font-semibold mb-1">Ethical Justification:</div>
                    <p className="text-xs text-gray-300">{audit.ethical_justification}</p>
                  </div>
                )}

                {audit.stakeholder_impact && audit.stakeholder_impact.length > 0 && (
                  <div className="bg-blue-500/10 rounded p-3">
                    <div className="text-xs text-blue-400 font-semibold mb-2">Stakeholder Impact:</div>
                    {audit.stakeholder_impact.slice(0, 2).map((impact, idx) => (
                      <div key={idx} className="text-xs text-gray-300 mb-1">
                        • {impact.stakeholder_group}: {impact.impact_type}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}