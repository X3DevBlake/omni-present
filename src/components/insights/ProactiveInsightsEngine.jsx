import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle, Target, Lightbulb } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { base44 } from '@/api/base44Client';

export default function ProactiveInsightsEngine() {
  const [insights, setInsights] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [executiveSummary, setExecutiveSummary] = useState(null);

  const [trendData] = useState([
    { month: 'Jan', performance: 78, kb_usage: 245, efficiency: 82 },
    { month: 'Feb', performance: 82, kb_usage: 289, efficiency: 85 },
    { month: 'Mar', performance: 85, kb_usage: 312, efficiency: 87 },
    { month: 'Apr', performance: 88, kb_usage: 356, efficiency: 90 },
    { month: 'May', performance: 91, kb_usage: 398, efficiency: 92 },
    { month: 'Jun', performance: 94, kb_usage: 421, efficiency: 94 }
  ]);

  const [recommendations] = useState([
    {
      type: 'optimization',
      priority: 'high',
      title: 'Agent-Delta Load Optimization',
      description: 'Agent-Delta consistently operates at 85%+ capacity. Consider task redistribution.',
      action: 'Redistribute 20% of tasks to Agent-Alpha',
      impact: '+12% overall efficiency'
    },
    {
      type: 'training',
      priority: 'medium',
      title: 'Knowledge Gap Detected',
      description: 'Agents show weakness in advanced data visualization tasks.',
      action: 'Schedule visualization training module',
      impact: '+8% task success rate'
    },
    {
      type: 'workflow',
      priority: 'high',
      title: 'Automation Opportunity',
      description: 'Repetitive pattern detected in data preprocessing tasks.',
      action: 'Create automated workflow for preprocessing',
      impact: 'Save 4.5 hours/week'
    }
  ]);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    setAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze agent performance trends, knowledge base interactions, and simulation results. Generate actionable insights for optimization, training, and workflow improvements.`,
      response_json_schema: {
        type: 'object',
        properties: {
          key_insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                insight: { type: 'string' },
                confidence: { type: 'number' }
              }
            }
          },
          executive_summary: {
            type: 'object',
            properties: {
              overall_health: { type: 'string' },
              performance_trend: { type: 'string' },
              top_priority: { type: 'string' },
              achievements: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      }
    });

    setInsights(response.key_insights);
    setExecutiveSummary(response.executive_summary);
    setAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      {executiveSummary && (
        <div className="bg-gradient-to-br from-purple-500/20 to-cyan-500/10 border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Executive Summary
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-white/60 text-sm mb-2">Overall Health</p>
              <p className="text-2xl font-bold text-green-400 mb-4">{executiveSummary.overall_health}</p>
              <p className="text-white/60 text-sm mb-2">Performance Trend</p>
              <p className="text-cyan-400 font-semibold">{executiveSummary.performance_trend}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-2">Top Priority</p>
              <p className="text-yellow-400 font-semibold mb-4">{executiveSummary.top_priority}</p>
              <p className="text-white/60 text-sm mb-2">Recent Achievements</p>
              {executiveSummary.achievements.map((achievement, idx) => (
                <p key={idx} className="text-green-400 text-sm">✓ {achievement}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trend Analysis */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">6-Month Performance Trends</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="month" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="performance" stroke="#10b981" strokeWidth={3} />
            <Line type="monotone" dataKey="efficiency" stroke="#00f5ff" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI-Generated Insights */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">AI-Generated Insights</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={generateInsights}
            disabled={analyzing}
            className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {analyzing ? 'Analyzing...' : 'Refresh Insights'}
          </motion.button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-white/5 border border-white/10 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs font-semibold">
                  {insight.category}
                </span>
                <span className="text-white/60 text-xs">{(insight.confidence * 100).toFixed(0)}% confidence</span>
              </div>
              <p className="text-white text-sm">{insight.insight}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          Actionable Recommendations
        </h3>
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 border rounded-xl ${
                rec.priority === 'high' 
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-yellow-500/10 border-yellow-500/30'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {rec.type === 'optimization' && <TrendingUp className="w-5 h-5 text-green-400" />}
                  {rec.type === 'training' && <Lightbulb className="w-5 h-5 text-yellow-400" />}
                  {rec.type === 'workflow' && <Sparkles className="w-5 h-5 text-purple-400" />}
                  <h4 className="text-white font-bold">{rec.title}</h4>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  rec.priority === 'high'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {rec.priority}
                </span>
              </div>
              <p className="text-white/70 text-sm mb-2">{rec.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-cyan-400 text-sm font-semibold">→ {rec.action}</p>
                <p className="text-green-400 text-sm font-bold">{rec.impact}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="mt-3 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold text-sm w-full"
              >
                Implement Recommendation
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Knowledge Gap Analysis */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">Knowledge Gap Analysis</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { area: 'Advanced Analytics', gap: 35, priority: 'high' },
            { area: 'Natural Language Processing', gap: 22, priority: 'medium' },
            { area: 'Real-time Collaboration', gap: 18, priority: 'low' }
          ].map((gap, idx) => (
            <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-semibold text-sm">{gap.area}</p>
                <AlertTriangle className={`w-4 h-4 ${
                  gap.priority === 'high' ? 'text-red-400' :
                  gap.priority === 'medium' ? 'text-yellow-400' :
                  'text-green-400'
                }`} />
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-red-400 to-yellow-400"
                  style={{ width: `${gap.gap}%` }}
                />
              </div>
              <p className="text-white/60 text-xs">{gap.gap}% knowledge gap</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}