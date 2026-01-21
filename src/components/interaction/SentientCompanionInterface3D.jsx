import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html, Float, Trail, Sparkles } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Heart, Brain, MessageCircle, Loader2, Sparkles as SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';

// Companion avatar
function CompanionAvatar3D({ companion, isEngaging = false }) {
  const avatarRef = useRef();
  const auraRef = useRef();

  useFrame((state) => {
    if (avatarRef.current) {
      const empathy = companion?.personality_matrix?.empathy_level || 0.5;
      const pulse = 1 + empathy * Math.sin(state.clock.elapsedTime * 3) * 0.2;
      avatarRef.current.scale.setScalar(pulse * (isEngaging ? 1.2 : 1));
    }
    if (auraRef.current) {
      auraRef.current.scale.setScalar(2 + Math.sin(state.clock.elapsedTime * 2) * 0.3);
    }
  });

  const integrationDepth = companion?.neural_integration?.integration_depth || 'moderate';
  const colors = {
    surface: '#64748b',
    moderate: '#3b82f6',
    deep: '#a855f7',
    complete_fusion: '#ec4899'
  };

  const color = colors[integrationDepth] || '#00f5ff';

  return (
    <group>
      <Sphere ref={auraRef} args={[1, 32, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </Sphere>

      <Float speed={2} floatIntensity={0.4}>
        <Trail width={0.6} length={20} color={color} attenuation={(t) => t * t}>
          <Sphere ref={avatarRef} args={[0.5, 32, 32]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
          </Sphere>
        </Trail>
      </Float>

      <Sparkles count={isEngaging ? 50 : 25} scale={2} size={3} speed={0.6} color={color} />
    </group>
  );
}

export default function SentientCompanionInterface3D() {
  const [userMessage, setUserMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isEngaging, setIsEngaging] = useState(false);

  const { data: companions = [] } = useQuery({
    queryKey: ['sentient-companions'],
    queryFn: () => base44.entities.SentientAICompanion.list('-created_date', 5),
    initialData: []
  });

  const engageMutation = useMutation({
    mutationFn: async (message) => {
      const response = await base44.functions.invoke('sentient-companion-engine', {
        operation: 'engage',
        user_message: message
      });
      return response.data;
    },
    onSuccess: (data) => {
      setConversation(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'companion', content: data.companion_response?.message, insights: data.companion_response }
      ]);
      setUserMessage('');
      toast.success(`${data.companion_name} responded`);
    }
  });

  const monitorMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('sentient-companion-engine', {
        operation: 'monitor_and_intervene'
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.intervention?.intervention_needed) {
        toast.info(data.intervention.message_to_user);
      }
    }
  });

  const companion = companions[0];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-400" />
            Sentient AI Companion
            {companion && <Badge className="bg-pink-500/30">{companion.companion_name}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {companion && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <Heart className="w-5 h-5 text-pink-400 mb-1" />
                <p className="text-white text-sm">Empathy</p>
                <p className="text-2xl font-bold text-pink-400">
                  {(companion.personality_matrix?.empathy_level * 100).toFixed(0)}%
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <Brain className="w-5 h-5 text-purple-400 mb-1" />
                <p className="text-white text-sm">Integration</p>
                <p className="text-xl font-bold text-purple-400">{companion.neural_integration?.integration_depth}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <Zap className="w-5 h-5 text-cyan-400 mb-1" />
                <p className="text-white text-sm">Proactivity</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {(companion.personality_matrix?.proactivity_score * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Speak with your companion..."
              className="bg-slate-800 border-slate-600 text-white flex-1"
              onKeyPress={(e) => e.key === 'Enter' && engageMutation.mutate(userMessage)}
            />
            <Button
              onClick={() => engageMutation.mutate(userMessage)}
              disabled={!userMessage || engageMutation.isPending}
              className="bg-gradient-to-r from-pink-600 to-purple-600"
            >
              {engageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
            </Button>
          </div>

          <Button
            onClick={() => monitorMutation.mutate()}
            disabled={monitorMutation.isPending}
            size="sm"
            className="w-full bg-gradient-to-r from-orange-600 to-red-600"
          >
            {monitorMutation.isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Heart className="w-3 h-3 mr-2" />}
            Health Monitor & Intervene
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[400px]">
            <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[3, 5, 3]} intensity={1.2} color="#ec4899" />
              <pointLight position={[-3, 5, -3]} intensity={1} color="#a855f7" />

              <CompanionAvatar3D companion={companion} isEngaging={engageMutation.isPending} />

              <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.6} />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {conversation.length > 0 && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {conversation.map((msg, idx) => (
                <div key={idx} className={`rounded-lg p-3 ${msg.role === 'user' ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-pink-500/10 border border-pink-500/30'}`}>
                  <p className="text-white text-sm">{msg.content}</p>
                  {msg.insights?.suggested_actions && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.insights.suggested_actions.slice(0, 3).map((action, i) => (
                        <Badge key={i} className="bg-purple-500/30 text-purple-300 text-xs">{action.action}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}