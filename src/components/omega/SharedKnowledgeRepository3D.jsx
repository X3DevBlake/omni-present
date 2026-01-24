import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Database, Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const KnowledgeOrb = ({ position, knowledge, onClick }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.05;
      meshRef.current.scale.setScalar(0.2 + knowledge.importance * 0.15 + pulse);
    }
  });
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.2, 24, 24]} onClick={() => onClick(knowledge)}>
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={1.2}
        />
      </Sphere>
      <Text position={[0, 0.4, 0]} fontSize={0.08} color="white" anchorX="center">
        {knowledge.category}
      </Text>
    </group>
  );
};

export default function SharedKnowledgeRepository3D() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKnowledge, setSelectedKnowledge] = useState(null);

  const { data: knowledge } = useQuery({
    queryKey: ['shared_knowledge'],
    queryFn: () => base44.entities.SharedKnowledge.list('-created_date', 20),
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SharedKnowledge.create({
      knowledge_type: 'swarm_insight',
      category: 'simulation',
      content: data.content,
      source_agent_id: 'user_contributed',
      importance_score: 0.7,
      access_level: 'public'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared_knowledge'] });
      setSearchQuery('');
    }
  });

  const knowledgePositions = knowledge.slice(0, 12).map((_, idx) => {
    const angle = (idx / 12) * Math.PI * 2;
    const radius = 2;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, (idx % 3 - 1) * 0.5];
  });

  return (
    <Card className="bg-gradient-to-br from-indigo-950/90 via-blue-950/90 to-cyan-950/90 backdrop-blur-xl border-indigo-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Database className="w-7 h-7 text-indigo-400" />
          Shared Knowledge Repository
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Cross-component knowledge enriched by agent insights
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or add knowledge..."
            className="bg-black/60 border-indigo-500/30 text-white"
          />
          <Button 
            onClick={() => createMutation.mutate({ content: searchQuery })}
            disabled={!searchQuery}
            size="icon" 
            className="bg-indigo-600"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-[350px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-indigo-500/20">
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />

            {knowledge.slice(0, 12).map((item, idx) => (
              <KnowledgeOrb
                key={item.id}
                position={knowledgePositions[idx]}
                knowledge={{
                  category: item.category || 'general',
                  importance: item.importance_score || 0.5
                }}
                onClick={setSelectedKnowledge}
              />
            ))}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-black/60 rounded p-2 border border-indigo-500/20 text-center">
            <div className="text-indigo-400 text-xs">Total</div>
            <div className="text-white font-bold">{knowledge.length}</div>
          </div>
          <div className="bg-black/60 rounded p-2 border border-blue-500/20 text-center">
            <div className="text-blue-400 text-xs">AI Insights</div>
            <div className="text-white font-bold">
              {knowledge.filter(k => k.source_agent_id?.startsWith('agent_')).length}
            </div>
          </div>
          <div className="bg-black/60 rounded p-2 border border-cyan-500/20 text-center">
            <div className="text-cyan-400 text-xs">Categories</div>
            <div className="text-white font-bold">
              {new Set(knowledge.map(k => k.category)).size}
            </div>
          </div>
        </div>

        {selectedKnowledge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 rounded-lg p-3 border border-indigo-500/30"
          >
            <div className="text-indigo-400 text-sm font-bold mb-1">Selected Knowledge</div>
            <div className="text-gray-300 text-xs">
              Category: {selectedKnowledge.category}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}