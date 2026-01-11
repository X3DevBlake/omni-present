import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { BarChart3, Brain, TrendingUp, Radio } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import BackButton from '../components/navigation/BackButton';
import MarketPredictions from '../components/defi/MarketPredictions';
import SentimentAnalyzer from '../components/defi/SentimentAnalyzer';
import RealTimeMonitor from '../components/defi/RealTimeMonitor';
import AdvancedAnalytics from '../components/defi/AdvancedAnalytics';

export default function DeFiAnalyticsPhase4() {
  const [activeTab, setActiveTab] = useState('predictions');
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const tabs = [
    { id: 'predictions', label: 'Market Predictions', icon: Brain },
    { id: 'sentiment', label: 'Sentiment Analysis', icon: TrendingUp },
    { id: 'realtime', label: 'Real-Time Monitor', icon: Radio },
    { id: 'analytics', label: 'Advanced Analytics', icon: BarChart3 },
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
          <h1 className="text-4xl font-bold text-white mb-2">Phase 4: Advanced Analytics</h1>
          <p className="text-white/60">AI predictions, sentiment analysis, and real-time monitoring</p>
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
                    ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
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
          {activeTab === 'predictions' && <MarketPredictions userEmail={userEmail} />}
          {activeTab === 'sentiment' && <SentimentAnalyzer userEmail={userEmail} />}
          {activeTab === 'realtime' && <RealTimeMonitor userEmail={userEmail} />}
          {activeTab === 'analytics' && <AdvancedAnalytics userEmail={userEmail} />}
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
              <li>• Advanced market predictions</li>
              <li>• Real-time sentiment analysis</li>
              <li>• Live market monitoring</li>
              <li>• Predictive alerts & notifications</li>
              <li>• Multi-asset correlation analysis</li>
            </ul>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-6">
            <h3 className="text-indigo-400 font-bold mb-3">→ Coming Next (Phase 5)</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>• Decentralized governance (DAO)</li>
              <li>• Community voting & proposals</li>
              <li>• Governance token staking</li>
              <li>• Treasury management</li>
              <li>• Protocol upgrades & governance</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}