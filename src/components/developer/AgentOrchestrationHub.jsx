import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Play, Plus, Settings, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AgentOrchestrationHub() {
  const [workflows, setWorkflows] = useState([
    { id: 1, name: 'Market Analysis Swarm', status: 'active', nodes: 5 },
    { id: 2, name: 'Code Review Pipeline', status: 'paused', nodes: 3 },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Agent Orchestration</h2>
          <p className="text-gray-400">Design and monitor multi-agent workflows</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" /> New Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 bg-black/40 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-400" />
              Active Workflows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workflows.map(workflow => (
              <motion.div
                key={workflow.id}
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:border-purple-500/50"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-white">{workflow.name}</span>
                  <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                    {workflow.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{workflow.nodes} Agents</span>
                  <Activity className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-2 bg-black/40 border-purple-500/30 min-h-[500px] relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
          <CardHeader>
            <CardTitle className="text-white flex justify-between items-center">
              <span>Workflow Visualizer</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline"><Settings className="w-4 h-4" /></Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700"><Play className="w-4 h-4" /></Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p>Visual Workflow Editor Component Placeholder</p>
              <p className="text-xs">Drag and drop agents to connect</p>
            </div>
            {/* 
                In a real implementation, we would use React Flow or similar library here.
                For now, we'll simulate a visualizer.
            */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
               <circle cx="20%" cy="50%" r="30" fill="#8b5cf6" opacity="0.5" />
               <circle cx="50%" cy="50%" r="40" fill="#ec4899" opacity="0.5" />
               <circle cx="80%" cy="50%" r="30" fill="#3b82f6" opacity="0.5" />
               <line x1="22%" y1="50%" x2="48%" y2="50%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="5,5" />
               <line x1="52%" y1="50%" x2="78%" y2="50%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="5,5" />
            </svg>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}