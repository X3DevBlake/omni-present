import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Zap, Radio, Map, Activity, Scan, Brain, Network, Heart, Cpu, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import SpatialProjectionCanvas3D from '../components/omnipresence/SpatialProjectionCanvas3D';
import DeviceManagementPanel from '../components/omnipresence/DeviceManagementPanel';
import RealWorldLogsDashboard from '../components/omnipresence/RealWorldLogsDashboard';
import AgentPhysicalBehaviorStudio from '../components/omnipresence/AgentPhysicalBehaviorStudio';
import MultiDeviceProjectionVisualizer3D from '../components/omnipresence/MultiDeviceProjectionVisualizer3D';
import SpatialScanUploader from '../components/omnipresence/SpatialScanUploader';
import DynamicObjectTracker3D from '../components/omnipresence/DynamicObjectTracker3D';
import DeviceHandoffVisualizer3D from '../components/omnipresence/DeviceHandoffVisualizer3D';
import Loaded3DModelViewer from '../components/omnipresence/Loaded3DModelViewer';
import GestureRecognition3D from '../components/omnipresence/GestureRecognition3D';
import AutonomousActionDashboard from '../components/omnipresence/AutonomousActionDashboard';
import MultiAgentCollaboration3D from '../components/omnipresence/MultiAgentCollaboration3D';
import EnhancedSpatialMap3D from '../components/omnipresence/EnhancedSpatialMap3D';
import DeviceCommandVisualizer3D from '../components/omnipresence/DeviceCommandVisualizer3D';
import EmotionDetectionPanel from '../components/omnipresence/EmotionDetectionPanel';
import AdvancedSpatialVisualizer3D from '../components/omnipresence/AdvancedSpatialVisualizer3D';
import PhysicalTaskExecutor from '../components/omnipresence/PhysicalTaskExecutor';
import AgentLearningDashboard from '../components/omnipresence/AgentLearningDashboard';
import ImmersiveRoomScanner3D from '../components/omnipresence/ImmersiveRoomScanner3D';
import DeviceNetworkTopology3D from '../components/omnipresence/DeviceNetworkTopology3D';
import RealTimeSpatialHeatmap3D from '../components/omnipresence/RealTimeSpatialHeatmap3D';
import EnhancedSpatialProjectionMap3D from '../components/omnipresence/EnhancedSpatialProjectionMap3D';
import MatterHomeKitControl from '../components/omnipresence/MatterHomeKitControl';
import LiveAgentProjection3D from '../components/omnipresence/LiveAgentProjection3D';
import AdvancedAgentSpaceVisualizer3D from '../components/omnipresence/AdvancedAgentSpaceVisualizer3D';
import PhysicalTaskActionVisualizer3D from '../components/omnipresence/PhysicalTaskActionVisualizer3D';
import MultiAgentCollaborationVisualizer3D from '../components/omnipresence/MultiAgentCollaborationVisualizer3D';
import LiDARSpatialScanner3D from '../components/omnipresence/LiDARSpatialScanner3D';
import SemanticSceneGraph3D from '../components/omnipresence/SemanticSceneGraph3D';
import DeviceBlueprintViewer3D from '../components/omnipresence/DeviceBlueprintViewer3D';
import PredictiveObstacleVisualizer3D from '../components/omnipresence/PredictiveObstacleVisualizer3D';
import AgentFeedbackLearningPanel from '../components/omnipresence/AgentFeedbackLearningPanel';
import ComplexTaskOrchestrator from '../components/omnipresence/ComplexTaskOrchestrator';
import EnhancedOmniLoopLogo3D from '../components/omnipresence/EnhancedOmniLoopLogo3D';
import EnhancedOmniText3D from '../components/omnipresence/EnhancedOmniText3D';
import LiveSpatialProjectionMap3D from '../components/omnipresence/LiveSpatialProjectionMap3D';
import AdvancedAgentPresence3D from '../components/omnipresence/AdvancedAgentPresence3D';
import ContextAwareAgentVisualizer3D from '../components/omnipresence/ContextAwareAgentVisualizer3D';
import DynamicPathfindingVisualizer3D from '../components/omnipresence/DynamicPathfindingVisualizer3D';
import ProjectionDeviceSimulator3D from '../components/omnipresence/ProjectionDeviceSimulator3D';
import InteractiveSpatialMap3D from '../components/omnipresence/InteractiveSpatialMap3D';
import EnhancedObstacleAvoidanceVisualizer3D from '../components/omnipresence/EnhancedObstacleAvoidanceVisualizer3D';
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

  const { data: multiDeviceProjections = [] } = useQuery({
    queryKey: ['multi-device-projections'],
    queryFn: () => base44.entities.MultiDeviceProjection.filter({}).limit(50),
    initialData: []
  });

  const { data: deviceCommunications = [] } = useQuery({
    queryKey: ['device-communications'],
    queryFn: () => base44.entities.DeviceToDeviceCommunication.filter({}).limit(100),
    initialData: []
  });

  const { data: spatialScans = [] } = useQuery({
    queryKey: ['spatial-scans'],
    queryFn: () => base44.entities.SpatialScan3D.filter({}).limit(50),
    initialData: []
  });

  const { data: dynamicDetections = [] } = useQuery({
    queryKey: ['dynamic-detections'],
    queryFn: () => base44.entities.DynamicObjectDetection.filter({}).limit(200),
    initialData: []
  });

  const { data: physicalInteractions = [] } = useQuery({
    queryKey: ['physical-interactions'],
    queryFn: () => base44.entities.PhysicalInteraction.filter({}).limit(100),
    initialData: []
  });

  const { data: autonomousActions = [] } = useQuery({
    queryKey: ['autonomous-actions'],
    queryFn: () => base44.entities.AutonomousAction.filter({}).limit(50),
    initialData: []
  });

  const { data: collaborativeTasks = [] } = useQuery({
    queryKey: ['collaborative-tasks'],
    queryFn: () => base44.entities.AgentCollaborativeTask.filter({}).limit(30),
    initialData: []
  });

  const { data: deviceCommands = [] } = useQuery({
    queryKey: ['device-commands'],
    queryFn: () => base44.entities.DeviceCommand.filter({}).limit(50),
    initialData: []
  });

  const { data: agentEmotions = [] } = useQuery({
    queryKey: ['agent-emotions'],
    queryFn: () => base44.entities.AgentEmotion.filter({}).limit(30),
    initialData: []
  });

  const { data: smartDevices = [] } = useQuery({
    queryKey: ['smart-device-integrations'],
    queryFn: () => base44.entities.SmartDeviceIntegration.filter({}).limit(50),
    initialData: []
  });

  const { data: crossPlatformDevices = [] } = useQuery({
    queryKey: ['cross-platform-devices'],
    queryFn: () => base44.entities.CrossPlatformDevice.filter({}).limit(100),
    initialData: []
  });

  const { data: taskDelegations = [] } = useQuery({
    queryKey: ['task-delegations'],
    queryFn: () => base44.entities.TaskDelegation.filter({}).limit(50),
    initialData: []
  });

  const { data: spatialZones = [] } = useQuery({
    queryKey: ['spatial-zones'],
    queryFn: () => base44.entities.SpatialZone.filter({}).limit(100),
    initialData: []
  });

  const { data: enhancedBlueprints = [] } = useQuery({
    queryKey: ['enhanced-blueprints'],
    queryFn: () => base44.entities.DeviceBlueprintEnhanced.filter({}).limit(20),
    initialData: []
  });

  const { data: semanticGraphs = [] } = useQuery({
    queryKey: ['semantic-graphs'],
    queryFn: () => base44.entities.EnvironmentSemanticGraph.filter({}).limit(10),
    initialData: []
  });

  const { data: predictiveObstacles = [] } = useQuery({
    queryKey: ['predictive-obstacles'],
    queryFn: () => base44.entities.PredictiveObstacle.filter({}).limit(50),
    initialData: []
  });

  const [scanning, setScanning] = React.useState(false);
  const [scanProgress, setScanProgress] = React.useState(0);

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

  const optimizeMultiDeviceMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('optimize-multi-device-projection', {
        agent_id: presences[0]?.agent_id,
        target_area: { x: 0, y: 0, z: 0, radius: 10 },
        optimization_strategy: 'load_balanced'
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['multi-device-projections']);
      toast.success(`Optimized across ${data.devices_allocated} devices`);
    }
  });

  const detectObjectsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('detect-dynamic-objects-ai', {
        omni_device_id: devices[0]?.id,
        sensor_data: { type: 'camera', data: 'simulated_feed' },
        spatial_map_id: spatialMaps[0]?.id
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['dynamic-detections']);
      toast.success(`Detected ${data.objects_detected} objects`);
    }
  });

  const approveActionMutation = useMutation({
    mutationFn: async (actionId) => {
      await base44.entities.AutonomousAction.update(actionId, {
        approval_status: 'approved',
        execution_status: 'in_progress'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['autonomous-actions']);
      toast.success('Action approved and executing');
    }
  });

  const rejectActionMutation = useMutation({
    mutationFn: async (actionId) => {
      await base44.entities.AutonomousAction.update(actionId, {
        approval_status: 'rejected'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['autonomous-actions']);
      toast.info('Action rejected');
    }
  });

  const executeDeviceCommandMutation = useMutation({
    mutationFn: async (commandId) => {
      const response = await base44.functions.invoke('control-smart-devices', {
        command_ids: [commandId],
        execute_immediately: true
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['device-commands']);
      toast.success('Device command executed');
    }
  });

  const startEnvironmentScan = () => {
    setScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          toast.success('Environment scan complete!');
          detectObjectsMutation.mutate();
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const activePresences = presences.filter(p => p.projection_status === 'active');
  const onlineDevices = devices.filter(d => d.online_status);
  const recentInteractions = interactions.slice(0, 50);
  const trackingObjects = dynamicDetections.filter(d => d.tracking_status === 'tracking');

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
          <Button
            onClick={() => optimizeMultiDeviceMutation.mutate()}
            disabled={optimizeMultiDeviceMutation.isPending || !presences.length}
            variant="outline"
          >
            <Zap className="w-4 h-4 mr-2" />
            Optimize Multi-Device
          </Button>
          <Button
            onClick={() => detectObjectsMutation.mutate()}
            disabled={detectObjectsMutation.isPending || !devices.length}
            variant="outline"
          >
            <Scan className="w-4 h-4 mr-2" />
            Detect Objects
          </Button>
        </div>

        <Tabs defaultValue="spatial" className="space-y-6">
          <TabsList className="bg-slate-900/60 flex-wrap">
            <TabsTrigger value="spatial">
              <Map className="w-4 h-4 mr-2" />
              Spatial
            </TabsTrigger>
            <TabsTrigger value="physical-tasks">
              <Cpu className="w-4 h-4 mr-2" />
              Physical Tasks
            </TabsTrigger>
            <TabsTrigger value="collaboration">
              <Network className="w-4 h-4 mr-2" />
              Multi-Agent
            </TabsTrigger>
            <TabsTrigger value="emotion">
              <Heart className="w-4 h-4 mr-2" />
              Emotion
            </TabsTrigger>
            <TabsTrigger value="smart-home">
              <Radio className="w-4 h-4 mr-2" />
              Smart Devices
            </TabsTrigger>
            <TabsTrigger value="matter-homekit">
              <Network className="w-4 h-4 mr-2" />
              Matter/HomeKit
            </TabsTrigger>
            <TabsTrigger value="physical-tasks">
              <Zap className="w-4 h-4 mr-2" />
              Physical Tasks
            </TabsTrigger>
            <TabsTrigger value="collaboration">
              <Activity className="w-4 h-4 mr-2" />
              Multi-Agent
            </TabsTrigger>
            <TabsTrigger value="lidar">
              <Scan className="w-4 h-4 mr-2" />
              LiDAR Scanner
            </TabsTrigger>
            <TabsTrigger value="semantic">
              <Network className="w-4 h-4 mr-2" />
              Scene Graph
            </TabsTrigger>
            <TabsTrigger value="blueprints">
              <Cpu className="w-4 h-4 mr-2" />
              Blueprints
            </TabsTrigger>
            <TabsTrigger value="predictive">
              <Activity className="w-4 h-4 mr-2" />
              Predictive
            </TabsTrigger>
            <TabsTrigger value="orchestration">
              <Brain className="w-4 h-4 mr-2" />
              Orchestration
            </TabsTrigger>
            <TabsTrigger value="learning">
              <Brain className="w-4 h-4 mr-2" />
              Learning
            </TabsTrigger>
            <TabsTrigger value="enhanced-logo">
              <Zap className="w-4 h-4 mr-2" />
              Logo
            </TabsTrigger>
            <TabsTrigger value="enhanced-text">
              <Activity className="w-4 h-4 mr-2" />
              Text
            </TabsTrigger>
            <TabsTrigger value="live-spatial">
              <Map className="w-4 h-4 mr-2" />
              Live Map
            </TabsTrigger>
            <TabsTrigger value="agent-presence">
              <Brain className="w-4 h-4 mr-2" />
              Agent Presence
            </TabsTrigger>
            <TabsTrigger value="context-aware">
              <Brain className="w-4 h-4 mr-2" />
              Context AI
            </TabsTrigger>
            <TabsTrigger value="pathfinding">
              <Network className="w-4 h-4 mr-2" />
              Pathfinding
            </TabsTrigger>
            <TabsTrigger value="projection-sim">
              <Cpu className="w-4 h-4 mr-2" />
              Projection Sim
            </TabsTrigger>
            <TabsTrigger value="interactive-map">
              <Map className="w-4 h-4 mr-2" />
              Interactive
            </TabsTrigger>
            <TabsTrigger value="avoidance">
              <Network className="w-4 h-4 mr-2" />
              Avoidance
            </TabsTrigger>
            <TabsTrigger value="multi-device">
              <Radio className="w-4 h-4 mr-2" />
              Multi-Device
            </TabsTrigger>
            <TabsTrigger value="objects">
              <Activity className="w-4 h-4 mr-2" />
              Objects
            </TabsTrigger>
            <TabsTrigger value="logs">
              <Activity className="w-4 h-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="spatial">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/60 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Enhanced Spatial Projection Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px]">
                    <EnhancedSpatialProjectionMap3D
                      agents={presences}
                      devices={[...smartDevices, ...crossPlatformDevices]}
                      zones={spatialZones}
                      onZoneClick={(zone) => toast.info(`Zone: ${zone.zone_name} - Heat: ${zone.activity_heat_score}%`)}
                      onDeviceClick={(device) => toast.info(`Device: ${device.device_name} (${device.protocol || device.api_provider})`)}
                      onAgentSelect={(agent) => toast.info(`Agent: ${agent.agent_id?.slice(0, 8)}`)}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="bg-slate-900/60 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Environment Scanner</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={startEnvironmentScan}
                      disabled={scanning}
                      className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 mb-4"
                    >
                      {scanning ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning {scanProgress}%</>
                      ) : (
                        <><Scan className="w-4 h-4 mr-2" /> Start Environmental Scan</>
                      )}
                    </Button>
                    <div className="h-[300px]">
                      <ImmersiveRoomScanner3D
                        scanning={scanning}
                        detections={dynamicDetections}
                        scanProgress={scanProgress}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/60 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Activity Heatmap</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <RealTimeSpatialHeatmap3D zones={spatialZones} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="multi-device">
            <div className="space-y-6">
              <Card className="bg-slate-900/60 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Multi-Device Projection Network</CardTitle>
                  <p className="text-slate-400 text-sm">
                    Seamless agent projection across multiple Omni devices
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px]">
                    <MultiDeviceProjectionVisualizer3D
                      projections={multiDeviceProjections}
                      devices={devices}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Device Handoff Visualization</CardTitle>
                  <p className="text-slate-400 text-sm">
                    Watch agents transition seamlessly between devices
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <DeviceHandoffVisualizer3D
                      communications={deviceCommunications}
                      devices={devices}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scans">
            <div className="space-y-6">
              <SpatialScanUploader
                spatialMapId={spatialMaps[0]?.id}
                onUploadComplete={() => queryClient.invalidateQueries(['spatial-scans'])}
              />

              <Card className="bg-slate-900/60 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Uploaded 3D Scans</CardTitle>
                  <p className="text-slate-400 text-sm">
                    View and manage uploaded spatial scans
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px]">
                    <Loaded3DModelViewer scan={spatialScans[0]} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    {spatialScans.slice(0, 3).map((scan, idx) => (
                      <div key={scan.id} className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-white text-sm font-medium mb-1">{scan.scan_name}</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                            {scan.scan_file_format}
                          </Badge>
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            {scan.ai_detected_features?.length || 0} features
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="objects">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Dynamic Object Detection & Tracking</CardTitle>
                <p className="text-slate-400 text-sm">
                  AI-powered real-time detection of people, pets, and moving objects
                </p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-slate-400">Tracking: {trackingObjects.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-slate-400">New: {dynamicDetections.filter(d => d.tracking_status === 'new').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-slate-400">Stationary: {dynamicDetections.filter(d => d.tracking_status === 'stationary').length}</span>
                    </div>
                  </div>
                </div>
                <div className="h-[600px]">
                  <DynamicObjectTracker3D detections={dynamicDetections} />
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

          <TabsContent value="gestures">
            <div className="space-y-6">
              <Card className="bg-slate-900/60 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Gesture Recognition & Control</CardTitle>
                  <p className="text-slate-400 text-sm">
                    Control agents with natural hand gestures - point, wave, swipe, and more
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px]">
                    <GestureRecognition3D interactions={physicalInteractions} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="autonomous">
            <AutonomousActionDashboard
              actions={autonomousActions}
              onApprove={(id) => approveActionMutation.mutate(id)}
              onReject={(id) => rejectActionMutation.mutate(id)}
            />
          </TabsContent>

          <TabsContent value="collaboration">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/60 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Multi-Agent Collaboration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <MultiAgentCollaboration3D collaborativeTask={collaborativeTasks[0]} />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {collaborativeTasks.slice(0, 3).map((task) => (
                  <Card key={task.id} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-bold">{task.task_name}</h4>
                        <Badge className="bg-purple-500/20 text-purple-400">
                          {task.participating_agents?.length || 0} agents
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">
                        Strategy: {task.coordination_strategy}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-cyan-400">Progress: {task.progress}%</span>
                        <span className="text-green-400">Quality: {task.collaboration_quality_score}/100</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="physical-tasks">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PhysicalTaskExecutor 
                agentId={presences[0]?.agent_id} 
                userContext={{ detected_emotion: agentEmotions[0]?.primary_emotion }}
              />
              <AgentLearningDashboard
                agentId={presences[0]?.agent_id}
                interactions={physicalInteractions}
                emotions={agentEmotions}
              />
            </div>
          </TabsContent>

          <TabsContent value="emotion">
            <EmotionDetectionPanel
              emotions={agentEmotions}
              recentCommands={deviceCommands}
            />
          </TabsContent>

          <TabsContent value="devices">
            <DeviceCommandVisualizer3D
              commands={deviceCommands}
              onExecute={(id) => executeDeviceCommandMutation.mutate(id)}
            />
          </TabsContent>

          <TabsContent value="smart-home">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/60 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Device Network Topology</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[450px]">
                      <DeviceNetworkTopology3D devices={[...smartDevices, ...crossPlatformDevices]} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/60 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Advanced Agent Space</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[450px]">
                      <AdvancedAgentSpaceVisualizer3D 
                        agents={presences} 
                        devices={[...smartDevices, ...crossPlatformDevices]}
                        collaborations={collaborativeTasks}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-900/60 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Connected Smart Devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {smartDevices.map((device) => (
                      <div key={device.id} className="bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-white font-bold">{device.device_name}</h4>
                            <p className="text-slate-400 text-sm">{device.device_type}</p>
                          </div>
                          <Badge className={device.connection_status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {device.connection_status}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <p>Provider: {device.api_provider}</p>
                          {device.current_state && (
                            <>
                              {device.current_state.power_on !== undefined && (
                                <p>Power: {device.current_state.power_on ? 'ON' : 'OFF'}</p>
                              )}
                              {device.current_state.brightness !== undefined && (
                                <p>Brightness: {device.current_state.brightness}%</p>
                              )}
                              {device.current_state.temperature !== undefined && (
                                <p>Temp: {device.current_state.temperature.toFixed(1)}°</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="matter-homekit">
            <MatterHomeKitControl devices={crossPlatformDevices} />
          </TabsContent>

          <TabsContent value="physical-tasks">
            <PhysicalTaskActionVisualizer3D 
              agents={presences} 
              devices={[...smartDevices, ...crossPlatformDevices]} 
            />
          </TabsContent>

          <TabsContent value="collaboration">
            <MultiAgentCollaborationVisualizer3D 
              agents={presences} 
              collaborativeTasks={collaborativeTasks} 
            />
          </TabsContent>

          <TabsContent value="lidar">
            <LiDARSpatialScanner3D 
              spatialZones={spatialZones} 
              detections={dynamicDetections} 
            />
          </TabsContent>

          <TabsContent value="semantic">
            <SemanticSceneGraph3D />
          </TabsContent>

          <TabsContent value="blueprints">
            <DeviceBlueprintViewer3D blueprints={enhancedBlueprints} />
          </TabsContent>

          <TabsContent value="predictive">
            <PredictiveObstacleVisualizer3D agents={presences} />
          </TabsContent>

          <TabsContent value="orchestration">
            <ComplexTaskOrchestrator 
              agents={presences} 
              devices={[...smartDevices, ...crossPlatformDevices]} 
            />
          </TabsContent>

          <TabsContent value="learning">
            <AgentFeedbackLearningPanel agents={presences} />
          </TabsContent>

          <TabsContent value="enhanced-logo">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Enhanced Omni Logo Loop</CardTitle>
                <p className="text-slate-400 text-sm">Dynamic, reactive logo with real-time system activity visualization</p>
              </CardHeader>
              <CardContent>
                <EnhancedOmniLoopLogo3D compact={false} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enhanced-text">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Enhanced Omni Text</CardTitle>
                <p className="text-slate-400 text-sm">Animated, emotion-aware text with data stream visualization</p>
              </CardHeader>
              <CardContent>
                <EnhancedOmniText3D onLetterClick={(char, idx) => toast.info(`Clicked: ${char}`)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="live-spatial">
            <LiveSpatialProjectionMap3D />
          </TabsContent>

          <TabsContent value="agent-presence">
            <AdvancedAgentPresence3D />
          </TabsContent>

          <TabsContent value="context-aware">
            <ContextAwareAgentVisualizer3D />
          </TabsContent>

          <TabsContent value="pathfinding">
            <DynamicPathfindingVisualizer3D />
          </TabsContent>

          <TabsContent value="projection-sim">
            <ProjectionDeviceSimulator3D />
          </TabsContent>

          <TabsContent value="interactive-map">
            <InteractiveSpatialMap3D />
          </TabsContent>

          <TabsContent value="avoidance">
            <EnhancedObstacleAvoidanceVisualizer3D />
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