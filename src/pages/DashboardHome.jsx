import React, { useState, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain, Activity, TrendingUp, Zap, Globe, Cpu, Bot, Shield,
  Webhook, Database, BarChart3, ArrowUpRight, ArrowDownRight,
  Rocket, Eye, Sparkles, Layers, Clock, Users, Network, Radio,
  AlertTriangle, CheckCircle, Play, Boxes
} from 'lucide-react';
import { FourDCanvas, Tesseract, FourDParticleField } from '@/components/4d/FourDEngine';
import Earth4D from '@/components/4d/Earth4D';
import FourDGraph from '@/components/4d/FourDGraph';
import {
  globalNetworkNodes, globalConnections, mockAgentFleet,
  generateTimeSeriesData, generate4DDataset, generateActivityFeed
} from '@/data/openSourceData';
import { OmniPresentLogoSVG, TesseractIcon, EarthIcon } from '@/components/svg/OmniIcons';

// Mini line chart component
function MiniChart({ data, color = '#a855f7', height = 40 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  const gradId = `grad-${color.replace('#', '')}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
      <polygon fill={`url(#${gradId})`} points={`0,${height} ${points} 100,${height}`} />
    </svg>
  );
}

function StatCard({ label, value, change, icon: Icon, color, chartData, delay = 0 }) {
  const isPositive = change >= 0;
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <Card className="bg-black/40 border-white/[0.06] hover:border-white/15 transition-all group">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${color}`}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[11px] text-white/40 uppercase tracking-wider">{label}</span>
            </div>
            <div className={`flex items-center gap-0.5 text-[10px] ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(change)}%
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-2">{value}</div>
          {chartData && <MiniChart data={chartData} color={color.includes('purple') ? '#a855f7' : color.includes('cyan') ? '#22d3ee' : color.includes('pink') ? '#ec4899' : '#22c55e'} />}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ActivityEntry({ activity, index }) {
  const time = new Date(activity.timestamp);
  const ago = Math.floor((Date.now() - time.getTime()) / 60000);
  const agoStr = ago < 1 ? 'just now' : ago < 60 ? `${ago}m ago` : `${Math.floor(ago / 60)}h ago`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-start gap-3 py-2.5 border-b border-white/[0.03] last:border-0"
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${activity.color}15`, border: `1px solid ${activity.color}30` }}>
        <Activity className="w-3 h-3" style={{ color: activity.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-white/80">{activity.detail}</div>
        <div className="text-[10px] text-white/25 mt-0.5">
          {activity.metadata?.agent && <span className="text-purple-400/50">{activity.metadata.agent}</span>}
          {activity.metadata?.agent && ' · '}
          {activity.metadata?.duration}
        </div>
      </div>
      <span className="text-[10px] text-white/20 flex-shrink-0">{agoStr}</span>
    </motion.div>
  );
}

export default function DashboardHome() {
  const [user, setUser] = useState(null);
  const timeSeries = useMemo(() => generateTimeSeriesData(24, 15), []);
  const data4D = useMemo(() => generate4DDataset(80, 'market'), []);
  const activityFeed = useMemo(() => generateActivityFeed(15), []);

  React.useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => setUser(null));
  }, []);

  const cpuData = useMemo(() => timeSeries.slice(-20).map(d => d.cpu), [timeSeries]);
  const memData = useMemo(() => timeSeries.slice(-20).map(d => d.memory), [timeSeries]);
  const netData = useMemo(() => timeSeries.slice(-20).map(d => d.network), [timeSeries]);
  const reqData = useMemo(() => timeSeries.slice(-20).map(d => d.requests_per_sec), [timeSeries]);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-white/40 mt-1 text-sm">Your 4D intelligence ecosystem at a glance</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <OmniPresentLogoSVG size={40} animated />
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Online
            </Badge>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Active Agents" value={mockAgentFleet.filter(a => a.status === 'active').length} change={12} icon={Bot} color="from-purple-600 to-purple-800" chartData={cpuData} delay={0} />
          <StatCard label="Requests/s" value="347" change={8} icon={Zap} color="from-cyan-600 to-cyan-800" chartData={reqData} delay={0.05} />
          <StatCard label="Performance" value="97.3%" change={2.1} icon={TrendingUp} color="from-emerald-600 to-emerald-800" chartData={memData} delay={0.1} />
          <StatCard label="Network I/O" value="1.2 GB/s" change={-3} icon={Network} color="from-pink-600 to-pink-800" chartData={netData} delay={0.15} />
        </div>

        {/* Main Grid: Earth + 4D Graph + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Earth Globe */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-black/40 border-white/[0.06] overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <EarthIcon size={16} />
                    Global Network
                  </CardTitle>
                  <Badge variant="outline" className="border-cyan-500/20 text-cyan-400 text-[10px]">
                    {globalNetworkNodes.length} nodes
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <div className="h-72 canvas-4d">
                  <Suspense fallback={<div className="h-full bg-black/40 animate-pulse rounded-lg" />}>
                    <FourDCanvas cameraPosition={[0, 0, 4]} showStars>
                      <Earth4D markers={globalNetworkNodes} connections={globalConnections} radius={1.2} rotateSpeed={0.1} />
                    </FourDCanvas>
                  </Suspense>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    { label: 'Americas', count: 3, color: 'text-purple-400' },
                    { label: 'EMEA', count: 4, color: 'text-cyan-400' },
                    { label: 'APAC', count: 5, color: 'text-pink-400' },
                  ].map(region => (
                    <div key={region.label} className="text-center">
                      <div className={`text-lg font-bold ${region.color}`}>{region.count}</div>
                      <div className="text-[10px] text-white/30">{region.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 4D Data Visualization */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-black/40 border-white/[0.06] overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <TesseractIcon size={16} />
                    4D Market Analysis
                  </CardTitle>
                  <Badge variant="outline" className="border-purple-500/20 text-purple-400 text-[10px]">
                    {data4D.length} points
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <div className="h-72 canvas-4d">
                  <Suspense fallback={<div className="h-full bg-black/40 animate-pulse rounded-lg" />}>
                    <FourDCanvas cameraPosition={[0, 0, 5]}>
                      <FourDGraph data={data4D} showAxes showConnections rotateSpeed={0.15} />
                    </FourDCanvas>
                  </Suspense>
                </div>
                <div className="flex items-center justify-between mt-3 px-1">
                  <div className="flex gap-3">
                    {[
                      { label: 'Low', color: 'bg-emerald-400' },
                      { label: 'Mid', color: 'bg-amber-400' },
                      { label: 'High', color: 'bg-red-400' },
                    ].map(cat => (
                      <div key={cat.label} className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                        <span className="text-[10px] text-white/40">{cat.label}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-white/20">W-axis rotating</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Feed */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-black/40 border-white/[0.06]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Live Activity
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-white/30">Real-time</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 px-4 pb-2">
                <ScrollArea className="h-[340px]">
                  {activityFeed.map((activity, i) => (
                    <ActivityEntry key={activity.id} activity={activity} index={i} />
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Agent Fleet + Tesseract + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Fleet */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
            <Card className="bg-black/40 border-white/[0.06]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-400" />
                    Agent Fleet
                  </CardTitle>
                  <Link to={createPageUrl('AgentCollaborationHub')}>
                    <Button size="sm" variant="ghost" className="text-xs text-white/40 hover:text-white h-7">
                      View All <ArrowUpRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockAgentFleet.map((agent, i) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-purple-500/20 transition-all"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        agent.status === 'active' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                        agent.status === 'training' ? 'bg-amber-500/10 border border-amber-500/20' :
                        'bg-gray-500/10 border border-gray-500/20'
                      }`}>
                        <Bot className={`w-4 h-4 ${
                          agent.status === 'active' ? 'text-emerald-400' :
                          agent.status === 'training' ? 'text-amber-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{agent.name}</div>
                        <div className="text-[10px] text-white/30 flex items-center gap-2">
                          <span className="capitalize">{agent.type}</span>
                          <span>·</span>
                          <span>IQ {agent.intelligence}</span>
                          <span>·</span>
                          <span>{agent.tasks.toLocaleString()} tasks</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">{agent.performance}%</div>
                        <div className={`text-[10px] capitalize ${
                          agent.status === 'active' ? 'text-emerald-400' :
                          agent.status === 'training' ? 'text-amber-400' : 'text-gray-400'
                        }`}>{agent.status}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tesseract + Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="space-y-6">
            <Card className="bg-black/40 border-white/[0.06] overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-purple-400" />
                  4D Tesseract
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="h-48 canvas-4d">
                  <Suspense fallback={<div className="h-full bg-black/40 animate-pulse rounded-lg" />}>
                    <FourDCanvas cameraPosition={[0, 0, 3.5]} showStars={false}>
                      <Tesseract size={0.8} color="#a855f7" wireColor="#22d3ee" speed={0.4} />
                      <FourDParticleField count={200} radius={2} speed={0.15} />
                    </FourDCanvas>
                  </Suspense>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: 'AI Labs', icon: Brain, path: 'AILab', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
                  { label: 'Webhooks', icon: Webhook, path: 'Webhooks', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
                  { label: 'Simulations', icon: Rocket, path: 'SimulationHub', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
                  { label: 'Analytics', icon: BarChart3, path: 'AIAnalyticsHub', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
                  { label: 'Security', icon: Shield, path: 'Security', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
                ].map(action => (
                  <Link key={action.path} to={createPageUrl(action.path)}>
                    <div className={`flex items-center gap-3 p-2.5 rounded-lg border ${action.color} hover:scale-[1.02] transition-all cursor-pointer`}>
                      <action.icon className="w-4 h-4" />
                      <span className="text-sm text-white/80">{action.label}</span>
                      <ArrowUpRight className="w-3 h-3 ml-auto opacity-40" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
