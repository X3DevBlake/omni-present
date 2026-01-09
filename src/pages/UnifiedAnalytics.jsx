import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedHubNav from '../components/navigation/EnhancedHubNav';
import UnifiedAnalyticsDashboard from '../components/analytics/UnifiedAnalyticsDashboard';
import CrossHubCorrelationMap from '../components/analytics/CrossHubCorrelationMap';
import MarketDataFeed from '../components/analytics/MarketDataFeed';
import AICoachingSystem from '../components/ai/AICoachingSystem';
import AIAgentManager from '../components/ai/AIAgentManager';
import { usePersonalization } from '../components/personalization/PersonalizationContext';

export default function UnifiedAnalytics() {
  const { trackPageVisit } = usePersonalization();

  useEffect(() => {
    trackPageVisit('UnifiedAnalytics');
  }, []);

  return (
    <>
      <EnhancedHubNav currentHub="Analytics" />
      <AuroraBackground className="min-h-screen py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-center mb-12"
          >
            <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full">
              <span className="text-cyan-400 text-sm font-semibold">📊 Analytics</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Unified 
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> Analytics</span>
            </h1>
            <p className="text-white/60 text-lg">Cross-hub insights, correlations, and KPI tracking</p>
          </motion.div>

          {/* Main Analytics */}
          <div className="mb-12">
            <UnifiedAnalyticsDashboard />
          </div>

          {/* Cross-Hub Correlations */}
          <div className="mb-12">
            <CrossHubCorrelationMap />
          </div>

          {/* Market Data Feed */}
          <div className="mb-12">
            <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
              <h3 className="text-white font-bold text-xl mb-4">Real-Time Market Intelligence</h3>
              <MarketDataFeed />
            </div>
          </div>

          {/* AI Coaching System */}
          <div className="mb-12">
            <AICoachingSystem />
          </div>

          {/* AI Agent Management */}
          <div className="mb-12">
            <AIAgentManager />
          </div>

          {/* Coming Soon Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-white font-bold text-lg mb-4">Advanced Features</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Custom Report Builder</h4>
                <p className="text-white/60 text-sm">Create and schedule custom reports across all hubs</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Predictive Analytics</h4>
                <p className="text-white/60 text-sm">AI-powered forecasting for portfolio and device trends</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Alert Rules Engine</h4>
                <p className="text-white/60 text-sm">Custom alerts based on cross-hub KPI thresholds</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">API & Webhooks</h4>
                <p className="text-white/60 text-sm">Real-time data integration with external systems</p>
              </div>
            </div>
          </motion.div>
        </div>
      </AuroraBackground>
    </>
  );
}