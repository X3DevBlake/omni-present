import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import SmartAccountDashboard from '../components/banking/SmartAccountDashboard';
import OmniCardManager from '../components/banking/OmniCardManager';
import FinancialHealthVisualizer from '../components/banking/FinancialHealthVisualizer';
import BudgetForecastWidget from '../components/banking/BudgetForecastWidget';
import BackButton from '../components/navigation/BackButton';
import { Wallet, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';

export default function BankingCorePhase1() {
  const [userEmail, setUserEmail] = React.useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const tabs = [
    { id: 'dashboard', label: '💰 Smart Accounts', icon: Wallet },
    { id: 'cards', label: '💳 Omni Cards', icon: CreditCard },
    { id: 'health', label: '📊 Financial Health', icon: TrendingUp },
    { id: 'forecast', label: '🔮 Budget Forecast', icon: AlertTriangle }
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <BackButton />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Banking Core <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Phase 1</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            AI-powered banking features including smart accounts, intelligent cards, and predictive financial management
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-3 mb-8 border-b border-white/10 overflow-x-auto pb-3 flex-wrap">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-cyan-500 text-cyan-400'
                    : 'border-b-2 border-transparent text-white/60 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {userEmail ? (
            <>
              {activeTab === 'dashboard' && <SmartAccountDashboard userEmail={userEmail} />}
              {activeTab === 'cards' && <OmniCardManager userEmail={userEmail} />}
              {activeTab === 'health' && <FinancialHealthVisualizer userEmail={userEmail} />}
              {activeTab === 'forecast' && <BudgetForecastWidget userEmail={userEmail} />}
            </>
          ) : (
            <div className="text-center py-12 text-white/60">
              Please log in to access banking features
            </div>
          )}
        </motion.div>

        {/* Phase Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-8"
        >
          <h3 className="text-white font-bold text-xl mb-4">Phase 1: AI-Powered Banking Core Features</h3>
          <div className="grid md:grid-cols-2 gap-6 text-white/80 text-sm">
            <div>
              <h4 className="text-cyan-400 font-semibold mb-2">✓ Implemented</h4>
              <ul className="space-y-1">
                <li>• Smart AI accounts with spending prediction</li>
                <li>• Omni-cards with tiered benefits</li>
                <li>• AI financial health scoring</li>
                <li>• Predictive budget forecasting</li>
                <li>• Anomaly detection alerts</li>
              </ul>
            </div>
            <div>
              <h4 className="text-blue-400 font-semibold mb-2">📋 Coming Next</h4>
              <ul className="space-y-1">
                <li>• Fraud detection & proactive alerts</li>
                <li>• Automated savings & investments</li>
                <li>• Personalized financial advisor</li>
                <li>• Credit score optimization</li>
                <li>• Multi-currency wallet</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}