import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Video, DollarSign, Users, Zap, Download, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function UnifiedAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));

    loadUnifiedData();
  }, []);

  const loadUnifiedData = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Load unified analytics data:
        
User: ${userEmail}

Aggregate:
1. Video analytics (engagement, sentiment, KPIs)
2. DeFi data from Snowflake (yields, portfolio value, risks)
3. User engagement metrics
4. Cross-platform correlations
5. Key metrics and trends`,
      });

      setData(response);

      // Generate Gemini insights
      const geminiInsights = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate cross-platform insights using Gemini:
        
Data: ${JSON.stringify(response)}

Provide:
1. Key performance indicators
2. Trend analysis
3. Predictive insights
4. Optimization recommendations
5. Risk alerts
6. Opportunity identification`,
      });

      setInsights(geminiInsights);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    setExporting(true);
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Export comprehensive analytics report to Google Docs:
        
User: ${userEmail}
Data: ${JSON.stringify(data)}
Insights: ${JSON.stringify(insights)}

Create professional Google Docs report with:
1. Executive Summary
2. Video Analytics Section
3. DeFi Portfolio Analysis
4. User Engagement Report
5. Cross-Platform Insights
6. Predictive Analytics
7. Recommendations
8. Detailed Appendices`,
      });
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-lg p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <p className="text-white font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Unified Analytics Dashboard
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={exportReport}
            disabled={exporting || !data}
            className="px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 flex items-center gap-2 text-sm font-semibold"
          >
            {exporting ? (
              <>
                <Loader className="w-3 h-3 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Report
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> Overview
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-1">
            <Video className="w-3 h-3" /> Video
          </TabsTrigger>
          <TabsTrigger value="defi" className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> DeFi
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-1">
            <Users className="w-3 h-3" /> Engagement
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-1">
            <Zap className="w-3 h-3" /> Insights
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-6 h-6 animate-spin text-cyan-400" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <MetricCard 
                  title="Video Engagement"
                  value={data?.videoMetrics?.avgEngagement?.toFixed(1)}
                  icon={<Video className="w-4 h-4" />}
                  trend="+12%"
                />
                <MetricCard 
                  title="Portfolio Value"
                  value={`$${data?.defiMetrics?.portfolioValue?.toLocaleString()}`}
                  icon={<DollarSign className="w-4 h-4" />}
                  trend="+8.5%"
                />
                <MetricCard 
                  title="Active Users"
                  value={data?.engagement?.activeUsers}
                  icon={<Users className="w-4 h-4" />}
                  trend="+5%"
                />
                <MetricCard 
                  title="DeFi Yield"
                  value={`${data?.defiMetrics?.dailyYield?.toFixed(2)}%`}
                  icon={<TrendingUp className="w-4 h-4" />}
                  trend="APY"
                />
              </div>
            </TabsContent>

            {/* Video Tab */}
            <TabsContent value="video" className="space-y-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2"
              >
                <p className="text-white font-bold text-sm">Video Analytics</p>
                {data?.videoMetrics && (
                  <div className="space-y-1 text-xs text-white/60">
                    <p>Avg Engagement: {data.videoMetrics.avgEngagement?.toFixed(2)}</p>
                    <p>Success Probability: {data.videoMetrics.successProbability?.toFixed(1)}%</p>
                    <p>Total Videos: {data.videoMetrics.totalVideos}</p>
                    <p>Avg Duration: {data.videoMetrics.avgDuration} mins</p>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* DeFi Tab */}
            <TabsContent value="defi" className="space-y-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2"
              >
                <p className="text-white font-bold text-sm">DeFi Portfolio</p>
                {data?.defiMetrics && (
                  <div className="space-y-1 text-xs text-white/60">
                    <p>Portfolio Value: ${data.defiMetrics.portfolioValue?.toLocaleString()}</p>
                    <p>Daily Yield: {data.defiMetrics.dailyYield?.toFixed(4)}</p>
                    <p>Risk Level: {data.defiMetrics.riskLevel}</p>
                    <p>Top Pool: {data.defiMetrics.topPool}</p>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Engagement Tab */}
            <TabsContent value="engagement" className="space-y-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2"
              >
                <p className="text-white font-bold text-sm">User Engagement</p>
                {data?.engagement && (
                  <div className="space-y-1 text-xs text-white/60">
                    <p>Active Users: {data.engagement.activeUsers}</p>
                    <p>Avg Session Duration: {data.engagement.avgSessionDuration} mins</p>
                    <p>Retention Rate: {data.engagement.retentionRate}%</p>
                    <p>Feature Usage: {data.engagement.featureUsage}%</p>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4 space-y-2"
              >
                <p className="text-cyan-300 font-bold text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Gemini Cross-Platform Insights
                </p>
                <div className="space-y-2 text-xs">
                  {insights?.recommendations?.slice(0, 5).map((rec, idx) => (
                    <p key={idx} className="text-white/70">• {rec}</p>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

function MetricCard({ title, value, icon, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-lg p-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/60 text-xs mb-1">{title}</p>
          <p className="text-white font-bold text-lg">{value}</p>
          <p className="text-green-400 text-xs mt-1">{trend}</p>
        </div>
        <div className="text-cyan-400">{icon}</div>
      </div>
    </motion.div>
  );
}