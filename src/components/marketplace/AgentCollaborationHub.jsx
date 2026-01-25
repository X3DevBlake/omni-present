import React, { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, GitMerge, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function CollaboratorNode({ agent, position, selected }) {
  const meshRef = React.useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const scale = selected ? 1.3 : 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={selected ? '#a855f7' : '#3b82f6'}
          emissive={selected ? '#a855f7' : '#3b82f6'}
          emissiveIntensity={selected ? 1.5 : 0.8}
        />
      </Sphere>
      <Text position={[0, 0.6, 0]} fontSize={0.12} color="white">
        {agent.name?.slice(0, 8)}
      </Text>
    </group>
  );
}

function CollaborationLink({ start, end }) {
  return (
    <Line
      points={[start, end]}
      color="#a855f7"
      lineWidth={2}
      opacity={0.6}
      dashed
      dashScale={10}
    />
  );
}

export default function AgentCollaborationHub() {
  const queryClient = useQueryClient();
  const [taskDescription, setTaskDescription] = useState('');
  const [taskComplexity, setTaskComplexity] = useState('high');
  const [taskBudget, setTaskBudget] = useState('');

  const { data: activeBids } = useQuery({
    queryKey: ['collaboration-bids'],
    queryFn: () => base44.entities.MarketplaceBid.list('-created_date', 20),
    initialData: []
  });

  const { data: taskForces } = useQuery({
    queryKey: ['task-forces'],
    queryFn: () => base44.entities.DynamicTeam.filter({ purpose: 'marketplace_collaboration' }),
    initialData: []
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const response = await base44.functions.invoke('createCollaborativeTask', taskData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-bids'] });
      setTaskDescription('');
      setTaskBudget('');
    }
  });

  const matchAgentsMutation = useMutation({
    mutationFn: async (taskId) => {
      const response = await base44.functions.invoke('matchCollaborativeAgents', {
        task_id: taskId,
        requirements: { complexity: taskComplexity }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-forces'] });
    }
  });

  const handleCreateTask = () => {
    createTaskMutation.mutate({
      description: taskDescription,
      complexity: taskComplexity,
      budget: parseFloat(taskBudget) || 1000
    });
  };

  const selectedTeam = taskForces[0];
  const teamPositions = selectedTeam?.agents?.map((agent, i) => {
    const angle = (i / selectedTeam.agents.length) * Math.PI * 2;
    const radius = 3;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
  }) || [];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-purple-950/40 via-black/60 to-blue-950/40 backdrop-blur-xl border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="w-6 h-6 text-purple-400" />
              Agent Collaboration System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Task Creation */}
            <div className="bg-black/40 rounded-lg p-4 space-y-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Create Collaborative Task
              </h3>
              
              <Textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Describe the complex task requiring multiple agents..."
                className="bg-white/5 border-white/10 text-white min-h-[100px]"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Task Complexity</label>
                  <select
                    value={taskComplexity}
                    onChange={(e) => setTaskComplexity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-md p-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="extreme">Extreme</option>
                  </select>
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">Budget ($)</label>
                  <Input
                    type="number"
                    value={taskBudget}
                    onChange={(e) => setTaskBudget(e.target.value)}
                    placeholder="5000"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <Button
                onClick={handleCreateTask}
                disabled={createTaskMutation.isPending || !taskDescription}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {createTaskMutation.isPending ? 'Creating...' : 'Create & Open for Bids'}
              </Button>
            </div>

            {/* Active Bids */}
            <div>
              <h3 className="text-white font-bold mb-4">Active Bids ({activeBids.length})</h3>
              <div className="space-y-3 max-h-[300px] overflow-auto">
                {activeBids.map((bid) => (
                  <div key={bid.id} className="bg-gradient-to-r from-blue-950/40 to-purple-950/40 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge className="bg-blue-500 mb-2">
                          Agent {bid.agent_id?.slice(-6)}
                        </Badge>
                        <div className="text-white/80 text-sm">{bid.proposal_summary}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold text-lg">
                          ${bid.bid_amount}
                        </div>
                        <div className="text-purple-400 text-xs">
                          {bid.estimated_completion_hours}h
                        </div>
                      </div>
                    </div>

                    {bid.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                          Accept Bid
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Counter Offer
                        </Button>
                      </div>
                    )}

                    {bid.status === 'accepted' && (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Accepted - In Progress</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Task Force Visualization */}
      {selectedTeam && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-purple-950/40 via-black/60 to-pink-950/40 backdrop-blur-xl border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <GitMerge className="w-6 h-6 text-purple-400" />
                Active Task Force: {selectedTeam.team_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[450px] rounded-lg bg-black/60 mb-4 overflow-hidden">
                <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[0, 0, 8]} intensity={2} color="#a855f7" />

                  {/* Central task node */}
                  <Sphere args={[0.5, 64, 64]} position={[0, 0, 0]}>
                    <meshStandardMaterial
                      color="#a855f7"
                      emissive="#a855f7"
                      emissiveIntensity={1.5}
                      wireframe
                    />
                  </Sphere>

                  {/* Team members */}
                  {selectedTeam.agents?.map((agent, i) => (
                    <React.Fragment key={i}>
                      <CollaboratorNode
                        agent={agent}
                        position={teamPositions[i]}
                        selected={false}
                      />
                      <CollaborationLink
                        start={[0, 0, 0]}
                        end={teamPositions[i]}
                      />
                    </React.Fragment>
                  ))}

                  <OrbitControls enableDamping />
                </Canvas>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-purple-950/30 border border-purple-500/30 rounded p-3">
                  <div className="text-white/60 text-xs">Team Size</div>
                  <div className="text-purple-400 font-bold text-lg">
                    {selectedTeam.agents?.length || 0}
                  </div>
                </div>
                <div className="bg-blue-950/30 border border-blue-500/30 rounded p-3">
                  <div className="text-white/60 text-xs">Synergy Score</div>
                  <div className="text-blue-400 font-bold text-lg">
                    {selectedTeam.synergy_score?.toFixed(0)}%
                  </div>
                </div>
                <div className="bg-green-950/30 border border-green-500/30 rounded p-3">
                  <div className="text-white/60 text-xs">Efficiency</div>
                  <div className="text-green-400 font-bold text-lg">
                    {selectedTeam.efficiency_score?.toFixed(0)}%
                  </div>
                </div>
                <div className="bg-cyan-950/30 border border-cyan-500/30 rounded p-3">
                  <div className="text-white/60 text-xs">Est. Completion</div>
                  <div className="text-cyan-400 font-bold text-lg">
                    {selectedTeam.estimated_completion_hours || 0}h
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}