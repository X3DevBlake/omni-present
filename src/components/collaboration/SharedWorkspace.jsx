import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Users, Lock, Share2, MessageSquare, Edit2 } from 'lucide-react';

export default function SharedWorkspace() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const mockWorkspaces = [
        {
          id: 1,
          name: 'Q1 Planning Hub',
          description: 'Collaborative planning for Q1 initiatives',
          members: ['Alice', 'Bob', 'Charlie'],
          documents: 5,
          lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: 2,
          name: 'Agent Research',
          description: 'Research and development workspace',
          members: ['David', 'Eve'],
          documents: 12,
          lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      ];
      setWorkspaces(mockWorkspaces);
    } catch (error) {
      console.error('Error loading workspaces:', error);
    }
  };

  const createWorkspace = async () => {
    setIsCreating(false);
    await loadWorkspaces();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-white">Shared Workspaces</h2>
          <p className="text-white/60 mt-1">Collaborate with your team in real-time</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-purple-500 hover:bg-purple-600">
          <Share2 className="w-4 h-4 mr-2" />
          New Workspace
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workspaces.map((workspace, idx) => (
          <motion.div
            key={workspace.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card 
              className="bg-black/40 border-white/10 p-6 hover:border-white/30 cursor-pointer transition-all"
              onClick={() => setSelectedWorkspace(workspace)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{workspace.name}</h3>
                  <p className="text-white/60 text-sm mt-1">{workspace.description}</p>
                </div>
                <Lock className="w-5 h-5 text-green-400" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{workspace.members.length} members</span>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Edit2 className="w-4 h-4" />
                  <span>{workspace.documents} documents</span>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <MessageSquare className="w-4 h-4" />
                  <span>Updated {Math.floor((Date.now() - workspace.lastUpdated) / 60000)} mins ago</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {workspace.members.map((member, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    {member[0]}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}