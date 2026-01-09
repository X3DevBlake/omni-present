import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, TrendingUp, Zap, BookOpen, Award, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { usePersonalization } from '../personalization/PersonalizationContext';

export default function AICoachingSystem() {
  const { behaviorData, preferences } = usePersonalization();
  const [coaching, setCoaching] = useState([]);
  const [expandedTip, setExpandedTip] = useState(null);
  const [dismissedTips, setDismissedTips] = useState([]);

  useEffect(() => {
    generateCoachingTips();
  }, [behaviorData]);

  const generateCoachingTips = () => {
    const tips = [];
    const visitCounts = behaviorData.visitCounts || {};

    // Trading optimization tips
    if (visitCounts['OmniHub'] && visitCounts['OmniHub'] > 5) {
      tips.push({
        id: 'trading_advanced',
        icon: TrendingUp,
        title: 'Advanced Trading Technique',
        description: 'Multi-leg options strategies',
        content: 'You\'re an active trader. Consider implementing calendar spreads and volatility-based strategies for enhanced returns while managing risk.',
        hub: 'omni',
        priority: 'high'
      });
    }

    // Simulation optimization
    if (visitCounts['AdvancedSimulation'] && visitCounts['AdvancedSimulation'] > 3) {
      tips.push({
        id: 'sim_optimization',
        icon: Zap,
        title: 'Simulation Optimization Guide',
        description: 'Improve learning velocity',
        content: 'Your agents show strong learning patterns. Increase complexity gradually and implement comparative scenario testing to accelerate discovery.',
        hub: 'simulation',
        priority: 'high'
      });
    }

    // Research-driven strategies
    if (visitCounts['LabsHome'] && visitCounts['LabsHome'] > 2) {
      tips.push({
        id: 'research_leverage',
        icon: BookOpen,
        title: 'Leverage Research Findings',
        description: 'Connect labs discoveries to trading',
        content: 'Your research agents have discovered valuable patterns. Create a feedback loop to automatically adjust trading strategies based on lab findings.',
        hub: 'labs',
        priority: 'medium'
      });
    }

    // Device management
    if (visitCounts['DeviceHome'] && visitCounts['DeviceHome'] > 2) {
      tips.push({
        id: 'device_analytics',
        icon: Award,
        title: 'Device Performance Analytics',
        description: 'Maximize device efficiency',
        content: 'Monitor your device telemetry more closely. Implement predictive maintenance alerts to prevent downtime and extend hardware lifespan.',
        hub: 'devices',
        priority: 'medium'
      });
    }

    // General excellence
    if (Object.values(visitCounts).reduce((a, b) => a + b, 0) > 20) {
      tips.push({
        id: 'ecosystem_mastery',
        icon: Lightbulb,
        title: 'Ecosystem Mastery Path',
        description: 'Unlock advanced features',
        content: 'You\'re becoming proficient across the ecosystem. Explore cross-hub automation and agent collaboration to achieve advanced objectives.',
        hub: 'analytics',
        priority: 'high'
      });
    }

    setCoaching(tips.filter(tip => !dismissedTips.includes(tip.id)));
  };

  const dismissTip = (tipId) => {
    setDismissedTips(prev => [...prev, tipId]);
    setCoaching(prev => prev.filter(tip => tip.id !== tipId));
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-yellow-400" />
          <div>
            <h3 className="text-white font-bold">AI Coaching System</h3>
            <p className="text-white/60 text-sm">Personalized guidance from your ecosystem coach</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          coaching.length > 0 
            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            : 'bg-white/5 text-white/60 border border-white/10'
        }`}>
          {coaching.length} tips
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {coaching.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-white/40 text-sm"
            >
              No new coaching tips. Keep exploring the ecosystem!
            </motion.div>
          ) : (
            coaching.map((tip, idx) => {
              const Icon = tip.icon;
              const isExpanded = expandedTip === tip.id;

              return (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-gradient-to-r ${
                    tip.priority === 'high'
                      ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                      : 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20'
                  } border rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg`}
                  onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-yellow-500/20 rounded-lg flex-shrink-0">
                        <Icon className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm">{tip.title}</h4>
                        <p className="text-white/60 text-xs mt-1">{tip.description}</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0"
                    >
                      <ChevronRight className="w-5 h-5 text-yellow-400" />
                    </motion.div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-white/10"
                      >
                        <p className="text-white/70 text-sm mb-3">{tip.content}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissTip(tip.id);
                            }}
                            className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 text-xs font-semibold transition-colors"
                          >
                            Got it
                          </button>
                          <Link to={createPageUrl('AgentCustomization')}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="w-full px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded-lg text-yellow-400 text-xs font-semibold transition-colors"
                            >
                              Learn More
                            </button>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}