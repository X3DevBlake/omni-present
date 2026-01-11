import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp, BarChart3, Users, Target, Award, Zap, Loader
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EnhancedComparativeAnalyticsDashboard({ enhancedAnalytics }) {
  const [benchmarks, setBenchmarks] = useState(null);
  const [peerComparison, setPeerComparison] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));

    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Load comparative data
      const data = await base44.integrations.Core.InvokeLLM({
        prompt: `Load comparative analytics data:
        
VideoType: ${enhancedAnalytics.videoId}
Industry: financial
User: ${userEmail}

Load:
1. Industry benchmarks
2. Peer comparison data
3. Trend analysis
4. Performance rankings`,
      });

      setBenchmarks(data.benchmarks);
      setPeerComparison(data.peerComparison);
      setTrends(data.trends);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="benchmarks" className="space-y-4">
        <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start">
          <TabsTrigger value="benchmarks">Industry Benchmarks</TabsTrigger>
          <TabsTrigger value="peers">Peer Comparison</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="benchmarks" className="space-y-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-3"
          >
            {/* Engagement Benchmark */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-white/60 text-xs mb-2">Your Engagement</p>
              <p className="text-cyan-300 text-2xl font-bold">
                {enhancedAnalytics.engagement?.score || 0}
              </p>
              <p className="text-white/40 text-xs mt-1">
                vs {benchmarks?.engagementPercentile || 'N/A'} benchmark
              </p>
            </div>

            {/* Sentiment Benchmark */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-white/60 text-xs mb-2">Overall Sentiment</p>
              <p className="text-purple-300 text-lg font-bold capitalize">
                {enhancedAnalytics.sentiment?.overall || 'Neutral'}
              </p>
              <p className="text-white/40 text-xs mt-1">
                {benchmarks?.sentimentBenchmark}
              </p>
            </div>

            {/* Duration Rating */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-white/60 text-xs mb-2">Duration Rating</p>
              <p className="text-green-300 text-lg font-bold">
                {benchmarks?.durationRating}
              </p>
            </div>

            {/* Competitive Position */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-white/60 text-xs mb-2">Your Position</p>
              <p className="text-yellow-300 font-bold text-sm">
                {benchmarks?.competitivePosition}
              </p>
            </div>
          </motion.div>

          {/* Excellence Areas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-500/10 border border-green-400/30 rounded-lg p-3"
          >
            <p className="text-green-300 font-bold text-sm mb-2">Areas of Excellence</p>
            <div className="space-y-1">
              {benchmarks?.excellenceAreas?.slice(0, 3).map((area, idx) => (
                <p key={idx} className="text-white/60 text-xs">✓ {area}</p>
              ))}
            </div>
          </motion.div>

          {/* Improvement Areas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-400/30 rounded-lg p-3"
          >
            <p className="text-red-300 font-bold text-sm mb-2">Areas for Improvement</p>
            <div className="space-y-1">
              {benchmarks?.improvementAreas?.slice(0, 3).map((area, idx) => (
                <p key={idx} className="text-white/60 text-xs">• {area}</p>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="peers" className="space-y-3">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-white font-bold text-sm mb-3">Your Ranking</p>
            <div className="text-center">
              <p className="text-cyan-400 text-3xl font-bold">
                #{peerComparison?.ranking || 'N/A'}
              </p>
              <p className="text-white/60 text-xs mt-1">
                {peerComparison?.percentile}th percentile
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2"
          >
            <p className="text-white font-bold text-sm">You Lead In</p>
            {peerComparison?.leadingAreas?.slice(0, 3).map((area, idx) => (
              <p key={idx} className="text-white/60 text-xs">🏆 {area}</p>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2"
          >
            <p className="text-white font-bold text-sm">Learn From Top Peers</p>
            {peerComparison?.topPeers?.slice(0, 3).map((peer, idx) => (
              <p key={idx} className="text-white/60 text-xs">👤 {peer}</p>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3"
            >
              <p className="text-white/60 text-xs mb-2">Engagement Trend</p>
              <p className="text-cyan-300 font-bold">{trends?.engagementTrend}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3"
            >
              <p className="text-white/60 text-xs mb-2">Sentiment Trend</p>
              <p className="text-purple-300 font-bold">{trends?.sentimentTrend}</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 border border-white/10 rounded-lg p-3"
          >
            <p className="text-white font-bold text-sm mb-2">Identified Patterns</p>
            <div className="space-y-1">
              {trends?.patterns?.slice(0, 3).map((pattern, idx) => (
                <p key={idx} className="text-white/60 text-xs">📈 {pattern}</p>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-3">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
            <p className="text-white font-bold text-sm">Overall Performance</p>
            {loading ? (
              <div className="flex justify-center">
                <Loader className="w-5 h-5 animate-spin text-cyan-400" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <p className="text-white/60">Success Probability</p>
                  <p className="text-cyan-300 font-bold">{enhancedAnalytics.predictions?.outcome?.successProbability}%</p>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full"
                    style={{ width: `${enhancedAnalytics.predictions?.outcome?.successProbability}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}