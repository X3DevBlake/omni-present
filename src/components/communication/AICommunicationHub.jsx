import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, TrendingUp, FileText, Smile, Frown, Meh, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AICommunicationHub() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'Alpha', to: 'Beta', content: 'We need to prioritize the financial analysis before moving forward.', timestamp: '14:23:11' },
    { id: 2, from: 'Beta', to: 'Alpha', content: 'Agreed, but I think we should also consider the ethical implications first.', timestamp: '14:23:45' },
    { id: 3, from: 'Gamma', to: 'all', content: 'I have concerns about our current approach to resource allocation.', timestamp: '14:24:12' },
    { id: 4, from: 'Alpha', to: 'Beta', content: 'The data shows we are on the right track. Let us continue.', timestamp: '14:25:03' }
  ]);

  const [sentimentAnalysis, setSentimentAnalysis] = useState(null);
  const [summary, setSummary] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeSentiment = async () => {
    setAnalyzing(true);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze the sentiment and morale of these agent communications: ${JSON.stringify(messages)}. Provide insights on team dynamics and individual agent states.`,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_sentiment: { type: 'string' },
          morale_score: { type: 'number' },
          agent_sentiments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                agent: { type: 'string' },
                sentiment: { type: 'string' },
                confidence: { type: 'number' },
                stress_level: { type: 'string' }
              }
            }
          },
          conflict_indicators: { type: 'array', items: { type: 'string' } },
          collaboration_quality: { type: 'string' }
        }
      }
    });

    setSentimentAnalysis(response);
    setAnalyzing(false);
  };

  const generateSummary = async () => {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Summarize these agent communications, highlighting key decisions, conflicts, and action items: ${JSON.stringify(messages)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          key_decisions: { type: 'array', items: { type: 'string' } },
          conflicts: { type: 'array', items: { type: 'string' } },
          action_items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                task: { type: 'string' },
                assigned_to: { type: 'string' },
                priority: { type: 'string' }
              }
            }
          },
          unresolved_issues: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    setSummary(response);
  };

  const getSentimentIcon = (sentiment) => {
    switch(sentiment?.toLowerCase()) {
      case 'positive': return <Smile className="w-5 h-5 text-green-400" />;
      case 'negative': return <Frown className="w-5 h-5 text-red-400" />;
      default: return <Meh className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-xl flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-cyan-400" />
            AI Communication Hub
          </h3>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={analyzeSentiment}
              disabled={analyzing}
              className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <TrendingUp className="w-4 h-4" />
              Analyze Sentiment
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={generateSummary}
              className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold text-sm flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Summarize
            </motion.button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="mb-6">
          <h4 className="text-white font-bold mb-3 text-sm">Agent Communication Log</h4>
          <div className="bg-black/40 rounded-xl p-4 max-h-64 overflow-y-auto space-y-2">
            {messages.map(msg => (
              <div key={msg.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-semibold text-sm">{msg.from}</span>
                    <span className="text-white/40">→</span>
                    <span className="text-cyan-400 text-sm">{msg.to}</span>
                  </div>
                  <span className="text-white/40 text-xs">{msg.timestamp}</span>
                </div>
                <p className="text-white/80 text-sm">{msg.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Analysis */}
        {sentimentAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/30 rounded-xl"
          >
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              Sentiment & Morale Analysis
            </h4>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-black/20 rounded-lg">
                <p className="text-white/60 text-xs mb-2">Overall Sentiment</p>
                <div className="flex items-center gap-2">
                  {getSentimentIcon(sentimentAnalysis.overall_sentiment)}
                  <span className="text-white font-bold">{sentimentAnalysis.overall_sentiment}</span>
                </div>
              </div>

              <div className="p-3 bg-black/20 rounded-lg">
                <p className="text-white/60 text-xs mb-2">Team Morale</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        sentimentAnalysis.morale_score > 70 ? 'bg-green-400' :
                        sentimentAnalysis.morale_score > 40 ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}
                      style={{ width: `${sentimentAnalysis.morale_score * 100}%` }}
                    />
                  </div>
                  <span className="text-white font-bold">{Math.round(sentimentAnalysis.morale_score * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-white/60 text-xs mb-2">Individual Agent States</p>
              <div className="grid md:grid-cols-3 gap-3">
                {sentimentAnalysis.agent_sentiments.map((agent, idx) => (
                  <div key={idx} className="p-3 bg-black/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold text-sm">{agent.agent}</span>
                      {getSentimentIcon(agent.sentiment)}
                    </div>
                    <p className="text-white/70 text-xs mb-1">Confidence: {Math.round(agent.confidence * 100)}%</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      agent.stress_level === 'low' ? 'bg-green-500/20 text-green-400' :
                      agent.stress_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      Stress: {agent.stress_level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {sentimentAnalysis.conflict_indicators.length > 0 && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-3">
                <p className="text-red-400 font-semibold text-xs mb-2">⚠️ Conflict Indicators</p>
                {sentimentAnalysis.conflict_indicators.map((indicator, idx) => (
                  <p key={idx} className="text-white/80 text-xs mb-1">• {indicator}</p>
                ))}
              </div>
            )}

            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-cyan-400 font-semibold text-xs mb-1">Collaboration Quality</p>
              <p className="text-white text-sm">{sentimentAnalysis.collaboration_quality}</p>
            </div>
          </motion.div>
        )}

        {/* AI Summary */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/30 rounded-xl"
          >
            <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              AI Communication Summary
            </h4>

            <div className="mb-4 p-3 bg-black/20 rounded-lg">
              <p className="text-white/80 text-sm">{summary.summary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-green-400 font-semibold text-xs mb-2">Key Decisions</p>
                {summary.key_decisions.map((decision, idx) => (
                  <p key={idx} className="text-white/80 text-xs mb-1">✓ {decision}</p>
                ))}
              </div>

              <div>
                <p className="text-red-400 font-semibold text-xs mb-2">Conflicts</p>
                {summary.conflicts.map((conflict, idx) => (
                  <p key={idx} className="text-white/80 text-xs mb-1">⚠ {conflict}</p>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-purple-400 font-semibold text-xs mb-2">Action Items</p>
              <div className="space-y-2">
                {summary.action_items.map((item, idx) => (
                  <div key={idx} className="p-2 bg-black/20 rounded flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm">{item.task}</p>
                      <p className="text-purple-400 text-xs">Assigned: {item.assigned_to}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {summary.unresolved_issues.length > 0 && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <p className="text-orange-400 font-semibold text-xs mb-2">Unresolved Issues</p>
                {summary.unresolved_issues.map((issue, idx) => (
                  <p key={idx} className="text-white/80 text-xs mb-1">→ {issue}</p>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}