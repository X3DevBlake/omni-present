import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Html, Text, Sparkles, Box } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Play, Zap, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

function TeamMember3D({ member, position, isActive = false }) {
  const memberRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (memberRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3 + position[0]) * 0.15;
      memberRef.current.scale.setScalar(pulse * (isActive ? 1.2 : 1));
      memberRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const roleColor = member.role?.includes('lead') ? '#10b981' : '#3b82f6';

  return (
    <group position={position}>
      <group
        ref={memberRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <Sphere args={[0.25, 16, 16]}>
          <meshStandardMaterial color={roleColor} emissive={roleColor} emissiveIntensity={0.9} />
        </Sphere>
        <Sparkles count={20} scale={0.8} size={2} speed={0.6} color={roleColor} />
        
        {hovered && (
          <Html position={[0, 0.5, 0]} center>
            <div className="bg-slate-900 border border-cyan-500/50 rounded-lg p-3 min-w-48">
              <p className="text-white font-bold text-sm">{member.embodiment_id}</p>
              <p className="text-cyan-400 text-xs mb-1">Role: {member.role}</p>
              <div className="space-y-0.5">
                {member.skill_contribution?.slice(0, 3).map((skill, idx) => (
                  <Badge key={idx} className="bg-purple-500/30 text-xs mr-1">{skill}</Badge>
                ))}
              </div>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

function CommunicationBeam3D({ from, to, intensity = 0.5 }) {
  const beamRef = useRef();

  useFrame((state) => {
    if (beamRef.current) {
      beamRef.current.material.opacity = intensity * (0.3 + Math.sin(state.clock.elapsedTime * 5) * 0.2);
    }
  });

  return (
    <Line
      ref={beamRef}
      points={[from, to]}
      color="#00f5ff"
      lineWidth={3}
      transparent
    />
  );
}

function TaskProgress3D({ allocation = [], position }) {
  return (
    <group position={position}>
      {allocation.slice(0, 4).map((task, idx) => {
        const yPos = idx * 0.4;
        const progress = task.progress || 0;
        const statusColor = task.status === 'completed' ? '#10b981' : task.status === 'in_progress' ? '#3b82f6' : '#64748b';
        
        return (
          <group key={idx} position={[0, yPos, 0]}>
            <Box args={[progress * 2, 0.1, 0.1]} position={[progress, 0, 0]}>
              <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={0.7} />
            </Box>
            <Text position={[-1, 0.2, 0]} fontSize={0.06} color="#ffffff">
              {task.subtask?.substring(0, 20)}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function TeamScene({ team }) {
  const members = team?.member_embodiments || [];
  
  const memberPositions = members.map((_, idx) => {
    const angle = (idx / Math.max(members.length, 1)) * Math.PI * 2;
    const radius = 2;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
  });

  return (
    <>
      <gridHelper args={[10, 10, '#334155', '#1e293b']} />
      
      {/* Team members */}
      {members.map((member, idx) => (
        <TeamMember3D 
          key={member.embodiment_id} 
          member={member} 
          position={memberPositions[idx]}
          isActive={team?.team_status === 'active'}
        />
      ))}

      {/* Communication network */}
      {memberPositions.map((pos1, idx1) => 
        memberPositions.slice(idx1 + 1).map((pos2, idx2) => (
          <CommunicationBeam3D 
            key={`${idx1}-${idx2}`}
            from={pos1}
            to={pos2}
            intensity={team?.communication_protocol?.data_sharing_enabled ? 0.7 : 0.3}
          />
        ))
      )}

      {/* Task progress */}
      {team?.task_allocation && (
        <TaskProgress3D allocation={team.task_allocation} position={[3, 0, 0]} />
      )}

      {/* Team core */}
      <Sphere args={[0.3, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1.2} />
      </Sphere>
    </>
  );
}

export default function EmbodiedTeamCollaboration3D() {
  const queryClient = useQueryClient();
  const [taskDesc, setTaskDesc] = useState('');

  const { data: teams = [] } = useQuery({
    queryKey: ['embodied-teams'],
    queryFn: () => base44.entities.EmbodiedAgentTeam.list('-created_date', 10),
    initialData: []
  });

  const formTeamMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('embodied-team-collaboration', {
        operation: 'form_team',
        task_description: taskDesc
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['embodied-teams']);
      toast.success(`Team formed - ${data.team_plan?.selected_agents?.length} agents`);
      setTaskDesc('');
    }
  });

  const coordinateMutation = useMutation({
    mutationFn: async (teamId) => {
      const response = await base44.functions.invoke('embodied-team-collaboration', {
        operation: 'coordinate_action',
        team_id: teamId
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Team coordinated');
    }
  });

  const activeTeam = teams[0];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Embodied Agent Team Collaboration
            <Badge className="bg-cyan-500/30">{teams.length} Teams</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-slate-300 text-sm">Form team for complex task:</p>
            <div className="flex gap-2">
              <Input
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="E.g., 'Assemble furniture together while teaching each other'"
                className="bg-slate-800 border-slate-600 text-white flex-1"
              />
              <Button
                onClick={() => formTeamMutation.mutate()}
                disabled={!taskDesc || formTeamMutation.isPending}
                className="bg-gradient-to-r from-cyan-600 to-purple-600"
              >
                {formTeamMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {activeTeam && (
            <div className="space-y-3">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-cyan-300 font-bold text-sm">{activeTeam.team_name}</p>
                  <Badge className="bg-green-500/30">{activeTeam.team_status}</Badge>
                </div>
                <p className="text-slate-400 text-xs mb-2">{activeTeam.member_embodiments?.length} agents • {activeTeam.task_allocation?.length} subtasks</p>
                
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="bg-slate-800/50 rounded p-2">
                    <p className="text-slate-400 text-xs">Synergy</p>
                    <p className="text-purple-400 font-bold">{(activeTeam.team_performance?.synergy_score * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-slate-800/50 rounded p-2">
                    <p className="text-slate-400 text-xs">Efficiency</p>
                    <p className="text-cyan-400 font-bold">{(activeTeam.team_performance?.efficiency_rating * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-slate-800/50 rounded p-2">
                    <p className="text-slate-400 text-xs">Coordination</p>
                    <p className="text-green-400 font-bold">{(activeTeam.team_performance?.coordination_quality * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => coordinateMutation.mutate(activeTeam.team_id)}
                disabled={coordinateMutation.isPending}
                size="sm"
                className="w-full bg-purple-600"
              >
                {coordinateMutation.isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Zap className="w-3 h-3 mr-2" />}
                Coordinate Team Action
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[450px]">
            <Canvas camera={{ position: [5, 4, 5], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[5, 8, 5]} intensity={2} color="#06b6d4" />
              <pointLight position={[-5, 5, -5]} intensity={1.5} color="#a855f7" />

              <TeamScene team={activeTeam} />

              <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}