import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Torus } from '@react-three/drei';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Bot, Send, Sparkles } from 'lucide-react';
import * as THREE from 'three';

const AdvisorAvatar = ({ personalityTraits = [] }) => {
  const meshRef = useRef();
  const auraRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
    if (auraRef.current) {
      auraRef.current.rotation.z += 0.005;
      auraRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <group>
      {/* Core */}
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Personality Aura */}
      <Torus ref={auraRef} args={[2, 0.1, 16, 100]}>
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </Torus>

      {/* Trait Indicators */}
      {personalityTraits.slice(0, 5).map((trait, idx) => {
        const angle = (idx / 5) * Math.PI * 2;
        const radius = 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <Sphere key={idx} position={[x, 0, z]} args={[0.2, 16, 16]}>
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={trait.strength || 0.5}
            />
          </Sphere>
        );
      })}

      <Text position={[0, -2, 0]} fontSize={0.3} color="white" anchorX="center">
        Academic Advisor AI
      </Text>
    </group>
  );
};

export default function AIAdvisorHologram({ agentId, userId }) {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);

  const { data: agentTraits = [] } = useQuery({
    queryKey: ['agent-traits', agentId],
    queryFn: () => base44.entities.AgentPersonalityTrait.filter({ agent_id: agentId }),
    enabled: !!agentId
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (msg) => {
      const response = await base44.functions.invoke('aiResearchAssistantAgent', {
        action: 'chat',
        message: msg,
        user_id: userId,
        agent_id: agentId
      });
      return response.data;
    },
    onSuccess: (data) => {
      setConversation([...conversation, 
        { role: 'user', content: message },
        { role: 'assistant', content: data.response }
      ]);
      setMessage('');
    }
  });

  const handleSend = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 3D Hologram */}
      <Card className="bg-black/40 backdrop-blur-xl border-white/20 overflow-hidden h-[500px]">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
          
          <AdvisorAvatar personalityTraits={agentTraits} />
          
          <OrbitControls enableZoom enablePan />
        </Canvas>
      </Card>

      {/* Conversation Interface */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-400" />
            <CardTitle className="text-white">AI Academic Advisor</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-black/40 rounded-lg p-4 h-80 overflow-y-auto mb-4 space-y-4">
            {conversation.length === 0 && (
              <div className="text-gray-400 text-center py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <p>Ask me anything about your research or coursework!</p>
              </div>
            )}
            
            {conversation.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-purple-600/30 text-white border border-purple-400/30'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ask your AI advisor..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="bg-white/10 border-white/20 text-white"
            />
            <Button
              onClick={handleSend}
              disabled={sendMessageMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}