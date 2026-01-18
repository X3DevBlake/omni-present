import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Zap, GitBranch, Play } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import AutomationWorkflowBuilder from '../components/workflow/AutomationWorkflowBuilder';

export default function WorkflowAutomationHub() {
  return (
    <AuroraBackground className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Workflow Automation
            </span>
          </h1>
          <p className="text-white/60 text-lg">Define automated sequences across all hubs</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active Workflows', value: '3', icon: Zap, color: 'from-purple-500 to-pink-500' },
            { label: 'Total Executions', value: '127', icon: Play, color: 'from-cyan-500 to-blue-500' },
            { label: 'Hub Integrations', value: '6', icon: GitBranch, color: 'from-green-500 to-emerald-500' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className={`bg-gradient-to-br ${stat.color} bg-opacity-20 border-white/10 p-4`}>
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-white/80" />
                    <div>
                      <p className="text-white/60 text-xs">{stat.label}</p>
                      <p className="text-white font-bold text-lg">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
          </TabsList>

          {/* Workflows */}
          <TabsContent value="workflows">
            <AutomationWorkflowBuilder />
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates">
            <Card className="bg-black/40 border-white/10 p-6">
              <h3 className="text-white font-bold mb-4">Workflow Templates</h3>
              <p className="text-white/60">Pre-built workflows available. Select to customize.</p>
            </Card>
          </TabsContent>

          {/* Executions */}
          <TabsContent value="executions">
            <Card className="bg-black/40 border-white/10 p-6">
              <h3 className="text-white font-bold mb-4">Recent Executions</h3>
              <p className="text-white/60">Workflow execution history and logs.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}