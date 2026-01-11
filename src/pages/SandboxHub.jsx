import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import SandboxEnvironment from '../components/sandbox/SandboxEnvironment';
import RealtimeDataFeed from '../components/market/RealtimeDataFeed';
import GoogleDriveSync from '../components/integrations/GoogleDriveSync';
import Enhanced3DAgentCollaboration from '../components/3d/Enhanced3DAgentCollaboration';
import ComprehensiveDocsGenerator from '../components/documentation/ComprehensiveDocsGenerator';
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
          <div className="space-y-6">
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

                <div className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6">
                  <ComprehensiveDocsGenerator userEmail={userEmail} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4">Sandbox 3D Visualization</h3>
              <Enhanced3DAgentCollaboration 
                agents={[
                  { id: 'sandbox-1', name: 'Test Agent 1', position: [0, 0, 0], isActive: true, recentDecisions: [{}, {}, {}] },
                  { id: 'sandbox-2', name: 'Test Agent 2', position: [4, 0, 2], isActive: true, recentDecisions: [{}] },
                  { id: 'sandbox-3', name: 'Test Agent 3', position: [-3, 1, -2], isActive: false, recentDecisions: [] }
                ]}
                communications={[
                  { from_position: [0, 0, 0], to_position: [4, 0, 2], active: true },
                  { from_position: [4, 0, 2], to_position: [-3, 1, -2], active: false }
                ]}
                pathfinding={[
                  { waypoints: [[0, 0, 0], [1, 0, 0.5], [2, 0, 1], [3, 0, 1.5], [4, 0, 2]] }
                ]}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-white/40">Please log in</div>
        )}
      </div>
    </AuroraBackground>
  );
}