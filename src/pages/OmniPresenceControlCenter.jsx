import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Zap, Radio, Map, Activity, Scan } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import SpatialProjectionCanvas3D from '../components/omnipresence/SpatialProjectionCanvas3D';
import DeviceManagementPanel from '../components/omnipresence/DeviceManagementPanel';
import RealWorldLogsDashboard from '../components/omnipresence/RealWorldLogsDashboard';
import AgentPhysicalBehaviorStudio from '../components/omnipresence/AgentPhysicalBehaviorStudio';
import { toast } from 'sonner';

export default function OmniPresenceControlCenter() {
  const queryClient = useQueryClient();

  const { data: presences = [] } = useQuery({
    queryKey: ['agent-physical-presence'],
    queryFn: () => base44.entities.AgentPhysicalPresence.filter({}).limit(100),
    initialData: []
  });

  const { data: devices = [] } = useQuery({
    queryKey: ['omni-devices'],
    queryFn: () => base44.entities.OmniDevice.filter({}).limit(50),
    initialData: []
  });

  const { data: spatialMaps = [] } = useQuery({
    queryKey: ['spatial-maps'],
    queryFn: () => base44.entities.SpatialMap.filter({}).limit(20),
    initialData: []
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['real-world-interactions'],
    queryFn: () => base44.entities.RealWorldInteractionLog.filter({}).limit(200),
    initialData: []
  });

  const deployAgentMutation = useMutation({
    mutationFn: async ({ agent_id, omni_device_id }) => {
      const response = await base44.functions.invoke('deploy-agent-hologram', {
        agent_id,
        omni_device_id,
        initial_coordinates: { x: 0, y: 0, z: 0, room: 'living_room' },
        behavior_profile: 'assistant'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-physical-presence']);
      toast.success('Agent deployed to physical space');
    }
  });

  const analyzeInteractionsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('analyze-spatial-interaction', {
        time_range_hours: 24
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Analysis complete');
    }
  });

  const activePresences = presences.filter(p => p.projection_status === 'active');
  const onlineDevices = devices.filter(d => d.online_status);
  const recentInteractions = interactions.slice(0, 50);

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Zap className="w-10 h-10 text-cyan-400" />
            Omni-Presence Control Center
          </h1>
          <p className="text-slate-400">Command your agents in the physical world through 3D digital projections</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Radio className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-slate-400 text-xs">Active Projections</p>
                  <p className="text-white text-2xl font-bold">{activePresences.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-slate-400 text-xs">Online Devices</p>
                  <p className="text-white text-2xl font-bold">{onlineDevices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Map className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-slate-400 text-xs">Spatial Maps</p>
                  <p className="text-white text-2xl font-bold">{spatialMaps.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-pink-400" />
                <div>
                  <p className="text-slate-400 text-xs">Interactions (24h)</p>
                  <p className="text-white text-2xl font-bold">{recentInteractions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={() => analyzeInteractionsMutation.mutate()}
            disabled={analyzeInteractionsMutation.isPending}
            className="bg-gradient-to-r from-cyan-600 to-blue-600"
          >
            <Scan className="w-4 h-4 mr-2" />
            Analyze Interactions
          </Button>
        </div>

        <Tabs defaultValue="spatial" className="space-y-6">
          <TabsList className="bg-slate-900/60">
            <TabsTrigger value="spatial">
              <Map className="w-4 h-4 mr-2" />
              Spatial View
            </TabsTrigger>
            <TabsTrigger value="devices">
              <Radio className="w-4 h-4 mr-2" />
              Devices
            </TabsTrigger>
            <TabsTrigger value="behavior">
              <Zap className="w-4 h-4 mr-2" />
              Behavior
            </TabsTrigger>
            <TabsTrigger value="logs">
              <Activity className="w-4 h-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="spatial">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">3D Spatial Projection View</CardTitle>
                <p className="text-slate-400 text-sm">
                  Real-time visualization of agents in physical space
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <SpatialProjectionCanvas3D
                    presences={presences}
                    devices={devices}
                    spatialMaps={spatialMaps}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices">
            <DeviceManagementPanel
              devices={devices}
              onDeploy={(deviceId) => {
                if (presences[0]) {
                  deployAgentMutation.mutate({
                    agent_id: presences[0].agent_id,
                    omni_device_id: deviceId
                  });
                }
              }}
            />
          </TabsContent>

          <TabsContent value="behavior">
            <AgentPhysicalBehaviorStudio
              presences={presences}
              spatialMaps={spatialMaps}
            />
          </TabsContent>

          <TabsContent value="logs">
            <RealWorldLogsDashboard
              interactions={interactions}
              presences={presences}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}