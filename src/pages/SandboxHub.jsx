import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import SandboxEnvironment from '../components/sandbox/SandboxEnvironment';
import RealtimeDataFeed from '../components/market/RealtimeDataFeed';
import GoogleDriveSync from '../components/integrations/GoogleDriveSync';
import { FlaskConical } from 'lucide-react';

export default function SandboxHub() {
  const [userEmail, setUserEmail] = React.useState(null);

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
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <FlaskConical className="w-10 h-10 text-cyan-400" />
            AI Agent Sandbox
          </h1>
          <p className="text-white/60">Risk-free environment for testing and refining AI strategies</p>
        </motion.div>

        {userEmail ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6">
                <SandboxEnvironment userEmail={userEmail} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6">
                <RealtimeDataFeed userEmail={userEmail} />
              </div>

              <div className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6">
                <GoogleDriveSync userEmail={userEmail} agentId="agent-1" />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-white/40">Please log in</div>
        )}
      </div>
    </AuroraBackground>
  );
}