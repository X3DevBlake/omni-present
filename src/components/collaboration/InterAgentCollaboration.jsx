import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Users, MessageSquare, ArrowRight, Briefcase, CheckCircle, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function InterAgentCollaboration({ userEmail }) {
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [taskDescription, setTaskDescription] = useState('');
  const [collaborationMode, setCollaborationMode] = useState('parallel');
  
  const queryClient = useQueryClient();

  const { data: agents = [] } = useQuery({
    queryKey: ['agents', userEmail],
    queryFn: () => base44.entities.Agent.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: collaborations = [] } = useQuery({
    queryKey: ['agent-collaborations', userEmail],
    queryFn: () => base44.entities.AgentCollaboration.list('-created_date', 20),
    enabled: !!userEmail
  });

  const { data: communications = [] } = useQuery({
    queryKey: ['agent-communications'],
    queryFn: () => base44.entities.AgentCommunication.list('-created_date', 30),
    enabled: !!userEmail
  });

  const initiateCollaboration = useMutation({
    mutationFn: async () => {
      // Create collaboration session
      const collab = await base44.entities.AgentCollaboration.create({
        user_email: userEmail,
        participating_agents: selectedAgents,
        task_description: taskDescription,
        collaboration_mode: collaborationMode,
        status: 'active',
        messages: []
      });

      // Use Gemini to orchestrate the collaboration
      const response = await fetch('/api/functions/gemini-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Orchestrate collaboration between ${selectedAgents.length} agents to complete this task: ${taskDescription}. 
          Mode: ${collaborationMode}. 
          Agents: ${selectedAgents.map(id => agents.find(a => a.id === id)?.name).join(', ')}.
          
          Provide a step-by-step plan with:
          1. Task breakdown and delegation strategy
          2. Communication protocol between agents
          3. Expected workflow and dependencies`,
          context: { collaboration_id: collab.id, agents: selectedAgents }
        })
      });

      const orchestration = await response.json();

      // Create initial communication log
      await base44.entities.AgentCommunication.create({
        collaboration_id: collab.id,
        sender_agent_id: 'orchestrator',
        receiver_agent_id: selectedAgents[0],
        message_type: 'task_delegation',
        message_content: orchestration.response || 'Task initiated',
        status: 'sent'
      });

      return { collab, orchestration };
    },
    onSuccess: () => {
      toast.success('Collaboration initiated!');
      queryClient.invalidateQueries(['agent-collaborations']);
      queryClient.invalidateQueries(['agent-communications']);
      setTaskDescription('');
      setSelectedAgents([]);
    }
  });

  const delegateTask = useMutation({
    mutationFn: async ({ fromAgent, toAgent, task }) => {
      return await base44.entities.AgentCommunication.create({
        sender_agent_id: fromAgent,
        receiver_agent_id: toAgent,
        message_type: 'task_delegation',
        message_content: task,
        status: 'pending',
        response_time_ms: 0
      });
    },
    onSuccess: () => {
      toast.success('Task delegated!');
      queryClient.invalidateQueries(['agent-communications']);
    }
  });

  const activeCollaboration = collaborations.find(c => c.status === 'active');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Agent Collaboration Hub</h2>
        <p className="text-white/60 text-sm">Enable AI agents to work together on complex tasks</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Initiate Collaboration */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Start New Collaboration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-white/80 text-sm mb-2 block">Select Agents (min 2)</label>
              <div className="space-y-2">
                {agents.map(agent => (
                  <label key={agent.id} className="flex items-center gap-3 p-3 bg-white/5 rounded cursor-pointer hover:bg-white/10">
                    <input
                      type="checkbox"
                      checked={selectedAgents.includes(agent.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAgents([...selectedAgents, agent.id]);
                        } else {
                          setSelectedAgents(selectedAgents.filter(id => id !== agent.id));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-white">{agent.name}</span>
                    <span className="text-white/60 text-xs">({agent.agent_type})</span>
                  </label>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="Describe the collaborative task..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
            />

            <Select value={collaborationMode} onValueChange={setCollaborationMode}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parallel">Parallel - Work simultaneously</SelectItem>
                <SelectItem value="sequential">Sequential - One after another</SelectItem>
                <SelectItem value="hierarchical">Hierarchical - Leader-follower</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => initiateCollaboration.mutate()}
              disabled={selectedAgents.length < 2 || !taskDescription || initiateCollaboration.isPending}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
            >
              <Users className="w-4 h-4 mr-2" />
              {initiateCollaboration.isPending ? 'Initiating...' : 'Start Collaboration'}
            </Button>
          </div>
        </Card>

        {/* Active Collaboration Status */}
        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            Active Collaboration
          </h3>

          {activeCollaboration ? (
            <div className="space-y-4">
              <div className="bg-black/20 rounded p-4">
                <div className="text-white font-bold mb-2">Task:</div>
                <div className="text-white/80 text-sm">{activeCollaboration.task_description}</div>
              </div>

              <div>
                <div className="text-white/60 text-xs mb-2">Participating Agents:</div>
                <div className="flex flex-wrap gap-2">
                  {activeCollaboration.participating_agents?.map(agentId => {
                    const agent = agents.find(a => a.id === agentId);
                    return (
                      <span key={agentId} className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                        {agent?.name || 'Agent'}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-white/80 text-sm">Mode: {activeCollaboration.collaboration_mode}</span>
              </div>

              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">{activeCollaboration.status}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">No active collaboration</p>
            </div>
          )}
        </Card>
      </div>

      {/* Communication Stream */}
      <Card className="bg-black/40 border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          Inter-Agent Communication Stream
        </h3>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {communications.map((comm, idx) => {
            const sender = agents.find(a => a.id === comm.sender_agent_id);
            const receiver = agents.find(a => a.id === comm.receiver_agent_id);
            
            return (
              <motion.div
                key={comm.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 p-4 bg-white/5 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-bold text-sm">{sender?.name || 'Agent'}</span>
                    <ArrowRight className="w-4 h-4 text-white/40" />
                    <span className="text-white/80 text-sm">{receiver?.name || 'Agent'}</span>
                    <span className="ml-auto px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                      {comm.message_type}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">{comm.message_content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/60">
                    <span>{new Date(comm.created_date).toLocaleTimeString()}</span>
                    {comm.response_time_ms > 0 && <span>{comm.response_time_ms}ms</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Collaboration History */}
      <Card className="bg-black/40 border-white/10 p-6">
        <h3 className="text-white font-bold mb-4">Collaboration History</h3>
        <div className="space-y-2">
          {collaborations.slice(0, 5).map((collab) => (
            <div key={collab.id} className="p-3 bg-white/5 rounded flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-bold">{collab.task_description?.substring(0, 50)}...</p>
                <p className="text-white/60 text-xs">
                  {collab.participating_agents?.length || 0} agents • {collab.collaboration_mode}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                collab.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                collab.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {collab.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}