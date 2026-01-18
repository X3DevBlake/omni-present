import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, RefreshCw, Settings, AlertCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import DeviceDiscovery3D from '../components/devices/DeviceDiscovery3D';
import DeviceControlPanel from '../components/devices/DeviceControlPanel';
import DigitalTwin3D from '../components/devices/DigitalTwin3D';
import EnhancedTelemetryStream from '../components/devices/EnhancedTelemetryStream';
import PredictiveMaintenanceSystem from '../components/devices/PredictiveMaintenanceSystem';

export default function DevicesHub() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isScanning, setIsScanning] = useState(false);

  return (
    <AuroraBackground className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Devices Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">Discover, control, and monitor all connected devices</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Connected Devices', value: '6', color: 'from-cyan-500 to-blue-500' },
            { label: 'System Health', value: '94%', color: 'from-green-500 to-emerald-500' },
            { label: 'Network Status', value: 'Optimal', color: 'from-blue-500 to-purple-500' },
            { label: 'Alerts', value: '0', color: 'from-yellow-500 to-orange-500' },
          ].map((stat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card className={`bg-gradient-to-br ${stat.color} bg-opacity-20 border-white/10 p-4`}>
                <p className="text-white/60 text-xs">{stat.label}</p>
                <p className="text-white font-bold text-lg">{stat.value}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="discovery">Device Discovery</TabsTrigger>
            <TabsTrigger value="control">Control Panel</TabsTrigger>
            <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
            <TabsTrigger value="maintenance">Predictive Maintenance</TabsTrigger>
            <TabsTrigger value="twin">Digital Twin</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-black/40 border-white/10 p-6">
              <CardTitle className="text-white mb-4 flex items-center gap-2">
                <Wifi className="w-5 h-5" /> Network Overview
              </CardTitle>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Network Speed</p>
                  <p className="text-white font-bold text-2xl">980 Mbps</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Connected Devices</p>
                  <p className="text-white font-bold text-2xl">6/10</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Average Latency</p>
                  <p className="text-white font-bold text-2xl">8ms</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">Uptime</p>
                  <p className="text-white font-bold text-2xl">99.9%</p>
                </div>
              </div>
            </Card>

            <Card className="bg-black/40 border-white/10 p-6">
              <CardTitle className="text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Device Status
              </CardTitle>
              <div className="space-y-2">
                {[
                  { name: 'iPhone Pro', status: 'online', battery: 87 },
                  { name: 'MacBook Pro', status: 'online', battery: 95 },
                  { name: 'iPad Air', status: 'online', battery: 62 },
                  { name: 'Apple Watch', status: 'online', battery: 45 },
                  { name: 'HomePod', status: 'online', battery: 100 },
                  { name: 'Device Hub', status: 'online', battery: 100 },
                ].map((dev, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-white">{dev.name}</span>
                    </div>
                    <Badge className="bg-green-500/30 text-green-300 text-xs">Connected</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Device Discovery Tab */}
          <TabsContent value="discovery">
            <Card className="bg-black/40 border-white/10 mb-6 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold">Network Scan</h3>
                  <p className="text-white/60 text-sm">Discover all devices on your network</p>
                </div>
                <Button
                  onClick={() => setIsScanning(!isScanning)}
                  className={isScanning ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                  {isScanning ? 'Scanning...' : 'Start Scan'}
                </Button>
              </div>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <DeviceDiscovery3D />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Control Panel Tab */}
          <TabsContent value="control">
            <DeviceControlPanel />
          </TabsContent>

          {/* Digital Twin Tab */}
          <TabsContent value="twin">
            <Card className="bg-black/40 border-white/10">
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <DigitalTwin3D />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-white/10 p-6 mt-6">
              <CardTitle className="text-white mb-4">Device Information</CardTitle>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/60">Device Name</p>
                  <p className="text-white font-semibold">iPhone Pro</p>
                </div>
                <div>
                  <p className="text-white/60">Model</p>
                  <p className="text-white font-semibold">iPhone 15 Pro Max</p>
                </div>
                <div>
                  <p className="text-white/60">OS Version</p>
                  <p className="text-white font-semibold">iOS 17.2</p>
                </div>
                <div>
                  <p className="text-white/60">IP Address</p>
                  <p className="text-white font-semibold">192.168.1.5</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Telemetry Tab */}
          <TabsContent value="telemetry">
            <EnhancedTelemetryStream />
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance">
            <PredictiveMaintenanceSystem />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}