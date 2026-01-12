import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, MessageSquare, Users, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import InterSimulationConnections from '../components/simulation/InterSimulationConnections';
import RealTimeMessageFeed from '../components/simulation/RealTimeMessageFeed';
import PersistentProfileManager from '../components/simulation/PersistentProfileManager';
import IntegrationControlPanel from '../components/integrations/IntegrationControlPanel';

export default function CrossSimulationHub() {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D1A] via-[#1a1a2e] to-[#0D0D1A] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Globe className="w-10 h-10 text-cyan-400" />
            Cross-Simulation Communication Hub
          </h1>
          <p className="text-white/60">Manage inter-simulation agent connections and communications</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <InterSimulationConnections />
          <RealTimeMessageFeed />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <PersistentProfileManager userEmail={userEmail} />
          <IntegrationControlPanel />
        </div>
      </div>
    </div>
  );
}