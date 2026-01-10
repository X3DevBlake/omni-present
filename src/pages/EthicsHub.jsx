import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuroraBackground from '../components/omni/AuroraBackground';
import GuidelinesList from '../components/ethics/GuidelinesList';
import ViolationsDashboard from '../components/ethics/ViolationsDashboard';
import CreateGuideline from '../components/ethics/CreateGuideline';
import { Shield, AlertTriangle, FileText } from 'lucide-react';

export default function EthicsHub() {
  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-cyan-400" />
            AI Ethics Hub
          </h1>
          <p className="text-white/60">Define, monitor, and enforce ethical guidelines for agents</p>
        </motion.div>

        <Tabs defaultValue="guidelines" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
            <TabsTrigger value="guidelines" className="data-[state=active]:bg-cyan-500/20">
              <FileText className="w-4 h-4 mr-2" />
              Guidelines
            </TabsTrigger>
            <TabsTrigger value="violations" className="data-[state=active]:bg-cyan-500/20">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Violations
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-cyan-500/20">
              <Shield className="w-4 h-4 mr-2" />
              Monitoring
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guidelines" className="mt-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CreateGuideline />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              <GuidelinesList />
            </motion.div>
          </TabsContent>

          <TabsContent value="violations" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              <ViolationsDashboard />
            </motion.div>
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              <div className="text-center py-12 text-white/40">
                <p>Real-time monitoring and alerts coming soon</p>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}