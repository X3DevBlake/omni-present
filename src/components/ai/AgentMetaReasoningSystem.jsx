import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertCircle, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentMetaReasoningSystem() {
  const [selectedAgent, setSelectedAgent] = useState('portfolio-agent');
  const [reasoningLog, setReasoningLog] = useState([]);
  const [loading, setLoading] = useState(false);

  const agents = [
    { id: 'portfolio-agent', name: 'Portfolio Agent' },
    { id: 'market-agent', name: 'Market Analyzer' },
    { id: 'risk-agent', name: 'Risk Controller' }
  ];

  const generateReasoning = async () => {
    setLoading(true);
    try {
      const reasoning = await base44.integrations.Core.InvokeLLM({
        prompt: `As a ${selectedAgent} agent, explain your decision-making for rebalancing a portfolio in current market conditions.
        Return JSON with {decision, confidence: 0-100, reasoning: [], knowledgeGaps: [], uncertainties: []}`,
        response_json_schema: {
          type: 'object',
          properties: {
            decision: { type: 'string' },
            confidence: { type: 'number' },
            reasoning: { type: 'array', items: { type: 'string' } },
            knowledgeGaps: { type: 'array', items: { type: 'string' } },
            uncertainties: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setReasoningLog(prev => [{
        id: Date.now(),
        timestamp: new Date(),
        agent: selectedAgent,
        ...reasoning
      }, ...prev]);

      toast.success('Reasoning generated');
    } catch (err) {
      toast.error('Failed to generate reasoning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Agent Meta-Reasoning
        </h3>

        <div className="space-y-3">
          <label className="text-white/70 text-sm">Select Agent</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          >
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          <motion.button
            onClick={generateReasoning}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            className="w-full py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded font-medium text-sm disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Generate Reasoning'}
          </motion.button>
        </div>
      </div>

      <div className="space-y-3">
        {reasoningLog.length === 0 ? (
          <div className="text-white/40 text-sm p-4 text-center">No reasoning logs yet</div>
        ) : (
          reasoningLog.map(log => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 border border-white/10 rounded-lg overflow-hidden"
            >
              <div className="bg-white/5 p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <p className="text-white font-bold text-sm">{log.agent}</p>
                  <span className={`px-3 py-1 rounded text-xs font-bold ${
                    log.confidence > 80 ? 'bg-green-500/20 text-green-400' :
                    log.confidence > 60 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    Confidence: {log.confidence}%
                  </span>
                </div>
                <p className="text-white/80 text-sm mt-2">{log.decision}</p>
                <p className="text-white/40 text-xs mt-2">{log.timestamp.toLocaleTimeString()}</p>
              </div>

              {/* Reasoning Steps */}
              {log.reasoning && log.reasoning.length > 0 && (
                <div className="p-4 space-y-2 border-b border-white/10">
                  <p className="text-cyan-400 text-xs font-bold">Reasoning Steps:</p>
                  {log.reasoning.map((step, i) => (
                    <div key={i} className="flex gap-2 text-xs text-white/70">
                      <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Knowledge Gaps */}
              {log.knowledgeGaps && log.knowledgeGaps.length > 0 && (
                <div className="p-4 space-y-2 border-b border-white/10">
                  <p className="text-yellow-400 text-xs font-bold">Knowledge Gaps:</p>
                  {log.knowledgeGaps.map((gap, i) => (
                    <div key={i} className="flex gap-2 text-xs text-white/70">
                      <AlertCircle className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span>{gap}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Uncertainties */}
              {log.uncertainties && log.uncertainties.length > 0 && (
                <div className="p-4 space-y-2">
                  <p className="text-orange-400 text-xs font-bold">Uncertainties:</p>
                  {log.uncertainties.map((uncertainty, i) => (
                    <div key={i} className="flex gap-2 text-xs text-white/70">
                      <AlertCircle className="w-3 h-3 text-orange-400 flex-shrink-0 mt-0.5" />
                      <span>{uncertainty}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}