import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Radio, Activity, Zap, Network, Shield, Globe, Cpu, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import LiveNetworkMonitorDashboard from '../components/redcomm/LiveNetworkMonitorDashboard';
import RedCommNetworkTopology3D from '../components/redcomm/RedCommNetworkTopology3D';
import RedCommAnalyticsDashboard from '../components/redcomm/RedCommAnalyticsDashboard';
import SecurityThreatDashboard3D from '../components/redcomm/SecurityThreatDashboard3D';

export default function RedCommHub() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: nodes = [] } = useQuery({
    queryKey: ['redcommNodes'],
    queryFn: () => base44.entities.RedCommNetworkNode.list()
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['networkMetrics'],
    queryFn: async () => {
      const data = await base44.entities.SystemMetric.filter({ component_type: 'network_node' });
      return data;
    }
  });

  const activeNodes = nodes.filter(n => n.status === 'online');
  const totalBandwidth = activeNodes.length * 100; // Gbps per node

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-cyan-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-black text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                RedComm XG Network
              </h1>
              <p className="text-gray-400 text-lg">
                6G THz Interplanetary Mesh • Real-Time Monitoring & Control
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.1, rotate: 360 }} transition={{ duration: 0.6 }}>
              <Radio className="w-16 h-16 text-cyan-400" />
            </motion.div>
          </div>

          {/* Network Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: Zap, label: 'Online Nodes', value: activeNodes.length, color: 'green', suffix: '' },
              { icon: Network, label: 'Total Nodes', value: nodes.length, color: 'blue', suffix: '' },
              { icon: Activity, label: 'Bandwidth', value: totalBandwidth, color: 'cyan', suffix: ' Gbps' },
              { icon: Shield, label: 'Uptime', value: '99.7', color: 'purple', suffix: '%' },
              { icon: AlertCircle, label: 'Alerts', value: 0, color: 'amber', suffix: '' }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Card className={`bg-black/60 border-2 border-${stat.color}-500/40 backdrop-blur-xl`}>
                    <CardContent className="p-4">
                      <Icon className={`w-6 h-6 text-${stat.color}-400 mb-2`} />
                      <div className="text-white text-2xl font-bold">{stat.value}{stat.suffix}</div>
                      <div className="text-gray-400 text-xs">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/60 backdrop-blur-xl border border-white/10 mb-8 p-2 rounded-2xl">
            <TabsTrigger value="monitor" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 rounded-xl py-3">
              <Activity className="w-4 h-4 mr-2" />
              Live Monitor
            </TabsTrigger>
            <TabsTrigger value="topology" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-xl py-3">
              <Network className="w-4 h-4 mr-2" />
              Topology
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 rounded-xl py-3">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 rounded-xl py-3">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitor">
            <LiveNetworkMonitorDashboard />
          </TabsContent>

          <TabsContent value="topology">
            <RedCommNetworkTopology3D />
          </TabsContent>

          <TabsContent value="analytics">
            <RedCommAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="security">
            <SecurityThreatDashboard3D />
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          {[
            { title: 'Deploy New Node', description: 'Add nodes to expand network coverage', icon: Globe, color: 'cyan' },
            { title: 'Configure Mesh', description: 'Optimize network topology', icon: Network, color: 'purple' },
            { title: 'Security Scan', description: 'Run threat detection analysis', icon: Shield, color: 'orange' }
          ].map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`bg-gradient-to-br from-${action.color}-950/80 to-black/60 border-${action.color}-500/40 backdrop-blur-xl cursor-pointer`}>
                  <CardContent className="p-6">
                    <Icon className={`w-12 h-12 text-${action.color}-400 mb-4`} />
                    <h3 className="text-white font-bold text-lg mb-2">{action.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{action.description}</p>
                    <Button className={`w-full bg-${action.color}-600 hover:bg-${action.color}-700`}>
                      Launch
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}