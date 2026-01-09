import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, Zap, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AgentKPIDashboard({ agentId, agentName = 'Agent' }) {
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    loadKPI();
  }, [agentId]);

  const loadKPI = async () => {
    try {
      const data = await base44.entities.AgentKPI.filter({ agent_id: agentId });
      if (data.length > 0) {
        setKpi(data[0]);
        generateAnalysis(data[0]);
        generateTrendData(data[0]);
      } else {
        // Initialize default KPI
        const defaultKpi = {
          agent_id: agentId,
          task_completion_rate: 75,
          collaboration_efficiency: 68,
          memory_recall_accuracy: 82,
          responsiveness: 85,
          decision_quality: 72,
          learning_velocity: 78,
          communication_score: 80,
          bottlenecks: [],
          last_updated: new Date().toISOString()
        };
        setKpi(defaultKpi);
        generateAnalysis(defaultKpi);
        generateTrendData(defaultKpi);
      }
    } catch (err) {
      console.error('Failed to load KPI:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async (kpiData) => {
    try {
      const prompt = `Analyze these agent performance metrics and identify bottlenecks and improvements:

Task Completion: ${kpiData.task_completion_rate}%
Collaboration: ${kpiData.collaboration_efficiency}%
Memory Recall: ${kpiData.memory_recall_accuracy}%
Responsiveness: ${kpiData.responsiveness}%
Decision Quality: ${kpiData.decision_quality}%
Learning: ${kpiData.learning_velocity}%
Communication: ${kpiData.communication_score}%

Provide:
1. Top 3 bottlenecks
2. Specific improvement suggestions
3. Strengths to leverage
4. Priority areas for development

Format as JSON:
{
  "bottlenecks": [{"area": "name", "severity": "high|medium|low", "suggestion": "improvement"}],
  "strengths": ["strength1"],
  "improvements": ["improvement1"],
  "priority": "area to focus on"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            bottlenecks: { type: 'array' },
            strengths: { type: 'array' },
            improvements: { type: 'array' },
            priority: { type: 'string' }
          }
        }
      });

      setAnalysis(response);
    } catch (err) {
      console.error('Failed to generate analysis:', err);
    }
  };

  const generateTrendData = (kpiData) => {
    const metrics = [
      { name: 'Task Completion', value: kpiData.task_completion_rate },
      { name: 'Collaboration', value: kpiData.collaboration_efficiency },
      { name: 'Memory Recall', value: kpiData.memory_recall_accuracy },
      { name: 'Responsiveness', value: kpiData.responsiveness },
      { name: 'Decision Quality', value: kpiData.decision_quality },
      { name: 'Learning', value: kpiData.learning_velocity },
      { name: 'Communication', value: kpiData.communication_score }
    ];
    setTrendData(metrics);
  };

  if (loading) {
    return <div className="text-white/40">Loading KPI data...</div>;
  }

  if (!kpi) {
    return <div className="text-white/40">No KPI data available</div>;
  }

  const metrics = [
    { label: 'Task Completion', value: kpi.task_completion_rate, icon: '✓', color: 'from-green-500 to-emerald-500' },
    { label: 'Collaboration', value: kpi.collaboration_efficiency, icon: '🤝', color: 'from-blue-500 to-cyan-500' },
    { label: 'Memory Recall', value: kpi.memory_recall_accuracy, icon: '🧠', color: 'from-purple-500 to-pink-500' },
    { label: 'Responsiveness', value: kpi.responsiveness, icon: '⚡', color: 'from-yellow-500 to-orange-500' },
    { label: 'Decision Quality', value: kpi.decision_quality, icon: '🎯', color: 'from-red-500 to-pink-500' },
    { label: 'Learning Velocity', value: kpi.learning_velocity, icon: '📈', color: 'from-indigo-500 to-purple-500' }
  ];

  return (
    <div className="bg-black/40 border border-green-500/30 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-400" />
          Agent KPI Dashboard
        </h3>
        <span className="text-xs text-white/50">{agentName}</span>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map((metric) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${metric.color} opacity-20 rounded-lg p-3 border border-white/10`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{metric.icon}</span>
              <span className="text-xs text-white/70">{metric.value}%</span>
            </div>
            <p className="text-white/80 text-xs font-bold">{metric.label}</p>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
              <div
                className={`bg-gradient-to-r ${metric.color} h-1.5 rounded-full transition-all`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="h-64 bg-white/5 border border-white/10 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#fff' }} angle={-45} textAnchor="end" height={80} />
            <YAxis tick={{ fontSize: 10, fill: '#fff' }} domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #0ff' }} />
            <Bar dataKey="value" fill="#00f5ff" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Analysis */}
      {analysis && (
        <div className="space-y-4 border-t border-white/10 pt-4">
          <p className="text-white font-bold text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            AI-Driven Analysis
          </p>

          {/* Strengths */}
          {analysis.strengths?.length > 0 && (
            <div>
              <p className="text-green-400 text-xs font-bold mb-2">💪 Strengths:</p>
              <ul className="space-y-1">
                {analysis.strengths.map((strength, i) => (
                  <li key={i} className="text-white/70 text-xs">• {strength}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottlenecks */}
          {analysis.bottlenecks?.length > 0 && (
            <div>
              <p className="text-red-400 text-xs font-bold mb-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Bottlenecks:
              </p>
              <div className="space-y-2">
                {analysis.bottlenecks.map((bottleneck, i) => (
                  <div key={i} className="bg-white/5 border border-red-500/30 rounded p-2">
                    <p className="text-white/80 text-xs font-bold">{bottleneck.area}</p>
                    <p className="text-white/60 text-xs mt-1">{bottleneck.suggestion}</p>
                    <span className={`text-xs font-bold mt-1 block ${
                      bottleneck.severity === 'high' ? 'text-red-400' :
                      bottleneck.severity === 'medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      Severity: {bottleneck.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Focus */}
          {analysis.priority && (
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
              <p className="text-cyan-400 text-xs font-bold mb-1">🎯 Priority Focus Area:</p>
              <p className="text-white/80 text-xs">{analysis.priority}</p>
            </div>
          )}

          {/* Improvement Suggestions */}
          {analysis.improvements?.length > 0 && (
            <div>
              <p className="text-blue-400 text-xs font-bold mb-2">✨ Recommended Improvements:</p>
              <ul className="space-y-1">
                {analysis.improvements.map((improvement, i) => (
                  <li key={i} className="text-white/70 text-xs">• {improvement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Overall Score */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <p className="text-white/60 text-sm">Overall Performance</p>
          <span className="text-2xl font-bold text-cyan-400">
            {Math.round((kpi.task_completion_rate + kpi.collaboration_efficiency + kpi.memory_recall_accuracy + 
              kpi.responsiveness + kpi.decision_quality + kpi.learning_velocity + kpi.communication_score) / 7)}%
          </span>
        </div>
      </div>
    </div>
  );
}