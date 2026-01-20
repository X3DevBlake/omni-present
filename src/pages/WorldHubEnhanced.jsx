import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Globe, Cloud, Cpu, AlertTriangle, RefreshCw, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import InteractiveGlobe3D from '../components/world/InteractiveGlobe3D';
import DynamicWeatherSystem3D from '../components/world/DynamicWeatherSystem3D';
import DeviceLocationMap3D from '../components/world/DeviceLocationMap3D';
import GeopoliticalEvents3D from '../components/world/GeopoliticalEvents3D';
import { toast } from 'sonner';

export default function WorldHubEnhanced() {
  const queryClient = useQueryClient();
  const [selectedRegion, setSelectedRegion] = useState(null);

  const { data: geopoliticalEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['geopolitical-events'],
    queryFn: () => base44.entities.GeopoliticalEvent.filter({}).limit(50),
    initialData: []
  });

  const { data: deviceLocations = [] } = useQuery({
    queryKey: ['device-locations'],
    queryFn: () => base44.entities.SensorData.filter({ sensor_type: 'location_tracker' }).limit(100),
    initialData: []
  });

  const { data: worldStates = [] } = useQuery({
    queryKey: ['world-states'],
    queryFn: () => base44.entities.WorldState.filter({}).limit(50).sort('-created_date'),
    initialData: []
  });

  const fetchEventsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('fetch-geopolitical-events', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['geopolitical-events']);
      toast.success('Geopolitical events updated');
    }
  });

  const syncDevicesMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('sync-device-locations', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['device-locations']);
      toast.success('Device locations synced');
    }
  });

  const generateWeatherMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generate-weather-data', {
        regions: ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania']
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['world-states']);
      toast.success('Weather data updated');
    }
  });

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Globe className="w-10 h-10 text-cyan-400" />
            Global World Hub
          </h1>
          <p className="text-slate-400">Real-time global monitoring with AI-powered insights</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => fetchEventsMutation.mutate()}
            disabled={fetchEventsMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${fetchEventsMutation.isPending ? 'animate-spin' : ''}`} />
            Update Events
          </Button>
          <Button
            onClick={() => syncDevicesMutation.mutate()}
            disabled={syncDevicesMutation.isPending}
            variant="outline"
          >
            <Cpu className="w-4 h-4 mr-2" />
            Sync Devices
          </Button>
          <Button
            onClick={() => generateWeatherMutation.mutate()}
            disabled={generateWeatherMutation.isPending}
            variant="outline"
          >
            <Cloud className="w-4 h-4 mr-2" />
            Update Weather
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-slate-400 text-xs">Active Events</p>
                  <p className="text-white text-2xl font-bold">{geopoliticalEvents.filter(e => e.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Cpu className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-slate-400 text-xs">Connected Devices</p>
                  <p className="text-white text-2xl font-bold">{deviceLocations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Cloud className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-slate-400 text-xs">Weather Regions</p>
                  <p className="text-white text-2xl font-bold">{worldStates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Map className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-slate-400 text-xs">Global Coverage</p>
                  <p className="text-white text-2xl font-bold">195</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="globe" className="space-y-6">
          <TabsList className="bg-slate-900/60">
            <TabsTrigger value="globe">
              <Globe className="w-4 h-4 mr-2" />
              Interactive Globe
            </TabsTrigger>
            <TabsTrigger value="events">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Geopolitical Events
            </TabsTrigger>
            <TabsTrigger value="devices">
              <Cpu className="w-4 h-4 mr-2" />
              Device Network
            </TabsTrigger>
            <TabsTrigger value="weather">
              <Cloud className="w-4 h-4 mr-2" />
              Weather Systems
            </TabsTrigger>
          </TabsList>

          <TabsContent value="globe">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Live Global Visualization</CardTitle>
                <p className="text-slate-400 text-sm">
                  Explore real-time events, devices, and environmental data across the planet
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <InteractiveGlobe3D
                    events={geopoliticalEvents}
                    devices={deviceLocations}
                    weatherData={worldStates}
                    onRegionClick={setSelectedRegion}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/60 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">3D Event Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px]">
                    <GeopoliticalEvents3D events={geopoliticalEvents} />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {geopoliticalEvents.filter(e => e.is_active).slice(0, 8).map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-bold">{event.event_name}</h3>
                          <Badge className={
                            event.severity === 'critical' ? 'bg-red-500' :
                            event.severity === 'high' ? 'bg-orange-500' :
                            event.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }>
                            {event.severity}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{event.region}</p>
                        <p className="text-slate-300 text-xs mb-3">{event.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {event.impact_type}
                          </Badge>
                          {event.ai_analysis?.global_impact_score && (
                            <span className="text-xs text-slate-400">
                              Impact: {Math.round(event.ai_analysis.global_impact_score)}/100
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="devices">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Global Device Network</CardTitle>
                <p className="text-slate-400 text-sm">
                  Real-time visualization of connected devices worldwide
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[600px]">
                  <DeviceLocationMap3D devices={deviceLocations} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weather">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Dynamic Weather Systems</CardTitle>
                <p className="text-slate-400 text-sm">
                  Live environmental data and atmospheric conditions
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[600px]">
                  <DynamicWeatherSystem3D weatherStates={worldStates} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}