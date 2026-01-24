import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sphere, Line } from '@react-three/drei';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, ShieldAlert, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';

function ThreatNode({ threat, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.05;
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.3 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const severityColor = {
    'low': '#3b82f6',
    'medium': '#eab308',
    'high': '#f97316',
    'critical': '#ef4444',
    'existential': '#dc2626'
  }[threat.severity] || '#ef4444';

  return (
    <group position={position}>
      <Sphere args={[0.4, 16, 16]}>
        <meshStandardMaterial
          color={severityColor}
          emissive={severityColor}
          emissiveIntensity={2}
        />
      </Sphere>
      <Html distanceFactor={10}>
        <div className="bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          <div className="font-bold text-red-400">{threat.threat_type}</div>
          <div className="text-gray-400">{threat.severity}</div>
        </div>
      </Html>
    </group>
  );
}

function FirewallShield() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[4, 32, 32]} />
      <meshStandardMaterial
        color="#22c55e"
        emissive="#22c55e"
        emissiveIntensity={0.5}
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

export default function SecurityThreatDashboard3D() {
  const queryClient = useQueryClient();

  const { data: threats = [] } = useQuery({
    queryKey: ['redcomm-threats'],
    queryFn: () => base44.entities.RedCommSecurityThreat.list('-created_date', 20),
    refetchInterval: 5000
  });

  const runThreatDetection = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('redcomm/threatDetectionEngine', {});
      return response.data;
    },
    onSuccess: (data) => {
      if (data.critical_threats > 0) {
        toast.error(`${data.critical_threats} CRITICAL threats detected!`);
      } else {
        toast.success(`Threat scan complete. ${data.threats_detected} threats detected.`);
      }
      queryClient.invalidateQueries({ queryKey: ['redcomm-threats'] });
    }
  });

  const activeThreats = threats.filter(t => t.containment_status !== 'neutralized');
  const criticalThreats = threats.filter(t => t.severity === 'critical');
  const neutralizedThreats = threats.filter(t => t.containment_status === 'neutralized');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-red-900/30 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            RedComm Security Threat Dashboard
          </CardTitle>
          <div className="flex gap-3 mt-4">
            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {activeThreats.length} Active
            </Badge>
            <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/50">
              {criticalThreats.length} Critical
            </Badge>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
              {neutralizedThreats.length} Neutralized
            </Badge>
          </div>
          <Button
            onClick={() => runThreatDetection.mutate()}
            disabled={runThreatDetection.isPending}
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            {runThreatDetection.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Run Threat Detection Scan
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 3D Threat Visualization */}
          <div className="h-[450px] bg-black/50 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
              <ambientLight intensity={0.2} />
              <pointLight position={[5, 5, 5]} intensity={1} color="#ef4444" />

              {/* Firewall shield */}
              <FirewallShield />

              {/* Threat nodes */}
              {threats.slice(0, 12).map((threat, idx) => {
                const angle = (idx / 12) * Math.PI * 2;
                const radius = 5;
                const position = [
                  Math.cos(angle) * radius,
                  Math.sin(idx * 0.5) * 2,
                  Math.sin(angle) * radius
                ];
                
                return (
                  <ThreatNode
                    key={threat.id}
                    threat={threat}
                    position={position}
                  />
                );
              })}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          {/* Threat Details */}
          <div className="space-y-3">
            {threats.slice(0, 4).map((threat) => (
              <div key={threat.id} className={`rounded-lg p-4 border ${
                threat.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                threat.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                'bg-yellow-500/10 border-yellow-500/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-white">{threat.threat_id}</div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={
                      threat.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                      'bg-orange-500/20 text-orange-400 border-orange-500/50'
                    }>
                      {threat.severity}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                      {threat.containment_status}
                    </Badge>
                  </div>
                </div>

                <div className="text-sm text-gray-300 mb-2">
                  <span className="font-semibold">Type:</span> {threat.threat_type}
                </div>

                {threat.ai_threat_analysis && (
                  <div className="bg-black/30 rounded p-3 mb-2">
                    <div className="text-xs text-red-400 font-semibold mb-1">AI Analysis:</div>
                    <p className="text-xs text-gray-300">{threat.ai_threat_analysis}</p>
                  </div>
                )}

                {threat.ai_response_actions && threat.ai_response_actions.length > 0 && (
                  <div className="bg-green-500/10 rounded p-3">
                    <div className="text-xs text-green-400 font-semibold mb-2">AI Response Actions:</div>
                    <div className="space-y-1">
                      {threat.ai_response_actions.slice(0, 3).map((action, idx) => (
                        <div key={idx} className="text-xs text-gray-300 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          {action.action} ({(action.effectiveness * 100).toFixed(0)}% effective)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {threat.firewall_rules_updated && threat.firewall_rules_updated.length > 0 && (
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <Shield className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-blue-400">
                      {threat.firewall_rules_updated.length} firewall rules applied
                    </span>
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