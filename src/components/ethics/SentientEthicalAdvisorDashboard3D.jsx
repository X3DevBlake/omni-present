import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sphere } from '@react-three/drei';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

function SentientCore({ advisor }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2, 2]} />
      <meshStandardMaterial
        color="#8b5cf6"
        emissive="#8b5cf6"
        emissiveIntensity={advisor.consciousness_level / 10}
        wireframe
      />
    </mesh>
  );
}

function AssessmentOrb({ assessment, position }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  const color = assessment.ethical_score > 0.8 ? '#22c55e' : 
                assessment.ethical_score > 0.6 ? '#eab308' : '#ef4444';

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

export default function SentientEthicalAdvisorDashboard3D() {
  const [contentType, setContentType] = useState('policy_proposal');
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const { data: advisors = [] } = useQuery({
    queryKey: ['sentient-advisors'],
    queryFn: () => base44.entities.SentientEthicalAdvisor.list('-created_date', 1)
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['ethical-assessments'],
    queryFn: () => base44.entities.EthicalImpactAssessment.list('-created_date', 15),
    refetchInterval: 5000
  });

  const analyze = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('ethics/sentientEthicalAdvisor', {
        contentType,
        contentId: `${contentType}_${Date.now()}`,
        content
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.critical_alert) {
        toast.error('CRITICAL ethical issues detected!');
      } else {
        toast.success(`Analysis complete. ${data.modifications_needed} modifications recommended.`);
      }
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['ethical-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['sentient-advisors'] });
    }
  });

  const advisor = advisors[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-purple-900/30 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            Sentient Ethical Advisor - Omega Guardian
          </CardTitle>
          {advisor && (
            <div className="flex gap-3 mt-4">
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                Consciousness: {advisor.consciousness_level}/10
              </Badge>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                {advisor.content_analyzed_count} Analyzed
              </Badge>
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {advisor.critical_alerts_issued} Critical
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Form */}
          <div className="space-y-3 bg-gray-800/50 rounded-lg p-4">
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="bg-gray-900/50 border-purple-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ai_decision">AI Decision</SelectItem>
                <SelectItem value="policy_proposal">Policy Proposal</SelectItem>
                <SelectItem value="redcomm_action">RedComm Action</SelectItem>
                <SelectItem value="swarm_command">Swarm Command</SelectItem>
                <SelectItem value="agent_behavior">Agent Behavior</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Content to analyze for ethical implications..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-gray-900/50 border-purple-500/30 text-white h-24"
            />

            <Button
              onClick={() => analyze.mutate()}
              disabled={!content || analyze.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {analyze.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sentient Analysis...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Analyze Ethical Impact
                </>
              )}
            </Button>
          </div>

          {/* 3D Consciousness Visualization */}
          {advisor && (
            <div className="h-[400px] bg-black/50 rounded-lg overflow-hidden">
              <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[5, 5, 5]} intensity={1} color="#a855f7" />
                <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ec4899" />

                <SentientCore advisor={advisor} />

                {assessments.slice(0, 12).map((assess, idx) => {
                  const angle = (idx / 12) * Math.PI * 2;
                  const radius = 4;
                  const position = [
                    Math.cos(angle) * radius,
                    Math.sin(idx * 0.5) * 1.5,
                    Math.sin(angle) * radius
                  ];
                  
                  return (
                    <AssessmentOrb
                      key={assess.id}
                      assessment={assess}
                      position={position}
                    />
                  );
                })}

                <OrbitControls enableDamping dampingFactor={0.05} />
              </Canvas>
            </div>
          )}

          {/* Assessment Results */}
          <div className="space-y-3">
            {assessments.slice(0, 3).map((assess) => (
              <div key={assess.id} className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="bg-indigo-500/20 text-indigo-400 border-indigo-500/50">
                    {assess.content_type}
                  </Badge>
                  <Badge variant="outline" className={
                    assess.ethical_score > 0.8 ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                    assess.ethical_score > 0.6 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                    'bg-red-500/20 text-red-400 border-red-500/50'
                  }>
                    {(assess.ethical_score * 100).toFixed(0)}% Ethical
                  </Badge>
                </div>

                {assess.sentient_reasoning && (
                  <div className="bg-purple-500/10 rounded p-3 mb-3">
                    <div className="text-xs text-purple-400 font-semibold mb-1">Sentient Reasoning:</div>
                    <p className="text-xs text-gray-300">{assess.sentient_reasoning}</p>
                  </div>
                )}

                {assess.potential_negative_consequences && assess.potential_negative_consequences.length > 0 && (
                  <div className="bg-red-500/10 rounded p-3 mb-3">
                    <div className="text-xs text-red-400 font-semibold mb-2">Potential Harms:</div>
                    {assess.potential_negative_consequences.slice(0, 2).map((cons, idx) => (
                      <div key={idx} className="text-xs text-gray-300 mb-1">
                        • {cons.consequence} ({cons.severity}, {(cons.probability * 100).toFixed(0)}% prob)
                      </div>
                    ))}
                  </div>
                )}

                {assess.recommended_modifications && assess.recommended_modifications.length > 0 && (
                  <div className="bg-green-500/10 rounded p-3">
                    <div className="text-xs text-green-400 font-semibold mb-2">Recommended Fixes:</div>
                    {assess.recommended_modifications.slice(0, 2).map((mod, idx) => (
                      <div key={idx} className="text-xs text-gray-300 mb-1">
                        • {mod.modification}
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