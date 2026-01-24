import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const AnomalyNode = ({ position, severity, active }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && active) {
      meshRef.current.scale.setScalar(0.5 + Math.sin(state.clock.elapsedTime * 5) * 0.3);
      meshRef.current.material.emissiveIntensity = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.5;
    }
  });
  
  const severityColors = {
    critical: '#ef4444',
    high: '#f59e0b',
    medium: '#eab308',
    low: '#3b82f6'
  };
  
  return (
    <Sphere ref={meshRef} args={[0.3, 32, 32]} position={position}>
      <meshStandardMaterial
        color={severityColors[severity]}
        emissive={severityColors[severity]}
        emissiveIntensity={active ? 1.5 : 0.5}
      />
    </Sphere>
  );
};

export default function ProactiveAnomalyDetector3D() {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedAnomalies, setDetectedAnomalies] = useState([]);

  const { data: anomalies } = useQuery({
    queryKey: ['anomalies'],
    queryFn: () => base44.entities.AnomalyDetection.list('-created_date', 10),
    initialData: []
  });

  const runAnomalyDetection = async () => {
    setIsScanning(true);
    
    try {
      // Simulate market data monitoring
      const market_prices = Array(100).fill(0).map(() => 100 + Math.random() * 10);
      market_prices[50] = 150; // Inject anomaly
      market_prices[75] = 60;  // Inject anomaly

      const response = await base44.functions.invoke('proactiveAnomalyDetector', {
        detection_source: 'financial_market',
        monitoring_data: { prices: market_prices }
      });

      setDetectedAnomalies(response.data.anomalies || []);
    } catch (error) {
      console.error('Anomaly detection failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const anomalyPositions = detectedAnomalies.map((_, idx) => {
    const angle = (idx / detectedAnomalies.length) * Math.PI * 2;
    return {
      position: [Math.cos(angle) * 2, Math.sin(angle) * 2, 0],
      severity: detectedAnomalies[idx].severity
    };
  });

  return (
    <Card className="bg-gradient-to-br from-red-950/90 via-orange-950/90 to-amber-950/90 backdrop-blur-xl border-red-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-red-400" />
          Proactive Anomaly Detection
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Real-time AI-powered anomaly monitoring across all Omega systems
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-red-500/20">
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#ef4444" />

            {/* Central monitoring core */}
            <Sphere args={[0.4, 32, 32]} position={[0, 0, 0]}>
              <meshStandardMaterial
                color="#10b981"
                emissive="#10b981"
                emissiveIntensity={isScanning ? 1.5 : 0.6}
              />
            </Sphere>

            {/* Detected anomalies */}
            {anomalyPositions.map((anom, idx) => (
              <AnomalyNode
                key={idx}
                position={anom.position}
                severity={anom.severity}
                active={isScanning}
              />
            ))}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/60 rounded-lg p-3 border border-red-500/30">
            <div className="text-red-400 text-xs mb-1">Total Anomalies</div>
            <div className="text-white text-2xl font-bold">{anomalies.length}</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-amber-500/30">
            <div className="text-amber-400 text-xs mb-1">Active Scans</div>
            <div className="text-white text-2xl font-bold">{isScanning ? '1' : '0'}</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-green-500/30">
            <div className="text-green-400 text-xs mb-1">Auto-Remediated</div>
            <div className="text-white text-2xl font-bold">
              {anomalies.filter(a => a.auto_remediation_attempted).length}
            </div>
          </div>
        </div>

        {anomalies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 space-y-2 max-h-64 overflow-y-auto"
          >
            {anomalies.slice(0, 5).map((anomaly, idx) => (
              <div key={idx} className="bg-black/60 rounded-lg p-3 border border-red-500/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-white font-semibold text-sm">{anomaly.anomaly_type}</div>
                    <div className="text-gray-400 text-xs">{anomaly.detection_source}</div>
                  </div>
                  <Badge className={`bg-${anomaly.severity === 'critical' ? 'red' : 'amber'}-600`}>
                    {anomaly.severity}
                  </Badge>
                </div>
                <div className="text-xs text-gray-300">
                  Deviation: {anomaly.deviation_sigma?.toFixed(2)}σ
                </div>
                {anomaly.ai_analysis?.recommended_actions && (
                  <div className="text-xs text-green-400 mt-1">
                    AI Action: {anomaly.ai_analysis.recommended_actions[0]}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        <Button
          onClick={runAnomalyDetection}
          disabled={isScanning}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          <Activity className="w-4 h-4 mr-2" />
          {isScanning ? 'Scanning Systems...' : 'Run Anomaly Detection'}
        </Button>
      </CardContent>
    </Card>
  );
}