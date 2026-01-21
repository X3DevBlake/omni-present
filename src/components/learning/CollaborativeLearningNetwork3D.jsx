import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Html, Trail, Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Brain, Zap, Loader2, Sparkles as SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';

// Guild member node
function GuildMemberNode3D({ member, position, guildColor }) {
  const nodeRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (nodeRef.current) {
      const pulse = 1 + member.contribution_score * Math.sin(state.clock.elapsedTime * 3) * 0.15;
      nodeRef.current.scale.setScalar(pulse * (hovered ? 1.3 : 1));
    }
  });

  const roleColors = {
    learner: '#3b82f6',
    mentor: '#10b981',
    contributor: '#f59e0b',
    synthesizer: '#a855f7'
  };

  const color = roleColors[member.role] || guildColor;

  return (
    <group 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Trail width={0.3} length={15} color={color} attenuation={(t) => t * t}>
        <Sphere ref={nodeRef} args={[0.15, 24, 24]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </Sphere>
      </Trail>

      {hovered && (
        <Html position={[0.3, 0, 0]} center={false}>
          <div className="bg-black/95 px-3 py-2 rounded-lg border-2" style={{ borderColor: color }}>
            <p className="text-white font-bold text-xs">{member.agent_id.slice(0, 8)}</p>
            <Badge className="text-xs mt-1" style={{ backgroundColor: color }}>{member.role}</Badge>
            <p className="text-slate-400 text-xs mt-1">Shared: {member.knowledge_shared}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// Knowledge flow beam
function KnowledgeFlowBeam3D({ from, to, active }) {
  const lineRef = useRef();

  useFrame((state) => {
    if (lineRef.current && active) {
      lineRef.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 5) * 0.2;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[from, to]}
      color="#00f5ff"
      lineWidth={2}
      transparent
      opacity={active ? 0.6 : 0.2}
    />
  );
}

// Guild network scene
function GuildNetworkScene({ guilds }) {
  const positions = React.useMemo(() => {
    const layout = [];
    guilds.forEach((guild, guildIdx) => {
      const guildAngle = (guildIdx / guilds.length) * Math.PI * 2;
      const guildRadius = 3;
      const guildCenter = [
        Math.cos(guildAngle) * guildRadius,
        0,
        Math.sin(guildAngle) * guildRadius
      ];

      guild.member_agents?.forEach((member, memberIdx) => {
        const memberAngle = (memberIdx / (guild.member_agents.length || 1)) * Math.PI * 2;
        const memberRadius = 1;
        layout.push({
          member,
          guild,
          position: [
            guildCenter[0] + Math.cos(memberAngle) * memberRadius,
            Math.sin(memberIdx * 0.5) * 0.5,
            guildCenter[2] + Math.sin(memberAngle) * memberRadius
          ]
        });
      });
    });
    return layout;
  }, [guilds]);

  return (
    <group>
      {positions.map((item, idx) => (
        <GuildMemberNode3D
          key={idx}
          member={item.member}
          position={item.position}
          guildColor="#ec4899"
        />
      ))}

      {/* Knowledge flow beams */}
      {positions.map((item, idx) => {
        const otherMembers = positions.filter(p => p.guild.guild_id === item.guild.guild_id && p !== item);
        return otherMembers.slice(0, 2).map((other, oIdx) => (
          <KnowledgeFlowBeam3D
            key={`${idx}-${oIdx}`}
            from={item.position}
            to={other.position}
            active={true}
          />
        ));
      })}

      {/* Guild center cores */}
      {guilds.map((guild, idx) => {
        const guildAngle = (idx / guilds.length) * Math.PI * 2;
        const guildRadius = 3;
        return (
          <group key={idx} position={[Math.cos(guildAngle) * guildRadius, 0, Math.sin(guildAngle) * guildRadius]}>
            <Sphere args={[0.25, 32, 32]}>
              <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.9} />
            </Sphere>
            <Sparkles count={20} scale={1.5} size={2} speed={0.5} color="#ec4899" />
            <Text position={[0, -0.5, 0]} fontSize={0.12} color="#ffffff" anchorX="center">
              {guild.guild_name}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

export default function CollaborativeLearningNetwork3D() {
  const queryClient = useQueryClient();
  const [selectedAgents, setSelectedAgents] = useState([]);

  const { data: guilds = [] } = useQuery({
    queryKey: ['learning-guilds'],
    queryFn: () => base44.entities.AgentLearningGuild.list('-created_date', 10),
    initialData: []
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['guild-agents'],
    queryFn: () => base44.entities.Agent.list('-created_date', 30),
    initialData: []
  });

  const formGuildMutation = useMutation({
    mutationFn: async (agentIds) => {
      const response = await base44.functions.invoke('collaborative-guild-orchestrator', {
        operation: 'form_guild',
        agent_ids: agentIds
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Learning guild formed');
      queryClient.invalidateQueries(['learning-guilds']);
      setSelectedAgents([]);
    }
  });

  const solveProblemMutation = useMutation({
    mutationFn: async (problem) => {
      const response = await base44.functions.invoke('collaborative-guild-orchestrator', {
        operation: 'solve_problem',
        problem_description: problem
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Collaborative solution generated');
    }
  });

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-pink-400" />
            Collaborative Learning Network
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <Users className="w-5 h-5 text-pink-400 mb-1" />
              <p className="text-2xl font-bold text-white">{guilds.length}</p>
              <p className="text-slate-400 text-xs">Active Guilds</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <Brain className="w-5 h-5 text-purple-400 mb-1" />
              <p className="text-2xl font-bold text-purple-400">
                {guilds.reduce((sum, g) => sum + (g.collective_intelligence?.collective_iq || 0), 0).toFixed(0)}
              </p>
              <p className="text-slate-400 text-xs">Collective IQ</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <Zap className="w-5 h-5 text-cyan-400 mb-1" />
              <p className="text-2xl font-bold text-cyan-400">
                {guilds.reduce((sum, g) => sum + (g.member_agents?.length || 0), 0)}
              </p>
              <p className="text-slate-400 text-xs">Total Members</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => formGuildMutation.mutate(agents.slice(0, 5).map(a => a.agent_id))}
              disabled={formGuildMutation.isPending}
              className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600"
            >
              {formGuildMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
              Form New Guild
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[500px]">
            <Canvas camera={{ position: [0, 4, 8], fov: 55 }}>
              <ambientLight intensity={0.2} />
              <pointLight position={[0, 10, 0]} intensity={1} color="#ec4899" />
              <pointLight position={[8, 6, 8]} intensity={0.8} color="#a855f7" />

              <GuildNetworkScene guilds={guilds} />

              <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}