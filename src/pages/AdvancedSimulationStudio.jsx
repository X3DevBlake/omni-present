import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnvironmentDesigner from '../components/simulation/EnvironmentDesigner';
import AdvancedReplayViewer from '../components/simulation/AdvancedReplayViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, BarChart3 } from 'lucide-react';

export default function AdvancedSimulationStudio() {
  const [userEmail, setUserEmail] = React.useState(null);
  const [selectedReplay, setSelectedReplay] = React.useState(null);

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
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Zap className="w-10 h-10 text-purple-400" />
            Advanced Simulation Studio
          </h1>
          <p className="text-white/60">Procedural environments and replay analytics</p>
        </motion.div>

        <Tabs defaultValue="environments" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
            <TabsTrigger value="environments" className="data-[state=active]:bg-cyan-500/20">
              <Zap className="w-4 h-4 mr-2" />
              Environments
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-500/20">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="environments" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              {userEmail ? (
                <EnvironmentDesigner userEmail={userEmail} />
              ) : (
                <div className="text-center py-12 text-white/40">Please log in</div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {selectedReplay ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
              >
                <AdvancedReplayViewer replayId={selectedReplay} />
                <button
                  onClick={() => setSelectedReplay(null)}
                  className="mt-4 text-cyan-400 hover:text-cyan-300"
                >
                  Back to replays
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
              >
                <div className="text-center py-12 text-white/40">
                  <p>Select a simulation replay to view advanced analytics</p>
                </div>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}