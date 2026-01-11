import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import AgentMemoryManager from '../components/agents/AgentMemoryManager';
import BehaviorTreeVisualizer from '../components/agents/BehaviorTreeVisualizer';
import SkillAcquisitionHub from '../components/agents/SkillAcquisitionHub';
import AgentTrainingStudio from '../components/training/AgentTrainingStudio';
import RealWorldTaskManager from '../components/tasks/RealWorldTaskManager';
import CustomDatasetUploader from '../components/training/CustomDatasetUploader';
import RewardFunctionDesigner from '../components/training/RewardFunctionDesigner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, GitBranch, Zap, GraduationCap, Briefcase } from 'lucide-react';

export default function AgentManagementHub() {
  const [userEmail, setUserEmail] = React.useState(null);
  const [selectedAgent, setSelectedAgent] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Agent Management Hub</h1>
          <p className="text-white/60">Manage memory, behavior trees, and skills for AI agents</p>
        </motion.div>

        {!selectedAgent ? (
          <div className="text-center py-12">
            <p className="text-white/60 mb-4">Select an agent to manage</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[1, 2, 3].map((idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedAgent(`agent-${idx}`)}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-cyan-500/50"
                >
                  <p className="text-white font-bold">Agent-{idx.toString().padStart(2, '0')}</p>
                  <p className="text-white/50 text-sm mt-1">Active</p>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{selectedAgent}</h2>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-white/60 hover:text-white transition"
              >
                Back
              </button>
            </div>

            <Tabs defaultValue="memory" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-white/5 border border-white/10">
                <TabsTrigger value="memory" className="data-[state=active]:bg-cyan-500/20">
                  <Brain className="w-4 h-4 mr-2" />
                  Memory
                </TabsTrigger>
                <TabsTrigger value="behavior" className="data-[state=active]:bg-cyan-500/20">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Behavior
                </TabsTrigger>
                <TabsTrigger value="skills" className="data-[state=active]:bg-cyan-500/20">
                  <Zap className="w-4 h-4 mr-2" />
                  Skills
                </TabsTrigger>
                <TabsTrigger value="training" className="data-[state=active]:bg-cyan-500/20">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Training
                </TabsTrigger>
                <TabsTrigger value="tasks" className="data-[state=active]:bg-cyan-500/20">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Tasks
                </TabsTrigger>
              </TabsList>

              <TabsContent value="memory" className="space-y-6 mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
                >
                  <AgentMemoryManager agentId={selectedAgent} />
                </motion.div>
              </TabsContent>

              <TabsContent value="behavior" className="space-y-6 mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
                >
                  <BehaviorTreeVisualizer agentId={selectedAgent} />
                </motion.div>
              </TabsContent>

              <TabsContent value="skills" className="space-y-6 mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
                >
                  <SkillAcquisitionHub agentId={selectedAgent} />
                </motion.div>
              </TabsContent>

              <TabsContent value="training" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
                  >
                    {userEmail && <AgentTrainingStudio agentId={selectedAgent} userEmail={userEmail} />}
                  </motion.div>
                  <div className="space-y-4">
                    {userEmail && <CustomDatasetUploader agentId={selectedAgent} userEmail={userEmail} />}
                    {userEmail && <RewardFunctionDesigner agentId={selectedAgent} userEmail={userEmail} />}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-6 mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
                >
                  {userEmail && <RealWorldTaskManager agentId={selectedAgent} userEmail={userEmail} />}
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </AuroraBackground>
  );
}