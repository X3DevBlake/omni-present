import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Brain, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const LEARNING_DATA = [
  { week: 'Wk 1', reward: 0.62, successRate: 65, responseQuality: 71 },
  { week: 'Wk 2', reward: 0.68, successRate: 72, responseQuality: 76 },
  { week: 'Wk 3', reward: 0.75, successRate: 78, responseQuality: 82 },
  { week: 'Wk 4', reward: 0.84, successRate: 85, responseQuality: 89 },
  { week: 'Wk 5', reward: 0.91, successRate: 91, responseQuality: 94 },
];

const AGENTS_PERFORMANCE = [
  { name: 'Market-Monitor', reward: 0.94, interactions: 342, improvement: '+28%' },
  { name: 'Risk-Advisor', reward: 0.87, interactions: 289, improvement: '+22%' },
  { name: 'Device-Health', reward: 0.82, interactions: 156, improvement: '+18%' },
  { name: 'Strategy-Optimizer', reward: 0.79, interactions: 201, improvement: '+15%' },
];

export default function AgentLearningSystem() {
  const [selectedAgent, setSelectedAgent] = useState('Market-Monitor');
  const [feedback, setFeedback] = useState('');

  const agent = AGENTS_PERFORMANCE.find((a) => a.name === selectedAgent);

  const handleProvideFeedback = () => {
    setFeedback('');
    alert('Feedback recorded. Agent will adjust strategy accordingly.');
  };

  return (
    <div className="space-y-6">
      {/* Learning Curve */}
      <Card className="bg-black/40 border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" /> Agent Learning Progress
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={LEARNING_DATA}>
            <XAxis dataKey="week" stroke="#666" />
            <YAxis stroke="#666" domain={[0, 1]} />
            <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
            <Line type="monotone" dataKey="reward" stroke="#a855f7" strokeWidth={2} name="Reward Signal" />
            <Line type="monotone" dataKey="successRate" stroke="#00f5ff" strokeWidth={2} name="Success %" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Agent Selection & Performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-black/40 border-white/10 p-6">
          <h3 className="text-white font-bold mb-4">Agent Fleet Performance</h3>
          <div className="space-y-3">
            {AGENTS_PERFORMANCE.map((ag) => (
              <motion.div
                key={ag.name}
                onClick={() => setSelectedAgent(ag.name)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedAgent === ag.name ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-semibold text-sm">{ag.name}</p>
                  <Badge className="bg-green-500/30 text-green-300">{ag.improvement}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-xs">{ag.interactions} interactions</span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-white/10 rounded h-1.5">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 h-1.5 rounded"
                        style={{ width: `${ag.reward * 100}%` }}
                      />
                    </div>
                    <span className="text-white font-bold text-xs">{(ag.reward * 100).toFixed(0)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Real-time Feedback */}
        <Card className="bg-black/40 border-white/10 p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" /> Real-time Feedback
          </h3>
          <div className="space-y-3">
            <p className="text-white/60 text-sm">Agent: {selectedAgent}</p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Rate the agent's response and suggest improvements..."
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 text-sm h-24"
            />
            <div className="flex gap-2">
              {['Poor', 'Average', 'Good', 'Excellent'].map((rating) => (
                <Button
                  key={rating}
                  onClick={() => setFeedback(`Rating: ${rating}`)}
                  variant="outline"
                  size="sm"
                  className="text-xs flex-1"
                >
                  {rating}
                </Button>
              ))}
            </div>
            <Button onClick={handleProvideFeedback} className="w-full bg-purple-600 hover:bg-purple-700">
              Submit Feedback
            </Button>
          </div>
        </Card>
      </div>

      {/* Strategy Evolution */}
      <Card className="bg-black/40 border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" /> Strategy Evolution
        </h3>
        <div className="space-y-3">
          {[
            { stage: 'Iteration 1', change: 'Increased confidence threshold', metric: '+12% accuracy' },
            { stage: 'Iteration 2', change: 'Refined market anomaly detection', metric: '+8% recall' },
            { stage: 'Iteration 3', change: 'Optimized action suggestion timing', metric: '+15% relevance' },
            { stage: 'Iteration 4 (Current)', change: 'Enhanced context understanding', metric: '+22% satisfaction' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3 bg-white/5 rounded-lg flex items-center justify-between"
            >
              <div>
                <p className="text-white font-semibold text-sm">{item.stage}</p>
                <p className="text-white/60 text-xs">{item.change}</p>
              </div>
              <Badge className="bg-green-500/30 text-green-300">{item.metric}</Badge>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}