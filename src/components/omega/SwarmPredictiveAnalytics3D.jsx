import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Sphere, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const TrendLine = ({ points, color, prediction }) => {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current && prediction) {
      lineRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });
  
  return (
    <Line
      ref={lineRef}
      points={points.map(p => new THREE.Vector3(...p))}
      color={color}
      lineWidth={prediction ? 2 : 3}
      dashed={prediction}
      dashSize={0.1}
      gapSize={0.05}
    />
  );
};

const BottleneckIndicator = ({ position, severity }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.15;
      meshRef.current.scale.setScalar(0.2 + severity * 0.2 + pulse);
    }
  });
  
  return (
    <Sphere ref={meshRef} args={[0.2, 16, 16]} position={position}>
      <meshStandardMaterial
        color="#ef4444"
        emissive="#ef4444"
        emissiveIntensity={1.5}
      />
    </Sphere>
  );
};

export default function SwarmPredictiveAnalytics3D() {
  const [analytics, setAnalytics] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runPredictiveAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await base44.functions.invoke('omega/swarmPredictiveAnalytics', {
        swarm_id: 'haas_omega_001',
        prediction_horizon_hours: 24
      });
      
      setAnalytics(response.data);
    } catch (error) {
      console.error('Analytics failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const historicalPoints = analytics?.historical_performance?.map((val, idx) => [
    idx * 0.5 - 2,
    val * 2 - 1,
    0
  ]) || [];

  const predictedPoints = analytics?.predicted_performance?.map((val, idx) => [
    idx * 0.5,
    val * 2 - 1,
    0
  ]) || [];

  return (
    <Card className="bg-gradient-to-br from-blue-950/90 via-indigo-950/90 to-purple-950/90 backdrop-blur-xl border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-blue-400" />
          Swarm Predictive Analytics
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          AI-powered performance forecasting and bottleneck prediction
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-blue-500/20">
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />

            {historicalPoints.length > 0 && (
              <TrendLine points={historicalPoints} color="#10b981" prediction={false} />
            )}

            {predictedPoints.length > 0 && (
              <TrendLine points={predictedPoints} color="#f59e0b" prediction={true} />
            )}

            {analytics?.bottlenecks?.map((bottleneck, idx) => (
              <BottleneckIndicator
                key={idx}
                position={[bottleneck.time_offset * 0.5, bottleneck.severity * 2 - 1, 0]}
                severity={bottleneck.severity}
              />
            ))}

            <Text position={[-2.5, -2, 0]} fontSize={0.15} color="#10b981">
              Historical
            </Text>
            <Text position={[1.5, -2, 0]} fontSize={0.15} color="#f59e0b">
              Predicted
            </Text>

            <OrbitControls enableZoom enablePan />
          </Canvas>
        </div>

        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 mb-4"
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/60 rounded-lg p-3 border border-green-500/30">
                <div className="text-green-400 text-xs mb-1">Current Score</div>
                <div className="text-white text-2xl font-bold">
                  {(analytics.current_performance * 100).toFixed(0)}
                </div>
              </div>
              
              <div className="bg-black/60 rounded-lg p-3 border border-amber-500/30">
                <div className="text-amber-400 text-xs mb-1">24h Forecast</div>
                <div className="text-white text-2xl font-bold">
                  {(analytics.forecast_24h * 100).toFixed(0)}
                </div>
              </div>
              
              <div className="bg-black/60 rounded-lg p-3 border border-red-500/30">
                <div className="text-red-400 text-xs mb-1">Bottlenecks</div>
                <div className="text-white text-2xl font-bold">
                  {analytics.bottlenecks?.length || 0}
                </div>
              </div>
            </div>

            {analytics.bottlenecks?.length > 0 && (
              <div className="bg-red-950/40 rounded-lg p-3 border border-red-500/30">
                <div className="text-red-400 text-sm font-bold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Predicted Bottlenecks
                </div>
                {analytics.bottlenecks.map((bottleneck, idx) => (
                  <div key={idx} className="text-xs text-gray-300 mb-1">
                    • {bottleneck.description} (Severity: {(bottleneck.severity * 100).toFixed(0)}%)
                  </div>
                ))}
              </div>
            )}

            {analytics.recommendations && (
              <div className="bg-blue-950/40 rounded-lg p-3 border border-blue-500/30">
                <div className="text-blue-400 text-sm font-bold mb-2">AI Recommendations</div>
                {analytics.recommendations.map((rec, idx) => (
                  <div key={idx} className="text-xs text-gray-300 mb-1">✓ {rec}</div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <Button
          onClick={runPredictiveAnalysis}
          disabled={isAnalyzing}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Activity className="w-4 h-4 mr-2" />
          {isAnalyzing ? 'Analyzing Trends...' : 'Run Predictive Analysis'}
        </Button>
      </CardContent>
    </Card>
  );
}