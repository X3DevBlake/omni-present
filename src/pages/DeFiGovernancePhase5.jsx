import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Vote, Coins, Users, FileText } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import BackButton from '../components/navigation/BackButton';
import GovernanceVoting from '../components/defi/GovernanceVoting';
import TokenStaking from '../components/defi/TokenStaking';
import ProposalManager from '../components/defi/ProposalManager';
import TreasuryDashboard from '../components/defi/TreasuryDashboard';

export default function DeFiGovernancePhase5() {
  const [activeTab, setActiveTab] = useState('voting');
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const tabs = [
    { id: 'voting', label: 'Governance Voting', icon: Vote },
    { id: 'staking', label: 'Token Staking', icon: Coins },
    { id: 'proposals', label: 'Proposals', icon: FileText },
    { id: 'treasury', label: 'Treasury', icon: Users },
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <BackButton />
      <div className="p-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Phase 5: Decentralized Governance</h1>
          <p className="text-white/60">DAO governance, community voting, and treasury management</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 mb-8 bg-black/40 p-4 rounded-lg border border-white/10">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-500/30 border border-indigo-500/50 text-indigo-300'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'voting' && <GovernanceVoting userEmail={userEmail} />}
          {activeTab === 'staking' && <TokenStaking userEmail={userEmail} />}
          {activeTab === 'proposals' && <ProposalManager userEmail={userEmail} />}
          {activeTab === 'treasury' && <TreasuryDashboard userEmail={userEmail} />}
        </div>

        {/* Phase Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 grid md:grid-cols-2 gap-6"
        >
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
            <h3 className="text-green-400 font-bold mb-3">✓ Implemented</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>• Decentralized governance DAO</li>
              <li>• Community voting on proposals</li>
              <li>• Governance token staking</li>
              <li>• Treasury management dashboard</li>
              <li>• Protocol upgrade proposals</li>
            </ul>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
            <h3 className="text-yellow-400 font-bold mb-3">🚀 Future Roadmap</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>• Layer 2 scaling integration</li>
              <li>• NFT marketplace & trading</li>
              <li>• Advanced derivatives trading</li>
              <li>• Cross-chain bridge expansion</li>
              <li>• Enterprise DeFi solutions</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}