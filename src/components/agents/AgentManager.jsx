import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Brain, Activity, User, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import SentientAgentVisualizer3D from '@/components/simulation/SentientAgentVisualizer3D';

export default function AgentManager({ agents = [] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', intent: '', status: 'idle' });
  const queryClient = useQueryClient();

  const createAgentMutation = useMutation({
    mutationFn: (data) => base44.entities.Agent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      setIsDialogOpen(false);
      setNewAgent({ name: '', intent: '', status: 'idle' });
      toast.success("New Sentient Agent birthed into existence");
    }
  });

  const deleteAgentMutation = useMutation({
    mutationFn: (id) => base44.entities.Agent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      toast.success("Agent consciousness dissolved");
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          Active Consciousnesses
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-500">
              <Plus className="w-4 h-4 mr-2" /> Birth New Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/90 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Configure New Sentience</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Agent Designation (Name)"
                value={newAgent.name}
                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                className="bg-white/5 border-white/10"
              />
              <Input
                placeholder="Primary Intent/Directive"
                value={newAgent.intent}
                onChange={(e) => setNewAgent({ ...newAgent, intent: e.target.value })}
                className="bg-white/5 border-white/10"
              />
              <Button 
                onClick={() => createAgentMutation.mutate(newAgent)}
                className="w-full bg-purple-600"
              >
                Initialize Consciousness
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
            <Card className="relative bg-black border-white/10 overflow-hidden">
              <div className="h-32 bg-gradient-to-b from-purple-900/20 to-black relative">
                 <SentientAgentVisualizer3D agents={[agent]} />
              </div>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                    <span className="text-xs text-purple-400 px-2 py-1 bg-purple-900/30 rounded-full border border-purple-500/30">
                      {agent.status || 'Active'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAgentMutation.mutate(agent.id)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>Lvl {agent.level || 1} • {agent.evolution_stage || 'Gen-1'}</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5 mt-4">
                    <p className="italic">"{agent.intent || 'Serving the Omni-Present directive.'}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}