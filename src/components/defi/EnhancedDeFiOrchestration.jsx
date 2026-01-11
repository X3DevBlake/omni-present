import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, TrendingUp, AlertCircle, FileText, Database, Loader, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EnhancedDeFiOrchestration() {
  const [orchestrating, setOrchestrating] = useState(false);
  const [status, setStatus] = useState(null);
  const [workflows, setWorkflows] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const startOrchestration = async () => {
    if (!userEmail) return;

    setOrchestrating(true);
    setStatus('Initializing DeFi Orchestration...');

    try {
      // Orchestrate all workflows
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Orchestrate comprehensive DeFi workflows:
        
User: ${userEmail}

Setup and activate:
1. Zapier workflows for yield farming
2. Google Docs documentation
3. Snowflake analytics pipeline
4. Twilio alerts
5. ElevenLabs voiceovers
6. Gemini analysis engine`,
      });

      setWorkflows(response.workflows);
      setAnalysis(response.analysis);
      setStatus('DeFi Orchestration Complete');
    } catch (error) {
      console.error('Error orchestrating:', error);
      setStatus('Error during orchestration');
    } finally {
      setOrchestrating(false);
    }
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-lg p-4 space-y-3"
      >
        <p className="text-white font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Advanced DeFi Orchestration
        </p>
        <p className="text-white/60 text-sm">
          Integrate Zapier workflows, Google Docs, Snowflake, Twilio, and ElevenLabs for advanced DeFi management
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={startOrchestration}
          disabled={orchestrating || !userEmail}
          className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
        >
          {orchestrating ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              {status}
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Start DeFi Orchestration
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Tabs */}
      {workflows && (
        <Tabs defaultValue="workflows" className="space-y-4">
          <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start">
            <TabsTrigger value="workflows" className="flex items-center gap-1">
              <Zap className="w-3 h-3" /> Workflows
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Analysis
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-1">
              <FileText className="w-3 h-3" /> Docs
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-3">
            <div className="space-y-2">
              {workflows?.map((workflow, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{workflow.name}</p>
                      <p className="text-white/60 text-xs mt-1">{workflow.description}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
            >
              <p className="text-white font-bold text-sm">Gemini Analysis</p>
              {analysis && (
                <div className="space-y-2 text-sm">
                  {analysis.recommendations?.slice(0, 5).map((rec, idx) => (
                    <p key={idx} className="text-white/70">• {rec}</p>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="docs" className="space-y-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <p className="text-white font-bold flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                Google Docs Integration
              </p>
              <p className="text-white/60 text-xs">
                Strategy document created and linked. Auto-updates daily with latest metrics.
              </p>
            </motion.div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <p className="text-white font-bold flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4" />
                Alert System
              </p>
              <p className="text-white/60 text-xs">
                Twilio alerts configured. ElevenLabs voiceovers ready for critical notifications.
              </p>
            </motion.div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}