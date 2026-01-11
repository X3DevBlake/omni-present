import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, FileText, Slack, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

import GeminiCardAdvisor from '../components/banking/GeminiCardAdvisor';
import GeminiDeFiOpportunityScan from '../components/defi/GeminiDeFiOpportunityScan';
import GeminiCryptoPricePrediction from '../components/crypto/GeminiCryptoPricePrediction';
import GeminiOmniTokenAdvisor from '../components/omni/GeminiOmniTokenAdvisor';
import Banking3DVoiceHub from '../components/3d/Banking3DVoiceHub';
import Portfolio3DBalance from '../components/3d/3DPortfolioBalance';
import BankingVoiceAutomation from '../components/integrations/BankingVoiceAutomation';

export default function EnhancedBankingHub() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [reports, setReports] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const generateBankingReport = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate comprehensive banking portfolio report for ${userEmail}:

Include:
1. Overall financial health snapshot
2. Card optimization recommendations
3. Crypto holdings analysis
4. DeFi yield opportunities
5. Omni token position review
6. Risk assessment across all products
7. Next 30-day action items
8. 90-day financial goals

Format for Google Docs integration.`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            sections: { type: 'array', items: { type: 'object' } },
            actionItems: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      // Save to Google Docs via Zapier
      await base44.integrations.Core.InvokeLLM({
        prompt: `Save this report to Google Docs and share via Slack:
        
Report: ${JSON.stringify(report)}
User: ${userEmail}`,
      });

      setReports(prev => [...prev, {
        id: Date.now(),
        title: report.title,
        timestamp: new Date(),
        sections: report.sections,
      }]);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Banking Command Center</h1>
          <p className="text-white/60">Gemini-powered cards, crypto, DeFi, and Omni token management</p>
        </motion.div>

        {/* Action Bar */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={generateBankingReport}
            disabled={isGeneratingReport}
            className="px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 flex items-center gap-2 text-sm"
          >
            <FileText className="w-4 h-4" />
            {isGeneratingReport ? 'Generating...' : 'Generate Report'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 bg-purple-500/20 border border-purple-400 rounded-lg text-purple-300 hover:bg-purple-500/30 flex items-center gap-2 text-sm"
          >
            <Slack className="w-4 h-4" />
            Connect Slack
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 bg-green-500/20 border border-green-400 rounded-lg text-green-300 hover:bg-green-500/30 flex items-center gap-2 text-sm"
          >
            <Zap className="w-4 h-4" />
            Setup Zapier
          </motion.button>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="text-xs md:text-sm">3D Overview</TabsTrigger>
            <TabsTrigger value="cards" className="text-xs md:text-sm">💳 Cards</TabsTrigger>
            <TabsTrigger value="crypto" className="text-xs md:text-sm">🪙 Crypto</TabsTrigger>
            <TabsTrigger value="defi" className="text-xs md:text-sm">🏦 DeFi</TabsTrigger>
            <TabsTrigger value="omni" className="text-xs md:text-sm">✨ Omni</TabsTrigger>
            <TabsTrigger value="voice" className="text-xs md:text-sm">🎤 Voice</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs md:text-sm">📊 Reports</TabsTrigger>
          </TabsList>

          {/* 3D Overview */}
          <AnimatePresence>
            {selectedTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <Banking3DVoiceHub />
                <Portfolio3DBalance />
              </motion.div>
            )}

            {/* Cards Tab */}
            {selectedTab === 'cards' && (
              <motion.div
                key="cards"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6"
              >
                <GeminiCardAdvisor />
              </motion.div>
            )}

            {/* Crypto Tab */}
            {selectedTab === 'crypto' && (
              <motion.div
                key="crypto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6"
              >
                <GeminiCryptoPricePrediction />
              </motion.div>
            )}

            {/* DeFi Tab */}
            {selectedTab === 'defi' && (
              <motion.div
                key="defi"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6"
              >
                <GeminiDeFiOpportunityScan />
              </motion.div>
            )}

            {/* Omni Tab */}
            {selectedTab === 'omni' && (
              <motion.div
                key="omni"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6"
              >
                <GeminiOmniTokenAdvisor />
              </motion.div>
            )}

            {/* Voice Tab */}
            {selectedTab === 'voice' && (
              <motion.div
                key="voice"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6"
              >
                <BankingVoiceAutomation />
              </motion.div>
            )}

            {/* Reports Tab */}
            {selectedTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {reports.map((report, idx) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-bold">{report.title}</p>
                        <p className="text-white/60 text-sm mt-1">{report.timestamp.toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-1 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 text-xs hover:bg-cyan-500/30"
                        >
                          View
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-1 bg-purple-500/20 border border-purple-400 rounded text-purple-300 text-xs hover:bg-purple-500/30"
                        >
                          Share
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}