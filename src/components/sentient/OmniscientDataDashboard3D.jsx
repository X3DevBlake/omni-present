import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Line, Html, Trail, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Database, Brain, TrendingUp, Zap, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';

// Data stream particle flow
function DataStreamParticles3D({ stream, pathIndex, totalPaths }) {
  const groupRef = useRef();
  const particles = Array.from({ length: 20 }, (_, i) => i);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3 + pathIndex * 0.5;
    }
  });

  const angle = (pathIndex / totalPaths) * Math.PI * 2;
  const radius = 3;

  return (
    <group ref={groupRef}>
      {particles.map(i => {
        const t = (i / 20);
        const x = Math.cos(angle) * radius * t;
        const y = Math.sin(t * Math.PI * 2) * 1.5;
        const z = Math.sin(angle) * radius * t;
        
        return (
          <Sphere key={i} args={[0.04, 8, 8]} position={[x, y, z]}>
            <meshBasicMaterial color="#00f5ff" transparent opacity={0.8 - t * 0.5} />
          </Sphere>
        );
      })}
    </group>
  );
}

// Insight crystal
function InsightCrystal3D({ insight, position }) {
  const crystalRef = useRef();

  useFrame((state) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y = state.clock.elapsedTime;
      crystalRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#3b82f6'
  };

  const color = priorityColors[insight.priority] || '#a855f7';

  return (
    <group position={position}>
      <Box ref={crystalRef} args={[0.2, 0.3, 0.2]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.8}
        />
      </Box>
      
      <Html position={[0.3, 0.2, 0]} center={false}>
        <div className="bg-black/90 px-3 py-2 rounded-lg text-xs max-w-64 border-2" style={{ borderColor: color }}>
          <p className="text-white font-bold mb-1">{insight.recommendation || insight.prediction}</p>
          <Badge className="text-xs" style={{ backgroundColor: color }}>{insight.priority}</Badge>
        </div>
      </Html>
    </group>
  );
}

export default function OmniscientDataDashboard3D() {
  const queryClient = useQueryClient();
  const [analysisResult, setAnalysisResult] = useState(null);

  const adaptiveMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('autonomous-viz-evolution', {
        hub_context: 'omniscient_data',
        user_engagement_data: {}
      });
      return response.data;
    }
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      adaptiveMutation.mutate();
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  const analysisMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('omniscient-data-processor', {
        processing_mode: 'omniscient_analysis',
        time_window_hours: 24,
        auto_insights: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      setAnalysisResult(data.omniscient_analysis);
      toast.success('Omniscient analysis complete');
    }
  });

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="w-6 h-6 text-cyan-400" />
            Omniscient Data Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => analysisMutation.mutate()}
            disabled={analysisMutation.isPending}
            className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600"
          >
            {analysisMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing Universe</>
            ) : (
              <><Brain className="w-4 h-4 mr-2" /> Run Omniscient Analysis</>
            )}
          </Button>

          {analysisResult && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-3 border border-green-500/40">
                  <p className="text-green-300 text-sm">Health Score</p>
                  <p className="text-3xl font-bold text-white">
                    {(analysisResult.global_health_score * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-lg p-3 border border-purple-500/40">
                  <p className="text-purple-300 text-sm">Consciousness</p>
                  <p className="text-xl font-bold text-white">{analysisResult.consciousness_level}</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/30">
                <p className="text-white font-bold mb-2">Emergent Patterns ({analysisResult.emergent_patterns?.length || 0})</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {analysisResult.emergent_patterns?.slice(0, 5).map((pattern, idx) => (
                    <div key={idx} className="bg-slate-700/50 rounded p-2">
                      <p className="text-cyan-400 text-sm font-medium">{pattern.pattern_name}</p>
                      <p className="text-slate-300 text-xs">{pattern.description}</p>
                      <p className="text-purple-400 text-xs mt-1">Significance: {(pattern.significance * 100).toFixed(0)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {analysisResult && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardContent className="p-0">
            <div className="h-[500px]">
              <Canvas camera={{ position: [0, 4, 8], fov: 60 }}>
                <ambientLight intensity={0.2} />
                <pointLight position={[0, 10, 0]} intensity={1} color="#ec4899" />
                <pointLight position={[8, 5, 8]} intensity={0.7} color="#00f5ff" />

                <group>
                  {/* Data streams */}
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <DataStreamParticles3D key={idx} stream={{}} pathIndex={idx} totalPaths={8} />
                  ))}

                  {/* Insight crystals */}
                  {analysisResult.universal_recommendations?.slice(0, 6).map((rec, idx) => {
                    const angle = (idx / 6) * Math.PI * 2;
                    return (
                      <InsightCrystal3D
                        key={idx}
                        insight={rec}
                        position={[Math.cos(angle) * 2, 0, Math.sin(angle) * 2]}
                      />
                    );
                  })}

                  {/* Center core */}
                  <Sphere args={[0.4, 32, 32]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.9} metalness={0.9} roughness={0.1} />
                  </Sphere>
                </group>

                <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} />
              </Canvas>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}