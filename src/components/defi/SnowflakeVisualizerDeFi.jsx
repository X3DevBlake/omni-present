import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Database, Loader, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SnowflakeVisualizerDeFi() {
  const [portfolioHistory, setPortfolioHistory] = useState(null);
  const [yieldData, setYieldData] = useState(null);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));

    loadSnowflakeData();
  }, []);

  const loadSnowflakeData = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Query Snowflake DeFi data warehouse:
        
User: ${userEmail}

Retrieve:
1. Portfolio value history (daily, last 90 days)
2. Yield data by protocol (pie chart data)
3. Risk metrics over time (line chart)
4. Transaction volume (bar chart)
5. Liquidity pool performance`,
        response_json_schema: {
          type: 'object',
          properties: {
            portfolioHistory: { type: 'array' },
            yieldByProtocol: { type: 'array' },
            riskMetrics: { type: 'array' },
          },
        },
      });

      setPortfolioHistory(response.portfolioHistory);
      setYieldData(response.yieldByProtocol);
      setRiskMetrics(response.riskMetrics);
    } catch (error) {
      console.error('Error loading Snowflake data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Sync latest data from blockchain to Snowflake
      await base44.integrations.Core.InvokeLLM({
        prompt: `Sync latest DeFi data to Snowflake:
        
User: ${userEmail}

Update all tables with latest onchain data.`,
      });

      // Reload visualizations
      await loadSnowflakeData();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <p className="text-white font-bold">Snowflake DeFi Analytics</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3 py-2 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 flex items-center gap-1 text-sm"
        >
          {refreshing ? (
            <>
              <Loader className="w-3 h-3 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3" />
              Refresh Data
            </>
          )}
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-6 h-6 animate-spin text-cyan-400" />
        </div>
      ) : (
        <Tabs defaultValue="portfolio" className="space-y-4">
          <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start">
            <TabsTrigger value="portfolio" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Portfolio
            </TabsTrigger>
            <TabsTrigger value="yields" className="flex items-center gap-1">
              <PieChartIcon className="w-3 h-3" /> Yields
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" /> Risk
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Value Chart */}
          <TabsContent value="portfolio" className="space-y-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <p className="text-white font-bold mb-3 text-sm">Portfolio Value (90 Days)</p>
              {portfolioHistory && portfolioHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={portfolioHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis stroke="#ffffff40" />
                    <YAxis stroke="#ffffff40" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #0f3460' }}
                      cursor={{ stroke: '#06b6d4' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-white/40 text-sm text-center py-8">No data available</p>
              )}
            </motion.div>
          </TabsContent>

          {/* Yield Distribution */}
          <TabsContent value="yields" className="space-y-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <p className="text-white font-bold mb-3 text-sm">Yield by Protocol</p>
              {yieldData && yieldData.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={yieldData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {yieldData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-2">
                    {yieldData.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white/10 rounded p-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <p className="text-white text-xs">{item.name}</p>
                          </div>
                          <p className="text-cyan-300 text-xs font-bold">${item.value}</p>
                        </div>
                        <p className="text-white/40 text-xs mt-1">{item.apy}% APY</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-white/40 text-sm text-center py-8">No yield data available</p>
              )}
            </motion.div>
          </TabsContent>

          {/* Risk Metrics */}
          <TabsContent value="risk" className="space-y-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <p className="text-white font-bold mb-3 text-sm">Risk Metrics Over Time</p>
              {riskMetrics && riskMetrics.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={riskMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis stroke="#ffffff40" />
                    <YAxis stroke="#ffffff40" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #0f3460' }}
                    />
                    <Legend />
                    <Bar dataKey="liquidationRisk" stackId="a" fill="#ec4899" />
                    <Bar dataKey="contractRisk" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="marketRisk" stackId="a" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-white/40 text-sm text-center py-8">No risk data available</p>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}