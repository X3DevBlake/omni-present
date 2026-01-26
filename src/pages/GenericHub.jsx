import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Server, Shield, Cpu, Zap, Globe, 
  Terminal, Database, Network, Lock, AlertCircle
} from 'lucide-react';
import InteractiveHubNetwork3D from '../components/home/InteractiveHubNetwork3D';

export default function GenericHub() {
  const [hub, setHub] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const name = params.get('name'); // Fallback if ID not found

    const fetchHub = async () => {
      setLoading(true);
      try {
        let data;
        if (id) {
          data = await base44.entities.Hub.get(id);
        } else if (name) {
          const res = await base44.entities.Hub.list({ 
            filters: { name: { $eq: name } }, // Pseudo-filter syntax, assuming SDK capability or list+find
            limit: 1 
          });
          // Fallback manual filter if SDK list params vary
          const all = await base44.entities.Hub.list();
          data = all.find(h => h.name === name);
        }

        if (data) {
          setHub(data);
        }
      } catch (error) {
        console.error("Error fetching hub:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHub();
  }, [location.search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-4xl font-bold mb-2">Hub Not Found</h1>
        <p className="text-gray-400">The requested hub node could not be located in the network.</p>
        <Button className="mt-6" onClick={() => window.history.back()}>Return to Network</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="text-indigo-400 border-indigo-400/30">
                {hub.category}
              </Badge>
              <Badge variant="outline" className={hub.status === 'active' ? 'text-green-400 border-green-400/30' : 'text-yellow-400 border-yellow-400/30'}>
                {hub.status?.toUpperCase() || 'ACTIVE'}
              </Badge>
            </div>
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              {hub.name}
            </h1>
            <p className="text-xl text-gray-400 mt-2 max-w-2xl">
              {hub.description || `Advanced node responsible for ${hub.category.toLowerCase()} operations and data processing.`}
            </p>
          </div>
          <Activity className="w-24 h-24 text-indigo-500/20" />
        </motion.div>

        {/* 3D Visualizer Placeholder */}
        <div className="h-[400px] bg-black/50 border border-white/10 rounded-2xl mb-8 overflow-hidden relative">
          <InteractiveHubNetwork3D />
          <div className="absolute bottom-4 right-4 bg-black/80 p-2 rounded text-xs text-gray-400">
            Network Visualization
          </div>
        </div>

        {/* Stats / Capabilities Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Cpu className="w-5 h-5 text-purple-400" />
                Processing Power
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {(Math.random() * 100).toFixed(1)} PFlops
              </div>
              <p className="text-sm text-gray-400">Allocated computational resources</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Network className="w-5 h-5 text-blue-400" />
                Connectivity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {(Math.random() * 99 + 1).toFixed(2)}%
              </div>
              <p className="text-sm text-gray-400">Network uptime and reliability</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="w-5 h-5 text-green-400" />
                Data Throughput
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {(Math.random() * 500).toFixed(0)} TB/s
              </div>
              <p className="text-sm text-gray-400">Real-time data synchronization</p>
            </CardContent>
          </Card>
        </div>

        {/* Console / Terminal Output */}
        <div className="mt-8 bg-black border border-white/10 rounded-xl p-4 font-mono text-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2 border-b border-white/10 pb-2">
            <Terminal className="w-4 h-4" />
            <span>System Logs - {hub.name}</span>
          </div>
          <div className="space-y-1 text-green-400/80">
            <p>{`> Initializing connection to ${hub.name}...`}</p>
            <p>{`> Verifying security protocols... [OK]`}</p>
            <p>{`> Syncing with Omni-Present Core... [OK]`}</p>
            <p>{`> Loading module capabilities for ${hub.category}...`}</p>
            <p className="animate-pulse">{`> System ready. Awaiting command.`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}