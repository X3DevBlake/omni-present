import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Loader2, Database, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

function FeedbackNode({ feedback, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  const sentimentColor = {
    'positive': '#22c55e',
    'neutral': '#eab308',
    'negative': '#ef4444'
  }[feedback.sentiment] || '#3b82f6';

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial
          color={sentimentColor}
          emissive={sentimentColor}
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
}

export default function AdaptiveGovernanceLearning3D() {
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [feedbackSentiment, setFeedbackSentiment] = useState('neutral');
  const [feedbackText, setFeedbackText] = useState('');
  const queryClient = useQueryClient();

  const { data: policies = [] } = useQuery({
    queryKey: ['governance-policies-all'],
    queryFn: () => base44.entities.PlanetaryGovernancePolicy.list('-created_date', 20)
  });

  const { data: feedbackLoops = [] } = useQuery({
    queryKey: ['governance-feedback'],
    queryFn: () => base44.entities.GovernanceFeedbackLoop.list('-created_date', 10),
    refetchInterval: 5000
  });

  const submitLearning = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('planetary/adaptiveGovernanceAI', {
        policyId: selectedPolicyId,
        citizenFeedback: [{
          citizen_id: 'citizen_001',
          sentiment: feedbackSentiment,
          specific_concerns: feedbackText.split(',').map(s => s.trim()),
          suggestions: feedbackText
        }]
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`AI learned and ${data.policy_evolved ? 'evolved the policy' : 'integrated feedback'}`);
      setFeedbackText('');
      queryClient.invalidateQueries({ queryKey: ['governance-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['governance-policies-all'] });
    }
  });

  const implementedPolicies = policies.filter(p => p.status === 'implemented' || p.status === 'approved');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-green-900/30 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Adaptive Governance Learning - NASA Integrated
          </CardTitle>
          <p className="text-sm text-gray-400 mt-2">
            AI learns from real-world outcomes and citizen feedback
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Feedback Input */}
          <div className="space-y-3 bg-gray-800/50 rounded-lg p-4">
            <Select value={selectedPolicyId} onValueChange={setSelectedPolicyId}>
              <SelectTrigger className="bg-gray-900/50 border-green-500/30">
                <SelectValue placeholder="Select implemented policy" />
              </SelectTrigger>
              <SelectContent>
                {implementedPolicies.map(p => (
                  <SelectItem key={p.policy_id} value={p.policy_id}>
                    {p.policy_name} ({p.celestial_body})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={feedbackSentiment} onValueChange={setFeedbackSentiment}>
              <SelectTrigger className="bg-gray-900/50 border-green-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Citizen feedback and concerns (comma-separated)"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="bg-gray-900/50 border-green-500/30 text-white"
              rows={3}
            />

            <Button
              onClick={() => submitLearning.mutate()}
              disabled={!selectedPolicyId || !feedbackText || submitLearning.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {submitLearning.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI Learning...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Submit Feedback & Trigger AI Learning
                </>
              )}
            </Button>
          </div>

          {/* 3D Feedback Visualization */}
          <div className="h-[350px] bg-black/50 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[5, 5, 5]} intensity={1} color="#22c55e" />

              {feedbackLoops.slice(0, 15).map((loop, idx) => {
                const angle = (idx / 15) * Math.PI * 2;
                const radius = 3 + Math.random() * 1;
                const position = [
                  Math.cos(angle) * radius,
                  (Math.random() - 0.5) * 3,
                  Math.sin(angle) * radius
                ];
                
                const avgSentiment = loop.citizen_feedback && loop.citizen_feedback.length > 0
                  ? loop.citizen_feedback[0]
                  : { sentiment: 'neutral' };
                
                return (
                  <FeedbackNode
                    key={loop.id}
                    feedback={avgSentiment}
                    position={position}
                  />
                );
              })}

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          {/* Learning Insights */}
          <div className="space-y-3">
            {feedbackLoops.slice(0, 3).map((loop) => (
              <div key={loop.id} className="bg-gray-800/50 rounded-lg p-4 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-white">{loop.celestial_body}</div>
                  {loop.policy_evolution_proposed && (
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                      Policy Evolved
                    </Badge>
                  )}
                </div>

                {loop.ai_learning_insights && (
                  <div className="bg-blue-500/10 rounded p-3 mb-2">
                    <div className="text-xs text-blue-400 font-semibold mb-1">AI Learning:</div>
                    <p className="text-xs text-gray-300">{loop.ai_learning_insights}</p>
                  </div>
                )}

                {loop.real_world_outcomes && (
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-gray-400">Resources:</span>
                      <span className="text-green-400 ml-1">{loop.real_world_outcomes.resource_efficiency_actual?.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Satisfaction:</span>
                      <span className="text-blue-400 ml-1">{loop.real_world_outcomes.settlement_satisfaction?.toFixed(1)}%</span>
                    </div>
                  </div>
                )}

                {loop.recommended_adjustments && loop.recommended_adjustments.length > 0 && (
                  <div className="bg-green-500/10 rounded p-2">
                    <div className="text-xs text-green-400 font-semibold mb-1">
                      <MessageSquare className="w-3 h-3 inline mr-1" />
                      AI Adjustments ({loop.recommended_adjustments.length}):
                    </div>
                    <div className="text-xs text-gray-300">
                      {loop.recommended_adjustments[0]?.adjustment}
                    </div>
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