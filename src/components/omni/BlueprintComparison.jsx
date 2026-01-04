import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, TrendingUp, TrendingDown, Minus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import GlassCard from './GlassCard';

export default function BlueprintComparison({ currentBlueprint, onClose }) {
  const [selectedVersion, setSelectedVersion] = useState(null);

  const { data: versions } = useQuery({
    queryKey: ['all-blueprints'],
    queryFn: () => base44.entities.Blueprint.list('-created_date'),
  });

  const compareBlueprints = (v1, v2) => {
    if (!v1 || !v2) return null;

    const differences = [];
    const config1 = v1.configuration || {};
    const config2 = v2.configuration || {};

    // Compare component counts
    const components1 = config1.components?.length || 0;
    const components2 = config2.components?.length || 0;
    if (components1 !== components2) {
      differences.push({
        category: 'Architecture',
        change: `Components: ${components1} → ${components2}`,
        impact: components2 > components1 ? 'positive' : 'negative',
        delta: ((components2 - components1) / components1 * 100).toFixed(0)
      });
    }

    // Compare constraints
    if (v1.constraints?.budget !== v2.constraints?.budget) {
      differences.push({
        category: 'Budget',
        change: `${v1.constraints?.budget || 'N/A'} → ${v2.constraints?.budget || 'N/A'}`,
        impact: 'neutral',
        delta: null
      });
    }

    // Performance implications
    const perfScore1 = components1 * 100 + (v1.constraints?.scale === 'large' ? 50 : 0);
    const perfScore2 = components2 * 100 + (v2.constraints?.scale === 'large' ? 50 : 0);
    const perfDelta = ((perfScore2 - perfScore1) / perfScore1 * 100).toFixed(1);

    differences.push({
      category: 'Est. Performance',
      change: `Estimated ${perfDelta}% ${perfScore2 > perfScore1 ? 'improvement' : 'reduction'}`,
      impact: perfScore2 > perfScore1 ? 'positive' : 'negative',
      delta: perfDelta
    });

    return differences;
  };

  const comparison = selectedVersion ? compareBlueprints(currentBlueprint, selectedVersion) : null;

  const getImpactIcon = (impact) => {
    if (impact === 'positive') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (impact === 'negative') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getImpactColor = (impact) => {
    if (impact === 'positive') return 'bg-green-500/10 border-green-500/30 text-green-400';
    if (impact === 'negative') return 'bg-red-500/10 border-red-500/30 text-red-400';
    return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <GitCompare className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Blueprint Comparison</h2>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Current Blueprint */}
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <div className="text-cyan-400 text-xs font-semibold mb-2">Current Blueprint</div>
              <div className="text-white font-medium">{currentBlueprint?.name || 'Active'}</div>
              <div className="text-white/50 text-xs mt-1">
                Version {currentBlueprint?.version || 1}
              </div>
            </div>

            {/* Compare With */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <div className="text-purple-400 text-xs font-semibold mb-2">Compare With</div>
              <select
                value={selectedVersion?.id || ''}
                onChange={(e) => {
                  const version = versions?.find(v => v.id === e.target.value);
                  setSelectedVersion(version);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="">Select version...</option>
                {versions?.filter(v => v.id !== currentBlueprint?.id).map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.name} (v{version.version || 1})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {comparison && (
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-lg mb-4">Key Differences</h3>
              
              {comparison.map((diff, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-xl border ${getImpactColor(diff.impact)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getImpactIcon(diff.impact)}
                        <span className="text-white font-medium text-sm">{diff.category}</span>
                      </div>
                      <div className="text-white/70 text-xs">{diff.change}</div>
                    </div>
                    {diff.delta && (
                      <div className={`text-2xl font-bold ${
                        diff.impact === 'positive' ? 'text-green-400' : 
                        diff.impact === 'negative' ? 'text-red-400' : 
                        'text-gray-400'
                      }`}>
                        {diff.delta > 0 ? '+' : ''}{diff.delta}%
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Performance Summary */}
              <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/20">
                <h4 className="text-white font-semibold mb-3">Performance Implications</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-white/50 mb-1">Throughput</div>
                    <div className="text-cyan-400 font-medium">
                      {comparison.some(d => d.impact === 'positive') ? '↑ Expected to improve' : '→ Similar'}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/50 mb-1">Reliability</div>
                    <div className="text-purple-400 font-medium">
                      {comparison.length > 2 ? '↑ More resilient' : '→ Comparable'}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/50 mb-1">Cost Efficiency</div>
                    <div className="text-pink-400 font-medium">
                      {selectedVersion?.constraints?.budget !== currentBlueprint?.constraints?.budget ? 
                        'Different budget tier' : '→ Same tier'}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/50 mb-1">Scalability</div>
                    <div className="text-blue-400 font-medium">
                      {comparison.some(d => d.category === 'Architecture') ? '↑ Better scale' : '→ Similar'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!selectedVersion && (
            <div className="text-center py-12 text-white/40">
              Select a blueprint version to compare
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}