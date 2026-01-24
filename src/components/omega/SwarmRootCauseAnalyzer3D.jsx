import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Search, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const CauseNode = ({ position, cause, isPrimary }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const scale = isPrimary ? 0.4 : 0.25;
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.05;
      meshRef.current.scale.setScalar(scale + pulse);
    }
  });
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 24, 24]}>
        <meshStandardMaterial
          color={isPrimary ? '#ef4444' : '#f59e0b'}
          emissive={isPrimary ? '#ef4444' : '#f59e0b'}
          emissiveIntensity={isPrimary ? 1.5 : 0.8}
        />
      </Sphere>
      <Text position={[0, 0.6, 0]} fontSize={0.12} color="white" anchorX="center">
        {cause.label}
      </Text>
      <Text position={[0, -0.5, 0]} fontSize={0.08} color="#fbbf24" anchorX="center">
        {(cause.contribution * 100).toFixed(0)}%
      </Text>
    </group>
  );
};

export default function SwarmRootCauseAnalyzer3D() {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeRootCause = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await base44.functions.invoke('omega/swarmRootCauseAnalysis', {
        swarm_id: 'haas_omega_001',
        issue_type: 'performance_degradation'
      });
      
      setAnalysis(response.data);
    } catch (error) {
      console.error('Root cause analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const causePositions = [
    [0, 1, 0],      // Primary
    [-1.5, -0.5, 0], // Contributing 1
    [1.5, -0.5, 0],  // Contributing 2
    [0, -1.5, 0]     // Contributing 3
  ];

  return (
    <Card className="bg-gradient-to-br from-red-950/90 via-orange-950/90 to-amber-950/90 backdrop-blur-xl border-red-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Search className="w-7 h-7 text-red-400" />
          Root Cause Analyzer
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          AI-powered diagnosis of swarm failures and performance issues
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-red-500/20">
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ef4444" />

            {analysis?.causes.map((cause, idx) => (
              <React.Fragment key={idx}>
                <CauseNode
                  position={causePositions[idx]}
                  cause={cause}
                  isPrimary={idx === 0}
                />
                {idx > 0 && (
                  <Line
                    points={[
                      new THREE.Vector3(...causePositions[0]),
                      new THREE.Vector3(...causePositions[idx])
                    ]}
                    color="#f59e0b"
                    lineWidth={2}
                    transparent
                    opacity={0.4}
                  />
                )}
              </React.Fragment>
            ))}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 mb-4"
          >
            <div className="bg-red-950/60 rounded-lg p-4 border border-red-500/30">
              <div className="text-red-400 text-sm font-bold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Primary Root Cause
              </div>
              <div className="text-white">{analysis.causes[0]?.label}</div>
              <div className="text-gray-400 text-xs mt-1">
                Contribution: {(analysis.causes[0]?.contribution * 100).toFixed(0)}%
              </div>
            </div>

            <div className="bg-black/60 rounded-lg p-3 border border-amber-500/30">
              <div className="text-amber-400 text-sm font-bold mb-2">Contributing Factors</div>
              {analysis.causes.slice(1).map((cause, idx) => (
                <div key={idx} className="text-xs text-gray-300 mb-1">
                  • {cause.label} ({(cause.contribution * 100).toFixed(0)}%)
                </div>
              ))}
            </div>

            <div className="bg-blue-950/40 rounded-lg p-3 border border-blue-500/30">
              <div className="text-blue-400 text-sm font-bold mb-2">Remediation Steps</div>
              {analysis.remediation_steps?.map((step, idx) => (
                <div key={idx} className="text-xs text-gray-300 mb-1">
                  {idx + 1}. {step}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <Button
          onClick={analyzeRootCause}
          disabled={isAnalyzing}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          <Search className="w-4 h-4 mr-2" />
          {isAnalyzing ? 'Diagnosing...' : 'Diagnose Root Cause'}
        </Button>
      </CardContent>
    </Card>
  );
}