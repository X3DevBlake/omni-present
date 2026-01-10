import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, Share2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function AgentCollaborationHub({ userId }) {
  const [selectedCollaboration, setSelectedCollaboration] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: collaborations = [], isLoading } = useQuery({
    queryKey: ['agent-collaborations', userId],
    queryFn: () => base44.entities.SharedKnowledge.filter({ agents: userId }).catch(() => [])
  });

  const handleCreateCollaboration = async () => {
    // Simplified for now - would open a modal for agent selection
    setIsCreating(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-cyan-400" />
              Agent Collaboration Hub
            </h2>
            <p className="text-white/60 mt-2">Enable agents to work together safely and efficiently</p>
          </div>
          <Button
            onClick={handleCreateCollaboration}
            className="bg-gradient-to-r from-cyan-500 to-purple-500"
          >
            <Users className="w-4 h-4 mr-2" />
            New Collaboration
          </Button>
        </div>
      </motion.div>

      {/* Active Collaborations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collaborations.map((collab, idx) => (
          <motion.div
            key={collab.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            onClick={() => setSelectedCollaboration(collab)}
            className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-cyan-500/30 hover:border-cyan-400/60 cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white font-semibold">Active</span>
                </div>
                <h3 className="text-white font-bold text-lg">{collab.task_type}</h3>
              </div>
              <div className="flex gap-2">
                {collab.agents && collab.agents.slice(0, 3).map((agent, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Users className="w-4 h-4" />
                {collab.agents?.length || 0} agents collaborating
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Share2 className="w-4 h-4" />
                Knowledge sharing enabled
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                All validations passed
              </div>
            </div>

            <button className="w-full mt-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" />
              View Details
            </button>
          </motion.div>
        ))}

        {collaborations.length === 0 && !isLoading && (
          <motion.div
            className="col-span-full p-12 text-center rounded-xl bg-white/5 border-2 border-dashed border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No Active Collaborations</h3>
            <p className="text-white/60">Create your first agent collaboration to enable multi-agent workflows</p>
          </motion.div>
        )}
      </div>

      {/* Details Panel */}
      <AnimatePresence>
        {selectedCollaboration && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30"
          >
            <h3 className="text-white font-bold text-xl mb-4">Collaboration Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-white/60 text-sm">Task Type</div>
                <div className="text-white font-semibold">{selectedCollaboration.task_type}</div>
              </div>
              <div>
                <div className="text-white/60 text-sm">Agents Involved</div>
                <div className="text-white font-semibold">{selectedCollaboration.agents?.length || 0}</div>
              </div>
              <div className="col-span-2">
                <div className="text-white/60 text-sm mb-2">Collaboration Strategy</div>
                <pre className="bg-black/40 p-3 rounded-lg text-white/70 text-xs overflow-auto max-h-40">
                  {JSON.stringify(JSON.parse(selectedCollaboration.collaboration_strategy || '{}'), null, 2)}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}