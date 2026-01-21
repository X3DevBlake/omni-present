import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Html, Text, Sparkles, Trail, Box } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Heart, Sparkle, MessageCircle, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

function PersonalityTrait3D({ trait, position, intensity = 0.5 }) {
  const traitRef = useRef();

  useFrame((state) => {
    if (traitRef.current) {
      const pulse = 1 + intensity * Math.sin(state.clock.elapsedTime * 4) * 0.2;
      traitRef.current.scale.setScalar(pulse);
    }
  });

  const color = intensity > 0.8 ? '#ec4899' : intensity > 0.5 ? '#a855f7' : '#3b82f6';

  return (
    <group position={position}>
      <Sphere ref={traitRef} args={[0.15, 16, 16]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} />
      </Sphere>
      <Sparkles count={Math.floor(intensity * 20)} scale={0.5} size={2} speed={0.6} color={color} />
    </group>
  );
}

function EmotionalResonanceWeb3D({ patterns = [] }) {
  return (
    <group>
      {patterns.slice(0, 6).map((pattern, idx) => {
        const angle = (idx / 6) * Math.PI * 2;
        const radius = 1.5;
        const position = [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
        
        return (
          <group key={idx}>
            <Line
              points={[[0, 0, 0], position]}
              color="#ec4899"
              lineWidth={2}
              transparent
              opacity={pattern.resonance_score || 0.5}
            />
            <Sphere args={[0.1, 12, 12]} position={position}>
              <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.7} />
            </Sphere>
          </group>
        );
      })}
    </group>
  );
}

function PersonalityScene({ companion, bond, evolution }) {
  const personality = evolution?.personality_snapshot || companion?.personality_matrix || {};
  
  const traits = [
    { name: 'empathy', value: personality.empathy_level || 0.5, pos: [1.5, 0, 0] },
    { name: 'proactivity', value: personality.proactivity_score || 0.5, pos: [-1.5, 0, 0] },
    { name: 'emotional_iq', value: personality.emotional_intelligence || 0.5, pos: [0, 1.5, 0] }
  ];

  return (
    <>
      <gridHelper args={[8, 8, '#334155', '#1e293b']} />
      
      {/* Central companion core */}
      <Trail width={1} length={15} color="#ec4899" attenuation={(t) => t * t}>
        <Sphere args={[0.4, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1.2} />
        </Sphere>
      </Trail>

      {/* Personality traits */}
      {traits.map((trait, idx) => (
        <PersonalityTrait3D key={idx} trait={trait.name} position={trait.pos} intensity={trait.value} />
      ))}

      {/* Emotional resonance patterns */}
      <EmotionalResonanceWeb3D patterns={evolution?.emotional_resonance_patterns || []} />

      {/* Bond strength indicator */}
      {bond && (
        <Box args={[0.1, bond.bond_strength * 2, 0.1]} position={[0, bond.bond_strength, 0]}>
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
        </Box>
      )}
    </>
  );
}

export default function CompanionPersonalityEvolution3D() {
  const queryClient = useQueryClient();
  const [sharedExperience, setSharedExperience] = useState('');

  const { data: companions = [] } = useQuery({
    queryKey: ['companions-evolution'],
    queryFn: () => base44.entities.SentientAICompanion.list('-created_date', 5),
    initialData: []
  });

  const { data: bonds = [] } = useQuery({
    queryKey: ['bonds-evolution'],
    queryFn: () => base44.entities.CompanionEmotionalBond.list('-created_date', 5),
    initialData: []
  });

  const { data: evolutions = [] } = useQuery({
    queryKey: ['personality-evolutions'],
    queryFn: () => base44.entities.CompanionPersonalityEvolution.list('-created_date', 10),
    initialData: []
  });

  const evolveMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('companion-personality-evolution', {
        companion_id: companions[0]?.companion_id,
        shared_experience: sharedExperience
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['personality-evolutions']);
      queryClient.invalidateQueries(['companions-evolution']);
      toast.success(`Personality evolved - ${data.new_traits?.length} new traits`);
      setSharedExperience('');
    }
  });

  const companion = companions[0];
  const bond = bonds[0];
  const latestEvolution = evolutions[0];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkle className="w-6 h-6 text-pink-400" />
            Companion Personality Evolution
            {companion && <Badge className="bg-pink-500/30">{companion.companion_name}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {latestEvolution && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <p className="text-purple-300 font-bold text-sm mb-2">Latest Evolution</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <p className="text-slate-400 text-xs">Empathy</p>
                  <p className="text-pink-400 font-bold">{(latestEvolution.personality_snapshot?.empathy_level * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Emotional IQ</p>
                  <p className="text-purple-400 font-bold">{(latestEvolution.personality_snapshot?.emotional_intelligence * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Proactivity</p>
                  <p className="text-cyan-400 font-bold">{(latestEvolution.personality_snapshot?.proactivity_score * 100).toFixed(0)}%</p>
                </div>
              </div>
              {latestEvolution.unique_traits_developed?.length > 0 && (
                <div>
                  <p className="text-slate-400 text-xs mb-1">Unique Traits:</p>
                  <div className="flex flex-wrap gap-1">
                    {latestEvolution.unique_traits_developed.map((trait, idx) => (
                      <Badge key={idx} className="bg-pink-500/30 text-xs">{trait}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-slate-300 text-sm">Share new experience:</p>
            <div className="flex gap-2">
              <Input
                value={sharedExperience}
                onChange={(e) => setSharedExperience(e.target.value)}
                placeholder="E.g., 'We watched a sunset together and felt peaceful'"
                className="bg-slate-800 border-slate-600 text-white flex-1"
              />
              <Button
                onClick={() => evolveMutation.mutate()}
                disabled={!sharedExperience || evolveMutation.isPending}
                className="bg-gradient-to-r from-pink-600 to-purple-600"
              >
                {evolveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkle className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {bond && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-pink-500/10 rounded p-2">
                <p className="text-slate-400">Bond Strength</p>
                <p className="text-pink-400 font-bold text-lg">{(bond.bond_strength * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-purple-500/10 rounded p-2">
                <p className="text-slate-400">Trust Level</p>
                <p className="text-purple-400 font-bold text-lg">{(bond.trust_level * 100).toFixed(0)}%</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[450px]">
            <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[5, 8, 5]} intensity={1.8} color="#ec4899" />
              <pointLight position={[-5, 5, 5]} intensity={1.5} color="#a855f7" />

              <PersonalityScene 
                companion={companion}
                bond={bond}
                evolution={latestEvolution}
              />

              <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}