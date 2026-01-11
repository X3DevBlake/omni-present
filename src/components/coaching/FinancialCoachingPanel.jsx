import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Target, TrendingUp, Zap, BookOpen, Heart } from 'lucide-react';

export default function FinancialCoachingPanel() {
  const [activeTab, setActiveTab] = useState('today');
  const [dismissedNudges, setDismissedNudges] = useState([]);

  const coachingData = {
    objectives: [
      'Build 3-month emergency fund',
      'Reduce discretionary spending by 15%',
      'Increase investment knowledge',
      'Stay consistent with savings plan',
    ],
    nudges: [
      {
        id: 1,
        type: 'spending-alert',
        message: 'You're on track with your dining budget this week! 2 more meals within your $50 limit.',
        icon: '💰',
        priority: 'medium',
        cta: 'View Budget',
        timing: 'Now',
      },
      {
        id: 2,
        type: 'savings-reminder',
        message: 'Your weekly auto-deposit is about to hit! You'll reach your 3-month goal in 8 weeks.',
        icon: '📈',
        priority: 'high',
        cta: 'Celebrate',
        timing: 'Today',
      },
      {
        id: 3,
        type: 'learning',
        message: '5 min read: "Understanding Tax-Loss Harvesting" - A strategy that matches your portfolio type.',
        icon: '📚',
        priority: 'low',
        cta: 'Read Now',
        timing: 'This week',
      },
      {
        id: 4,
        type: 'opportunity',
        message: 'Market dip detected: VTI is down 3%. Good time to rebalance if interested.',
        icon: '⚡',
        priority: 'high',
        cta: 'Learn More',
        timing: 'Today',
      },
    ],
    progress: {
      savingsGoal: { target: 15000, current: 12300, percentComplete: 82 },
      spendingControl: { target: 50, current: 45, percentComplete: 90 },
      investmentKnowledge: { target: 10, current: 6, percentComplete: 60 },
      emotionalSpending: { improvementRate: 35, trend: 'improving' },
    },
    motivationalMessages: [
      {
        icon: '🎯',
        title: 'You're Crushing It!',
        message: 'Your savings rate improved 12% this month. At this pace, you'll reach your emergency fund goal 4 weeks early!',
      },
      {
        icon: '💡',
        title: 'Smart Decision',
        message: 'Your decision to skip the restaurant last night? That saved $65 toward your goal. Every decision counts!',
      },
    ],
    weeklyReview: {
      savings: '$1,450 saved',
      spending: '$2,340 spent (within budget)',
      investments: '+$1,280 growth',
      behaviors: ['Stuck to budget', 'Increased savings', 'Researched investment options'],
      nextWeek: 'Focus on trying the "no-spend weekend" challenge',
    },
  };

  const handleDismissNudge = (nudgeId) => {
    setDismissedNudges([...dismissedNudges, nudgeId]);
  };

  const visibleNudges = coachingData.nudges.filter(n => !dismissedNudges.includes(n.id));

  return (
    <div className="space-y-6">
      {/* Coach Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-lg p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Your Financial Coach</h3>
            <p className="text-white/60">Personalized guidance to reach your financial goals</p>
          </div>
          <div className="text-4xl">🎓</div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {['today', 'progress', 'weekly'].map(tab => (
          <motion.button
            key={tab}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg border transition-all capitalize ${
              activeTab === tab
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
            }`}
          >
            {tab === 'today' && '📌 Today'}
            {tab === 'progress' && '📊 Progress'}
            {tab === 'weekly' && '📋 Weekly Review'}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'today' && (
          <motion.div
            key="today"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Motivational */}
            {coachingData.motivationalMessages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-lg p-4"
              >
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">{msg.icon}</span>
                  <div>
                    <p className="text-white font-bold">{msg.title}</p>
                    <p className="text-white/80 text-sm mt-1">{msg.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Nudges */}
            <div>
              <h4 className="text-white font-bold mb-3">Your Daily Nudges</h4>
              <div className="space-y-2">
                {visibleNudges.map((nudge, idx) => (
                  <motion.div
                    key={nudge.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/30 transition-all ${
                      nudge.priority === 'high' ? 'border-yellow-400/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 flex-1">
                        <span className="text-2xl flex-shrink-0">{nudge.icon}</span>
                        <div className="flex-1">
                          <p className="text-white text-sm">{nudge.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              nudge.priority === 'high'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : nudge.priority === 'medium'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-white/10 text-white/60'
                            }`}>
                              {nudge.priority}
                            </span>
                            <span className="text-white/50 text-xs">{nudge.timing}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300 text-xs hover:bg-cyan-500/30 transition-all"
                        >
                          {nudge.cta}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleDismissNudge(nudge.id)}
                          className="px-2 py-1 text-white/50 hover:text-white/70 transition-all"
                        >
                          ✕
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <h4 className="text-white font-bold">Coaching Objectives</h4>
            {Object.entries(coachingData.progress).map(([key, value]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-semibold capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  {typeof value === 'object' && value.percentComplete ? (
                    <p className="text-cyan-400 font-bold">{value.percentComplete}%</p>
                  ) : null}
                </div>
                {typeof value === 'object' && value.percentComplete ? (
                  <>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value.percentComplete}%` }}
                        transition={{ duration: 1.5 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                      />
                    </div>
                    <p className="text-white/60 text-xs">
                      ${value.current?.toLocaleString()} / ${value.target?.toLocaleString()}
                    </p>
                  </>
                ) : typeof value === 'object' ? (
                  <p className="text-white/70 text-sm">
                    {value.trend}: {value.improvementRate}% better
                  </p>
                ) : null}
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'weekly' && (
          <motion.div
            key="weekly"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
              <h4 className="text-white font-bold text-lg">Weekly Summary</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: 'Saved', value: coachingData.weeklyReview.savings, color: 'green' },
                  { label: 'Spent', value: coachingData.weeklyReview.spending, color: 'yellow' },
                  { label: 'Growth', value: coachingData.weeklyReview.investments, color: 'blue' },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/5 rounded-lg p-3"
                  >
                    <p className="text-white/60 text-xs mb-1">{stat.label}</p>
                    <p className={`text-lg font-bold ${
                      stat.color === 'green' ? 'text-green-400' : stat.color === 'blue' ? 'text-blue-400' : 'text-yellow-400'
                    }`}>
                      {stat.value}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-white/80 font-semibold mb-2">Key Wins This Week</p>
                <ul className="space-y-1">
                  {coachingData.weeklyReview.behaviors.map((behavior, idx) => (
                    <li key={idx} className="text-white/70 text-sm flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      {behavior}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-3">
                <p className="text-cyan-300 text-sm">
                  <span className="font-bold">Next Week Challenge:</span> {coachingData.weeklyReview.nextWeek}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}