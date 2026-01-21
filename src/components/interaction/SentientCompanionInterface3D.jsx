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

// Companion avatar with omega emotional intelligence
function CompanionAvatar3D({ companion, isEngaging = false, bondStrength = 0.5 }) {
  const avatarRef = useRef();
  const auraRef = useRef();
  const heartRef = useRef();

  useFrame((state) => {
    if (avatarRef.current) {
      const empathy = companion?.personality_matrix?.empathy_level || 0.5;
      const pulse = 1 + empathy * Math.sin(state.clock.elapsedTime * 3) * 0.2;
      avatarRef.current.scale.setScalar(pulse * (isEngaging ? 1.3 : 1));
      avatarRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    if (auraRef.current) {
      auraRef.current.scale.setScalar(2 + Math.sin(state.clock.elapsedTime * 2) * 0.3);
      auraRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    if (heartRef.current) {
      const heartbeat = 1 + bondStrength * Math.sin(state.clock.elapsedTime * 4) * 0.3;
      heartRef.current.scale.setScalar(heartbeat);
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

      {/* Emotional bond indicator */}
      <group ref={heartRef} position={[0, 0.8, 0]}>
        <Sphere args={[0.15, 16, 16]}>
          <meshBasicMaterial color="#ec4899" transparent opacity={bondStrength} />
        </Sphere>
      </group>

      {/* Connection lines to represent bond */}
      {bondStrength > 0.5 && (
        <>
          {Array.from({ length: 8 }).map((_, idx) => {
            const angle = (idx / 8) * Math.PI * 2;
            return (
              <Line
                key={idx}
                points={[[0, 0, 0], [Math.cos(angle) * 1.5, Math.sin(state.clock.elapsedTime + idx) * 0.3, Math.sin(angle) * 1.5]]}
                color="#ec4899"
                lineWidth={2}
                transparent
                opacity={bondStrength * 0.4}
              />
            );
          })}
        </>
      )}

      <Sparkles count={isEngaging ? 60 : Math.floor(bondStrength * 40)} scale={2.5} size={3} speed={0.8} color={color} />
    </group>
  );
}

export default function SentientCompanionInterface3D() {
  const [userMessage, setUserMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isEngaging, setIsEngaging] = useState(false);
  const [bondStrength, setBondStrength] = useState(0.3);

  const { data: companions = [] } = useQuery({
    queryKey: ['sentient-companions'],
    queryFn: () => base44.entities.SentientAICompanion.list('-created_date', 5),
    initialData: []
  });

  const { data: bonds = [] } = useQuery({
    queryKey: ['companion-bonds'],
    queryFn: () => base44.entities.CompanionEmotionalBond.list('-created_date', 5),
    initialData: []
  });

  const engageMutation = useMutation({
    mutationFn: async (message) => {
      const response = await base44.functions.invoke('omega-emotional-intelligence', {
        companion_id: companions[0]?.companion_id,
        user_message: message
      });
      return response.data;
    },
    onSuccess: (data) => {
      setConversation(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'companion', content: data.response?.message, insights: data.response }
      ]);
      setBondStrength(data.bond_strength || 0.3);
      setUserMessage('');
      toast.success(`Bond strengthened to ${(data.bond_strength * 100).toFixed(0)}%`);
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
  const bond = bonds[0];

  React.useEffect(() => {
    if (bond?.bond_strength) {
      setBondStrength(bond.bond_strength);
    }
  }, [bond]);

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
          {bond && (
            <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3">
              <p className="text-pink-300 text-sm mb-2">Emotional Bond</p>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000"
                  style={{ width: `${bondStrength * 100}%` }}
                />
              </div>
              <p className="text-white text-xs mt-1">{(bondStrength * 100).toFixed(0)}% bond strength • {bond.interaction_history?.length || 0} interactions</p>
            </div>
          )}

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

              <CompanionAvatar3D 
                companion={companion} 
                isEngaging={engageMutation.isPending}
                bondStrength={bondStrength}
              />

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