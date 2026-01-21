import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Cylinder, Line, Html, Trail, Sparkles, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Cpu, Brain, Zap, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Augmentation design preview
function AugmentationPreview3D({ design }) {
  const augRef = useRef();

  useFrame((state) => {
    if (augRef.current) {
      augRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const score = design?.ai_optimized_design?.optimization_score || 0.5;
  const color = score > 0.8 ? '#10b981' : score > 0.6 ? '#3b82f6' : '#f59e0b';

  return (
    <group>
      <Trail width={0.4} length={15} color={color}>
        <Sphere ref={augRef} args={[0.3, 24, 24]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
        </Sphere>
      </Trail>

      {/* Neural connections */}
      {design?.neural_chip_integration?.connection_points?.slice(0, 4).map((point, idx) => {
        const angle = (idx / 4) * Math.PI * 2;
        return (
          <Line
            key={idx}
            points={[[0, 0, 0], [Math.cos(angle) * 0.6, 0, Math.sin(angle) * 0.6]]}
            color="#ec4899"
            lineWidth={2}
            transparent
            opacity={0.7}
          />
        );
      })}

      {/* Agent pathways */}
      {design?.agent_navigation_design?.pathway_count > 0 && (
        <>
          {Array.from({ length: Math.min(design.agent_navigation_design.pathway_count, 6) }).map((_, idx) => {
            const angle = (idx / 6) * Math.PI * 2;
            return (
              <Cylinder
                key={idx}
                args={[0.02, 0.02, 0.5, 8]}
                position={[Math.cos(angle) * 0.4, 0, Math.sin(angle) * 0.4]}
                rotation={[Math.PI / 2, 0, angle]}
              >
                <meshBasicMaterial color="#00f5ff" transparent opacity={0.6} />
              </Cylinder>
            );
          })}
        </>
      )}

      <Sparkles count={Math.floor(score * 40)} scale={1.5} size={2} speed={0.5} color={color} />

      <Text position={[0, -0.6, 0]} fontSize={0.12} color="#ffffff" anchorX="center">
        {design?.augmentation_name || 'Custom Design'}
      </Text>
    </group>
  );
}

export default function AugmentationDesignStudio3D() {
  const [designName, setDesignName] = useState('');
  const [functionality, setFunctionality] = useState('');
  const [location, setLocation] = useState('');
  const [aiDesign, setAiDesign] = useState(null);

  const { data: designs = [] } = useQuery({
    queryKey: ['augmentation-designs'],
    queryFn: () => base44.entities.CustomAugmentationDesign.list('-created_date', 10),
    initialData: []
  });

  const designMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('augmentation-design-studio', {
        augmentation_name: designName,
        desired_functionality: functionality.split(',').map(f => f.trim()),
        body_location: location,
        user_health_goals: ['performance', 'longevity']
      });
      return response.data;
    },
    onSuccess: (data) => {
      setAiDesign(data.ai_design);
      toast.success('AI-optimized design created');
    }
  });

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-purple-400" />
            Augmentation Design Studio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Input
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              placeholder="Augmentation name (e.g., 'Enhanced Vision Implant')"
              className="bg-slate-800 border-slate-600 text-white"
            />
            <Textarea
              value={functionality}
              onChange={(e) => setFunctionality(e.target.value)}
              placeholder="Desired functionality (comma-separated, e.g., 'night vision, thermal sensing, AR overlay')"
              className="bg-slate-800 border-slate-600 text-white"
            />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Body location (e.g., 'eye', 'brain', 'spine')"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <Button
            onClick={() => designMutation.mutate()}
            disabled={!designName || !functionality || !location || designMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-lg py-6"
          >
            {designMutation.isPending ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Optimizing Design...</>
            ) : (
              <><Brain className="w-5 h-5 mr-2" /> Generate AI-Optimized Design</>
            )}
          </Button>

          {aiDesign && (
            <div className="space-y-3">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-white font-bold">AI Optimization Complete</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-slate-400">Health Compatibility</p>
                    <p className="text-green-400 font-bold">{(aiDesign.health_analysis?.compatibility_score * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Performance</p>
                    <p className="text-cyan-400 font-bold">{(aiDesign.predicted_performance * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>

              {aiDesign.optimization_suggestions?.length > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-purple-300 font-bold text-sm mb-2">AI Suggestions:</p>
                  {aiDesign.optimization_suggestions.map((sug, idx) => (
                    <p key={idx} className="text-slate-300 text-xs mb-1">• {sug}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[450px]">
            <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[3, 5, 3]} intensity={1} color="#a855f7" />
              <pointLight position={[-3, 5, -3]} intensity={0.8} color="#00f5ff" />

              {designs.length > 0 && <AugmentationPreview3D design={designs[0]} />}

              <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}