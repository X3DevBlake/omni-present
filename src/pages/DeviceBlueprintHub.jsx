import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Cpu, Map, Zap, Radio, Layers, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import DeviceBlueprintGallery from '../components/omnipresence/DeviceBlueprintGallery';
import SpatialZoneVisualizer3D from '../components/omnipresence/SpatialZoneVisualizer3D';
import { toast } from 'sonner';

export default function DeviceBlueprintHub() {
  const queryClient = useQueryClient();

  const { data: blueprints = [] } = useQuery({
    queryKey: ['device-blueprints'],
    queryFn: () => base44.entities.DeviceBlueprint.filter({}).limit(50),
    initialData: []
  });

  const { data: spatialZones = [] } = useQuery({
    queryKey: ['spatial-zones'],
    queryFn: () => base44.entities.SpatialZone.filter({}).limit(100),
    initialData: []
  });

  const { data: spatialMaps = [] } = useQuery({
    queryKey: ['spatial-maps'],
    queryFn: () => base44.entities.SpatialMap.filter({}).limit(10),
    initialData: []
  });

  const { data: presences = [] } = useQuery({
    queryKey: ['agent-presences'],
    queryFn: () => base44.entities.AgentPhysicalPresence.filter({}).limit(50),
    initialData: []
  });

  const { data: smartDevices = [] } = useQuery({
    queryKey: ['smart-devices'],
    queryFn: () => base44.entities.SmartDeviceIntegration.filter({}).limit(50),
    initialData: []
  });

  const analyzeZonesMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('analyze-spatial-zones', {
        spatial_map_id: spatialMaps[0]?.id
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Created ${data.zones_created} intelligent zones!`);
      queryClient.invalidateQueries(['spatial-zones']);
    }
  });

  const zonesByType = spatialZones.reduce((acc, zone) => {
    acc[zone.zone_type] = (acc[zone.zone_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Cpu className="w-10 h-10 text-cyan-400" />
            Device Blueprint & Spatial Hub
          </h1>
          <p className="text-slate-400">
            Design 3D device blueprints and manage intelligent spatial zones
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-cyan-500/10 border-cyan-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Cpu className="w-8 h-8 text-cyan-400" />
              <div>
                <p className="text-cyan-400 text-xs">Blueprints</p>
                <p className="text-white text-2xl font-bold">{blueprints.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Layers className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-purple-400 text-xs">Spatial Zones</p>
                <p className="text-white text-2xl font-bold">{spatialZones.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Radio className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-green-400 text-xs">Active Agents</p>
                <p className="text-white text-2xl font-bold">{presences.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-500/10 border-orange-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Zap className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-orange-400 text-xs">Smart Devices</p>
                <p className="text-white text-2xl font-bold">{smartDevices.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="blueprints" className="space-y-6">
          <TabsList className="bg-slate-900/60">
            <TabsTrigger value="blueprints">
              <Cpu className="w-4 h-4 mr-2" />
              Device Blueprints
            </TabsTrigger>
            <TabsTrigger value="zones">
              <Layers className="w-4 h-4 mr-2" />
              Spatial Zones
            </TabsTrigger>
            <TabsTrigger value="mapping">
              <Map className="w-4 h-4 mr-2" />
              3D Mapping
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blueprints">
            <DeviceBlueprintGallery blueprints={blueprints} />
          </Tabs