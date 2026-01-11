import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import AgentTrainingStudio from '../components/training/AgentTrainingStudio';
import CustomDatasetUploader from '../components/training/CustomDatasetUploader';
import RewardFunctionDesigner from '../components/training/RewardFunctionDesigner';
import { base44 } from '@/api/base44Client';
import { GraduationCap, Brain, Database, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AgentTrainingCenter() {
  const [userEmail, setUserEmail] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('agent-1');

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-2xl">
              <GraduationCap className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Agent Training Center</h1>
              <p className="text-white/60">Advanced training, datasets, and reward functions</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="training" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
            <TabsTrigger value="training" className="data-[state=active]:bg-orange-500/20">
              <Brain className="w-4 h-4 mr-2" />
              Training
            </TabsTrigger>
            <TabsTrigger value="datasets" className="data-[state=active]:bg-orange-500/20">
              <Database className="w-4 h-4 mr-2" />
              Datasets
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-orange-500/20">
              <Zap className="w-4 h-4 mr-2" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-500/20">
              <GraduationCap className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="space-y-6 mt-6">
            {userEmail && (
              <div className="bg-gradient-to-br from-black/40 to-black/20 border border-white/10 rounded-xl p-6">
                <AgentTrainingStudio agentId={selectedAgent} userEmail={userEmail} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="datasets" className="space-y-6 mt-6">
            {userEmail && (
              <div className="bg-gradient-to-br from-black/40 to-black/20 border border-white/10 rounded-xl p-6">
                <CustomDatasetUploader agentId={selectedAgent} userEmail={userEmail} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6 mt-6">
            {userEmail && (
              <div className="bg-gradient-to-br from-black/40 to-black/20 border border-white/10 rounded-xl p-6">
                <RewardFunctionDesigner agentId={selectedAgent} userEmail={userEmail} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="bg-gradient-to-br from-black/40 to-black/20 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4">Training Analytics</h3>
              <p className="text-white/60">Coming soon: Comprehensive training analytics and performance metrics</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}