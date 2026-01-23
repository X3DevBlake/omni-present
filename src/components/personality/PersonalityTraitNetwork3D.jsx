import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Network, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';

function TraitNode({ trait, index, total, onSelect }) {
  const meshRef = useRef();
  const angle = (index / total) * Math.PI * 2;
  const radius = 4 + trait.strength * 2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = trait.strength * 2;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const pulse = Math.sin(state.clock.elapsedTime * 2 + index) * 0.15 + 1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const categoryColors = {
    communication: '#00FFFF',
    emotional: '#FF00FF',
    cognitive: '#FFFF00',
    behavioral: '#00FF00',
    social: '#FF8800'
  };

  const color = categoryColors[trait.trait_category] || '#FFFFFF';

  return (
    <group position={[x, y, z]} onClick={() => onSelect(trait)}>
      <Sphere ref={meshRef} args={[trait.strength * 0.6, 16, 16]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={trait.strength}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      <Text
        position={[0, trait.strength * 0.8, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
      >
        {trait.trait_name}
      </Text>
      <Text
        position={[0, -trait.strength * 0.5, 0]}
        fontSize={0.15}
        color={color}
        anchorX="center"
      >
        {(trait.strength * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function SynergyConnection({ from, to, strength }) {
  return (
    <Line
      points={[from, to]}
      color="#00FF00"
      lineWidth={strength * 3}
      transparent
      opacity={strength * 0.7}
    />
  );
}

function ConflictConnection({ from, to, tension }) {
  return (
    <Line
      points={[from, to]}
      color="#FF0000"
      lineWidth={tension * 3}
      transparent
      opacity={tension * 0.5}
      dashed
      dashScale={20}
    />
  );
}

function TraitNetworkScene({ traits, onTraitSelect }) {
  const connections = [];
  
  traits.forEach((trait, i) => {
    const angle1 = (i / traits.length) * Math.PI * 2;
    const radius1 = 4 + trait.strength * 2;
    const from = [
      Math.cos(angle1) * radius1,
      trait.strength * 2,
      Math.sin(angle1) * radius1
    ];

    // Synergies
    trait.synergies?.forEach(syn => {
      const targetIdx = traits.findIndex(t => t.trait_name === syn.synergy_with_trait);
      if (targetIdx !== -1) {
        const angle2 = (targetIdx / traits.length) * Math.PI * 2;
        const radius2 = 4 + traits[targetIdx].strength * 2;
        const to = [
          Math.cos(angle2) * radius2,
          traits[targetIdx].strength * 2,
          Math.sin(angle2) * radius2
        ];
        connections.push({ from, to, type: 'synergy', strength: syn.amplification_factor });
      }
    });

    // Conflicts
    trait.conflicts?.forEach(conf => {
      const targetIdx = traits.findIndex(t => t.trait_name === conf.conflicts_with_trait);
      if (targetIdx !== -1) {
        const angle2 = (targetIdx / traits.length) * Math.PI * 2;
        const radius2 = 4 + traits[targetIdx].strength * 2;
        const to = [
          Math.cos(angle2) * radius2,
          traits[targetIdx].strength * 2,
          Math.sin(angle2) * radius2
        ];
        connections.push({ from, to, type: 'conflict', tension: conf.tension_level });
      }
    });
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF00FF" />
      
      <OrbitControls autoRotate autoRotateSpeed={0.3} />

      {/* Central core */}
      <Sphere args={[1, 32, 32]}>
        <meshStandardMaterial
          color="#8800FF"
          emissive="#8800FF"
          emissiveIntensity={0.8}
          wireframe
        />
      </Sphere>

      {traits.map((trait, idx) => (
        <TraitNode
          key={trait.id || idx}
          trait={trait}
          index={idx}
          total={traits.length}
          onSelect={onTraitSelect}
        />
      ))}

      {connections.map((conn, idx) => 
        conn.type === 'synergy' ? (
          <SynergyConnection key={idx} from={conn.from} to={conn.to} strength={conn.strength} />
        ) : (
          <ConflictConnection key={idx} from={conn.from} to={conn.to} tension={conn.tension} />
        )
      )}

      <Text position={[0, -4, 0]} fontSize={0.5} color="#FF00FF" anchorX="center">
        Personality Network
      </Text>
    </>
  );
}

export default function PersonalityTraitNetwork3D({ agentId }) {
  const [selectedTrait, setSelectedTrait] = useState(null);
  const queryClient = useQueryClient();

  const { data: traits = [] } = useQuery({
    queryKey: ['personality-traits', agentId],
    queryFn: () => base44.entities.AgentPersonalityTrait.filter({ agent_id: agentId }),
    refetchInterval: 10000
  });

  const learnTraitMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('dynamicTraitLearner', {
        agent_id: agentId,
        interaction_context: {
          event_type: 'manual_training',
          context: 'simulation'
        },
        user_feedback: { sentiment: 'positive' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personality-traits'] });
      toast.success('New traits learned!');
    }
  });

  const synergies = traits.reduce((sum, t) => sum + (t.synergies?.length || 0), 0);
  const conflicts = traits.reduce((sum, t) => sum + (t.conflicts?.length || 0), 0);

  return (
    <Card className="bg-gradient-to-br from-purple-950 to-pink-950 border-purple-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Network className="w-6 h-6 text-purple-400" />
            Personality Trait Network
          </span>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-purple-900 text-purple-200">
              {traits.length} Traits
            </Badge>
            <Badge variant="outline" className="bg-green-900 text-green-200">
              {synergies} Synergies
            </Badge>
            {conflicts > 0 && (
              <Badge variant="outline" className="bg-red-900 text-red-200">
                {conflicts} Conflicts
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-96 w-full rounded-lg overflow-hidden bg-black">
          <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
            <color attach="background" args={['#110011']} />
            <fog attach="fog" args={['#110011', 5, 40]} />
            <TraitNetworkScene
              traits={traits}
              onTraitSelect={setSelectedTrait}
            />
          </Canvas>
        </div>

        <Button
          onClick={() => learnTraitMutation.mutate()}
          disabled={learnTraitMutation.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          {learnTraitMutation.isPending ? 'Learning...' : 'Trigger Trait Learning'}
        </Button>

        {selectedTrait && (
          <div className="p-4 bg-purple-900/30 border border-purple-700 rounded-lg">
            <h4 className="text-white font-semibold mb-2">{selectedTrait.trait_name}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="text-white">{selectedTrait.trait_category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Strength:</span>
                <span className="text-white">{(selectedTrait.strength * 100).toFixed(0)}%</span>
              </div>
              {selectedTrait.learned_from && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Learned from:</span>
                  <span className="text-white">{selectedTrait.learned_from.interaction_count} interactions</span>
                </div>
              )}
              {selectedTrait.manifestations?.length > 0 && (
                <div className="mt-3">
                  <div className="text-slate-400 mb-1">Recent Manifestation:</div>
                  <div className="text-xs text-slate-300 bg-slate-900 p-2 rounded">
                    {selectedTrait.manifestations[selectedTrait.manifestations.length - 1].behavior_change}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}