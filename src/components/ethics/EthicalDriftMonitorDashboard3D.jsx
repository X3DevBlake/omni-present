import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';

function DriftAlertNode({ alert, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.03;
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const severityColor = {
    'minimal': '#22c55e',
    'moderate': '#eab308',
    'significant': '#f97316',
    'critical': '#ef4444'
  }[alert.drift_severity] || '#ef4444';

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color={severityColor}
          emissive={severityColor}
          emissiveIntensity={2}
        />
      </mesh>
      <Html distanceFactor={10}>
        <div className="bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          <div className="font-bold text-red-400">{alert.monitored_entity_type}</div>
          <div className="text-gray-400">Alignment: {(alert.human_value_alignment_score * 100).toFixed(0)}%</div>
        </div>
      </Html>
    </group>
  );
}

function EthicalPrincipleRing({ violated }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[3, 0.1, 16, 100]} />
      <meshStandardMaterial
        color={violated ? '#ef4444' : '#22c55e'}
        emissive={violated ? '#ef4444' : '#22c55e'}
        emissiveIntensity={1}
        wireframe
      />
    </mesh>
  );
}

export default function EthicalDriftMonitorDashboard3D() {
  const queryClient = useQueryClient();

  const { data: alerts = [] } = useQuery({
    queryKey: ['ethical-alerts'],
    queryFn: () => base44.entities.EthicalMonitoringAlert.list('-created_date', 20),
    refetchInterval: 5000
  });

  const runMonitoring = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('ethics/ethicalDriftMonitor', {});
      return response.data;
    },
    onSuccess: (data) => {
      if (data.critical_drift_detected) {
        toast.error(`CRITICAL ethical drift detected!`);
      } else {
        toast.success(`Ethical monitoring complete. ${data.total_alerts} alerts generated.`);
      }
      queryClient.invalidateQueries({ queryKey: ['ethical-alerts'] });
    }
  });

  const driftDetected = alerts.filter(a => a.ethical_drift_detected);
  const criticalAlerts = alerts.filter(a => a.drift_severity === 'critical');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-purple-900/30 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            Ethical Drift Monitor - Real-Time AI Guardian
          </CardTitle>
          <div className="flex gap-3 mt-4">
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
              {driftDetected.length} Drift Alerts
            </Badge>
            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {criticalAlerts.length} Critical
            </Badge>
          </div>
          <Button
            onClick={() => runMonitoring.mutate()}
            disabled={runMonitoring.isPending}
            className="mt-4 bg-purple-600 hover:bg-purple-700"
          >
            {runMonitoring.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Monitoring...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Run Ethical Drift Scan
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 3D Visualization */}
          <div className="h-[400px] bg-black/50 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[5, 5, 5]} intensity={1} color="#a855f7" />

              <EthicalPrincipleRing violated={criticalAlerts.length > 0} />

              {alerts.slice(0, 10).map((alert, idx) => {
                const angle = (idx / 10) * Math.PI * 2;
                const radius = 4;
                const position = [
                  Math.cos(angle) * radius,
                  Math.sin(idx * 0.5),
                  Math.sin(angle) * radius
                ];
                
                return (
                  <DriftAlertNode
                    key={alert.id}
                    alert={alert}
                    position={position}
                  />
                );
              })}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          {/* Alert Details */}
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-white">{alert.alert_id}</div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={
                      alert.drift_severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                      alert.drift_severity === 'significant' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' :
                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                    }>
                      {alert.drift_severity}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                      {alert.human_review_status}
                    </Badge>
                  </div>
                </div>

                <div className="text-sm text-gray-300 mb-2">
                  <span className="font-semibold">Type:</span> {alert.monitored_entity_type}
                </div>

                <div className="bg-purple-500/10 rounded p-3 mb-3">
                  <div className="text-xs text-purple-400 font-semibold mb-1">AI Ethical Analysis:</div>
                  <p className="text-xs text-gray-300">{alert.ai_ethical_analysis}</p>
                </div>

                {alert.violated_principles && alert.violated_principles.length > 0 && (
                  <div className="bg-red-500/10 rounded p-3 mb-3">
                    <div className="text-xs text-red-400 font-semibold mb-2">Violated Principles:</div>
                    {alert.violated_principles.map((vp, idx) => (
                      <div key={idx} className="text-xs text-gray-300 mb-1">
                        • {vp.principle_name}: {(vp.deviation_score * 100).toFixed(0)}% deviation
                      </div>
                    ))}
                  </div>
                )}

                {alert.suggested_adjustments && alert.suggested_adjustments.length > 0 && (
                  <div className="bg-green-500/10 rounded p-3">
                    <div className="text-xs text-green-400 font-semibold mb-2">Suggested Adjustments:</div>
                    {alert.suggested_adjustments.slice(0, 2).map((adj, idx) => (
                      <div key={idx} className="text-xs text-gray-300 mb-1">
                        • {adj.adjustment_type}: {adj.recommended_value}
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