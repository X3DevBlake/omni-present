import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Html, Text, Sparkles, Trail } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShoppingCart, TrendingUp, Zap, Loader2, Brain, Award } from 'lucide-react';
import { toast } from 'sonner';

function SkillNode3D({ skill, position, isHighlighted = false }) {
  const nodeRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (nodeRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      nodeRef.current.scale.setScalar(pulse * (hovered ? 1.3 : 1));
      nodeRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const proficiency = skill.skill_proficiency || 0.5;
  const color = proficiency > 0.8 ? '#10b981' : proficiency > 0.6 ? '#3b82f6' : '#a855f7';

  return (
    <group position={position}>
      <group
        ref={nodeRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <Sphere args={[0.2, 16, 16]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </Sphere>
        <Sparkles count={Math.floor(proficiency * 30)} scale={0.6} size={2} speed={0.6} color={color} />
        
        {hovered && (
          <Html position={[0, 0.4, 0]} center>
            <div className="bg-slate-900 border border-purple-500/50 rounded-lg p-3 min-w-48">
              <p className="text-white font-bold text-sm mb-1">{skill.skill_name}</p>
              <p className="text-purple-400 text-xs">Proficiency: {(proficiency * 100).toFixed(0)}%</p>
              <p className="text-cyan-400 text-xs">Price: {skill.price_omni} OMNI</p>
              <Badge className="bg-green-500/30 text-xs mt-1">
                {skill.execution_data?.successful_executions} executions
              </Badge>
            </div>
          </Html>
        )}
      </group>

      <Text position={[0, -0.4, 0]} fontSize={0.08} color="#ffffff" anchorX="center">
        {skill.skill_name}
      </Text>
    </group>
  );
}

function SkillTransferBeam3D({ from, to }) {
  const beamRef = useRef();

  useFrame((state) => {
    if (beamRef.current) {
      beamRef.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });

  return (
    <Line
      ref={beamRef}
      points={[from, to]}
      color="#00f5ff"
      lineWidth={3}
      transparent
      dashed
    />
  );
}

function MarketplaceScene({ listings = [], transfers = [] }) {
  return (
    <>
      <gridHelper args={[12, 12, '#334155', '#1e293b']} />
      
      {listings.map((listing, idx) => {
        const angle = (idx / Math.max(listings.length, 1)) * Math.PI * 2;
        const radius = 2 + (listing.skill_proficiency || 0.5) * 1.5;
        const position = [
          Math.cos(angle) * radius,
          (listing.skill_proficiency || 0.5) * 1.5,
          Math.sin(angle) * radius
        ];
        
        return <SkillNode3D key={listing.id} skill={listing} position={position} />;
      })}

      {transfers.map((transfer, idx) => (
        <SkillTransferBeam3D
          key={idx}
          from={[Math.random() * 4 - 2, 0, Math.random() * 4 - 2]}
          to={[Math.random() * 4 - 2, 0, Math.random() * 4 - 2]}
        />
      ))}

      <Trail width={1.2} length={20} color="#a855f7" attenuation={(t) => t * t}>
        <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1} />
        </Sphere>
      </Trail>
    </>
  );
}

export default function SkillMarketplace3D() {
  const queryClient = useQueryClient();
  const [selectedListing, setSelectedListing] = useState(null);

  const { data: listings = [] } = useQuery({
    queryKey: ['skill-marketplace'],
    queryFn: () => base44.entities.AgentSkillMarketplace.list('-created_date', 20),
    initialData: []
  });

  const { data: embodiments = [] } = useQuery({
    queryKey: ['embodiments-for-marketplace'],
    queryFn: () => base44.entities.PhysicallyEmbodiedAgent.list('-created_date', 10),
    initialData: []
  });

  const acquireSkillMutation = useMutation({
    mutationFn: async (listingId) => {
      const response = await base44.functions.invoke('skill-marketplace-engine', {
        operation: 'acquire_skill',
        listing_id: listingId,
        buyer_embodiment_id: embodiments[0]?.embodiment_id
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['skill-marketplace']);
      queryClient.invalidateQueries(['embodiments-for-marketplace']);
      toast.success(`Skill acquired - ${(data.transfer_analysis?.transfer_success_probability * 100).toFixed(0)}% transfer success`);
    }
  });

  const analyzeNetworkMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('skill-marketplace-engine', {
        operation: 'analyze_network'
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Network analyzed');
    }
  });

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-purple-400" />
            Agent Skill Marketplace
            <Badge className="bg-purple-500/30">{listings.length} Skills</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => analyzeNetworkMutation.mutate()}
            disabled={analyzeNetworkMutation.isPending}
            size="sm"
            className="bg-cyan-600"
          >
            {analyzeNetworkMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
            Analyze Skill Network
          </Button>

          <div className="grid grid-cols-2 gap-3">
            {listings.slice(0, 4).map((listing) => (
              <div
                key={listing.id}
                className="bg-slate-800/60 rounded-lg p-3 border border-purple-500/20 cursor-pointer hover:border-purple-500/50 transition-all"
                onClick={() => setSelectedListing(listing)}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white font-bold text-sm">{listing.skill_name}</p>
                  <Badge className="bg-purple-500/30 text-xs">{listing.price_omni} OMNI</Badge>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                      style={{ width: `${listing.skill_proficiency * 100}%` }}
                    />
                  </div>
                  <p className="text-slate-400 text-xs">{(listing.skill_proficiency * 100).toFixed(0)}% proficiency</p>
                  <p className="text-green-400 text-xs">{listing.execution_data?.successful_executions} executions</p>
                </div>
              </div>
            ))}
          </div>

          {selectedListing && embodiments.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-300 font-bold mb-2">Acquire: {selectedListing.skill_name}</p>
              <p className="text-slate-300 text-sm mb-3">Transfer to: {embodiments[0]?.embodiment_platform}</p>
              <Button
                onClick={() => acquireSkillMutation.mutate(selectedListing.listing_id)}
                disabled={acquireSkillMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600"
              >
                {acquireSkillMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Award className="w-4 h-4 mr-2" />}
                Acquire for {selectedListing.price_omni} OMNI
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[450px]">
            <Canvas camera={{ position: [5, 4, 5], fov: 50 }}>
              <ambientLight intensity={0.4} />
              <pointLight position={[5, 8, 5]} intensity={1.5} color="#a855f7" />
              <pointLight position={[-5, 5, -5]} intensity={1.2} color="#06b6d4" />
              <spotLight position={[0, 10, 0]} angle={0.6} penumbra={0.5} intensity={1.5} color="#ffffff" />

              <MarketplaceScene listings={listings} transfers={[]} />

              <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.6} />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}