import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AuroraBackground from '../components/omni/AuroraBackground';
import AgentCollaborationSpace3D from '../components/collaboration/AgentCollaborationSpace3D';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CollaborativeAgentHub() {
  const [userEmail, setUserEmail] = React.useState(null);
  const [task, setTask] = React.useState('');

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const { data: collaborations = [] } = useQuery({
    queryKey: ['collaborations', userEmail],
    queryFn: () => userEmail ? base44.entities.AgentCollaboration.filter({ user_email: userEmail }).catch(() => []) : []
  });

  const { data: communications = [] } = useQuery({
    queryKey: ['communications', collaborations[0]?.workspace_id],
    queryFn: () => collaborations[0] ? base44.entities.AgentCommunication.filter({ collaboration_id: collaborations[0].workspace_id }).catch(() => []) : []
  });

  const agents = [
    { id: 'agent-1', name: 'Trader', status: 'active' },
    { id: 'agent-2', name: 'Analyst', status: 'active' },
    { id: 'agent-3', name: 'Coordinator', status: 'active' },
    { id: 'agent-4', name: 'Researcher', status: 'idle' }
  ];

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-cyan-400" />
            Collaborative Agent Hub
          </h1>
          <p className="text-white/60">Real-time multi-agent collaboration</p>
        </motion.div>

        {/* New Collaboration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6 mb-6"
        >
          <h3 className="text-white font-bold mb-3">Create New Collaboration</h3>
          <div className="flex gap-3">
            <Input
              placeholder="Task objective..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="flex-1 bg-white/5 border-white/10"
            />
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              Start
            </Button>
          </div>
        </motion.div>

        {/* 3D Collaboration Space */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
        >
          <AgentCollaborationSpace3D agents={agents} communications={communications} />
        </motion.div>

        {/* Active Collaborations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-2"
        >
          <h3 className="text-white font-bold">Active Sessions</h3>
          {collaborations.map((collab, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-white font-bold">{collab.task_objective}</p>
              <p className="text-white/60 text-sm">
                {collab.participating_agents?.length || 0} agents • {collab.progress}% complete
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </AuroraBackground>
  );
}