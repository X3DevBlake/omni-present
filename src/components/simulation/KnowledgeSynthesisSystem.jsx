import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, GitBranch, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function KnowledgeSynthesisSystem() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const data = await base44.entities.KnowledgeInsight.list('-confidence_score', 50);
      setInsights(data);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const synthesizeInsight = async () => {
    try {
      const prompt = `Based on the collective knowledge of multiple agents, identify and synthesize higher-level insights.

Analyze patterns across:
1. Discovery findings
2. Technique applications
3. User interactions
4. Environmental adaptations

Generate a synthesis insight that combines 2+ pieces of knowledge into a novel understanding.

Format as JSON:
{
  "title": "High-level insight title",
  "description": "What this insight reveals",
  "insight_type": "pattern|hypothesis|prediction|synthesis|principle",
  "reasoning": "How multiple knowledge sources combine",
  "applications": ["use1", "use2"],
  "confidence": 0-100
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            insight_type: { type: 'string' },
            reasoning: { type: 'string' },
            applications: { type: 'array' },
            confidence: { type: 'number' }
          }
        }
      });

      const newInsight = {
        title: response.title,
        description: response.description,
        insight_type: response.insight_type,
        contributing_agents: [],
        source_knowledge: [],
        confidence_score: response.confidence,
        validation_status: 'proposed',
        validating_agents: [],
        applications: response.applications,
        impact_level: response.confidence >= 80 ? 'high' : 'medium'
      };

      await base44.entities.KnowledgeInsight.create(newInsight);
      setInsights(prev => [newInsight, ...prev]);
      toast.success('Insight synthesized!');
    } catch (err) {
      toast.error('Failed to synthesize insight');
    }
  };

  const validateInsight = async (insightId) => {
    try {
      const insight = insights.find(i => i.id === insightId);
      if (insight) {
        const newValidators = (insight.validating_agents || []).length < 3
          ? [...(insight.validating_agents || []), `validator-${Date.now()}`]
          : insight.validating_agents;

        const newStatus = newValidators.length >= 3 ? 'validated' : 'validating';

        await base44.entities.KnowledgeInsight.update(insightId, {
          validating_agents: newValidators,
          validation_status: newStatus
        });

        setInsights(prev => prev.map(i =>
          i.id === insightId
            ? { ...i, validating_agents: newValidators, validation_status: newStatus }
            : i
        ));

        toast.success(newStatus === 'validated' ? 'Insight validated!' : 'Vote added!');
      }
    } catch (err) {
      toast.error('Failed to validate insight');
    }
  };

  if (loading) {
    return <div className="text-white/40">Loading insights...</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'validated':
        return 'bg-green-500/20 border-green-500/40 text-green-300';
      case 'validating':
        return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
      case 'proposed':
        return 'bg-blue-500/20 border-blue-500/40 text-blue-300';
      case 'rejected':
        return 'bg-red-500/20 border-red-500/40 text-red-300';
      default:
        return 'bg-white/10 border-white/20 text-white/60';
    }
  };

  return (
    <div className="bg-black/40 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-400" />
          Knowledge Synthesis
        </h3>
        <motion.button
          onClick={synthesizeInsight}
          whileHover={{ scale: 1.05 }}
          className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded text-xs font-medium flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Synthesize
        </motion.button>
      </div>

      {/* Insights List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {insights.length === 0 ? (
          <div className="text-center py-4 text-white/40 text-xs">No insights yet</div>
        ) : (
          insights.map(insight => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-bold text-sm">{insight.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getStatusColor(insight.validation_status)}`}>
                      {insight.validation_status}
                    </span>
                  </div>
                  <p className="text-white/70 text-xs mb-2">{insight.description}</p>
                </div>
                <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-white/60">Confidence</p>
                  <div className="w-full bg-white/10 rounded h-1 mt-1">
                    <div
                      className="bg-cyan-500 h-1 rounded transition-all"
                      style={{ width: `${insight.confidence_score}%` }}
                    />
                  </div>
                  <p className="text-cyan-400 font-bold mt-1">{insight.confidence_score}%</p>
                </div>
                <div>
                  <p className="text-white/60">Validators</p>
                  <p className="text-indigo-400 font-bold text-lg mt-1">
                    {(insight.validating_agents || []).length}
                  </p>
                </div>
              </div>

              {insight.applications?.length > 0 && (
                <div>
                  <p className="text-white/60 text-xs mb-1">Applications:</p>
                  <div className="flex gap-1 flex-wrap">
                    {insight.applications.map((app, i) => (
                      <span key={i} className="text-xs bg-white/10 px-2 py-0.5 rounded text-white/70">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <motion.button
                onClick={() => validateInsight(insight.id)}
                whileHover={{ scale: 1.05 }}
                className={`w-full py-2 text-xs rounded font-medium transition-all ${
                  insight.validation_status === 'validated'
                    ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                    : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30'
                }`}
              >
                {insight.validation_status === 'validated' ? '✓ Validated' : 'Validate Insight'}
              </motion.button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}