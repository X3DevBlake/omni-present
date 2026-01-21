import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  Projector, Brain, Thermometer, Activity, Zap, Eye, 
  Layers, Play, Pause, RefreshCw, Settings2, Loader2 
} from 'lucide-react';

export default function ProjectionControlPanel() {
  const queryClient = useQueryClient();
  
  const [projectionSettings, setProjectionSettings] = useState({
    showThoughtBubbles: true,
    showSensorOverlays: true,
    showTaskProgress: true,
    thoughtBubbleDuration: 5,
    sensorUpdateFrequency: 2000,
    animationIntensity: 0.7
  });

  const [selectedLayers, setSelectedLayers] = useState(['thoughts', 'sensors', 'tasks']);

  const { data: devices = [] } = useQuery({
    queryKey: ['projection-devices'],
    queryFn: () => base44.entities.OmniDevice.filter({ device_type: 'holographic_projector' }),
    initialData: []
  });

  const { data: thoughts = [] } = useQuery({
    queryKey: ['control-thoughts'],
    queryFn: () => base44.entities.AgentThoughtProcess.list('-timestamp', 20),
    initialData: []
  });

  const { data: sensors = [] } = useQuery({
    queryKey: ['control-sensors'],
    queryFn: () => base44.entities.SensorData.list('-reading_timestamp', 30),
    initialData: []
  });

  const { data: taskPlans = [] } = useQuery({
    queryKey: ['control-task-plans'],
    queryFn: () => base44.entities.AutonomousTaskPlan.list('-created_at', 10),
    initialData: []
  });

  const updateProjectionMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('dynamic-projection-content', {
        include_thought_bubbles: projectionSettings.showThoughtBubbles,
        include_sensor_overlays: projectionSettings.showSensorOverlays,
        include_task_progress: projectionSettings.showTaskProgress
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Updated ${data.projection_commands?.length || 0} projection devices`);
    }
  });

  const triggerAnimationMutation = useMutation({
    mutationFn: async (animationType) => {
      // Trigger specific animation on devices
      for (const device of devices) {
        await base44.entities.OmniDevice.update(device.id, {
          current_state: {
            ...device.current_state,
            animation_type: animationType,
            animation_triggered_at: new Date().toISOString()
          }
        });
      }
      return { animationType, deviceCount: devices.length };
    },
    onSuccess: (data) => {
      toast.success(`Triggered ${data.animationType} animation on ${data.deviceCount} devices`);
    }
  });

  const toggleLayer = (layer) => {
    setSelectedLayers(prev => 
      prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]
    );
  };

  const sensorTypes = [...new Set(sensors.map(s => s.sensor_type))];
  const thoughtTypes = [...new Set(thoughts.map(t => t.thought_type))];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Projector className="w-5 h-5 text-indigo-400" />
            Projection Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <Projector className="w-5 h-5 mx-auto text-indigo-400 mb-1" />
              <p className="text-white font-bold">{devices.length}</p>
              <p className="text-slate-400 text-xs">Projectors</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <Brain className="w-5 h-5 mx-auto text-purple-400 mb-1" />
              <p className="text-white font-bold">{thoughts.length}</p>
              <p className="text-slate-400 text-xs">Thoughts</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <Thermometer className="w-5 h-5 mx-auto text-cyan-400 mb-1" />
              <p className="text-white font-bold">{sensors.length}</p>
              <p className="text-slate-400 text-xs">Sensors</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <Activity className="w-5 h-5 mx-auto text-green-400 mb-1" />
              <p className="text-white font-bold">{taskPlans.filter(t => t.plan_status === 'executing').length}</p>
              <p className="text-slate-400 text-xs">Active Tasks</p>
            </div>
          </div>

          {/* Layer Controls */}
          <div className="space-y-3">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Layers className="w-4 h-4" /> Projection Layers
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'thoughts', label: 'Thought Bubbles', icon: Brain, color: 'purple' },
                { id: 'sensors', label: 'Sensor Overlays', icon: Thermometer, color: 'cyan' },
                { id: 'tasks', label: 'Task Progress', icon: Activity, color: 'green' }
              ].map(layer => (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedLayers.includes(layer.id)
                      ? `border-${layer.color}-500 bg-${layer.color}-500/20`
                      : 'border-slate-600 bg-slate-800/50'
                  }`}
                >
                  <layer.icon className={`w-5 h-5 mx-auto mb-1 ${selectedLayers.includes(layer.id) ? `text-${layer.color}-400` : 'text-slate-400'}`} />
                  <p className={`text-xs ${selectedLayers.includes(layer.id) ? 'text-white' : 'text-slate-400'}`}>{layer.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Settings Toggles */}
          <div className="space-y-3">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> Display Settings
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Show Thought Bubbles</span>
                <Switch
                  checked={projectionSettings.showThoughtBubbles}
                  onCheckedChange={(checked) => setProjectionSettings(prev => ({ ...prev, showThoughtBubbles: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Show Sensor Overlays</span>
                <Switch
                  checked={projectionSettings.showSensorOverlays}
                  onCheckedChange={(checked) => setProjectionSettings(prev => ({ ...prev, showSensorOverlays: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Show Task Progress</span>
                <Switch
                  checked={projectionSettings.showTaskProgress}
                  onCheckedChange={(checked) => setProjectionSettings(prev => ({ ...prev, showTaskProgress: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Thought Bubble Duration</span>
                <span className="text-cyan-400 text-sm">{projectionSettings.thoughtBubbleDuration}s</span>
              </div>
              <Slider
                value={[projectionSettings.thoughtBubbleDuration]}
                onValueChange={([val]) => setProjectionSettings(prev => ({ ...prev, thoughtBubbleDuration: val }))}
                min={2}
                max={15}
                step={1}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Animation Intensity</span>
                <span className="text-cyan-400 text-sm">{(projectionSettings.animationIntensity * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[projectionSettings.animationIntensity * 100]}
                onValueChange={([val]) => setProjectionSettings(prev => ({ ...prev, animationIntensity: val / 100 }))}
                min={10}
                max={100}
                step={5}
              />
            </div>
          </div>

          {/* Animation Triggers */}
          <div className="space-y-3">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" /> Trigger Animations
            </h3>
            <div className="flex flex-wrap gap-2">
              {['pulse', 'wave', 'glow', 'rotate', 'bounce', 'fade'].map(anim => (
                <Button
                  key={anim}
                  size="sm"
                  variant="outline"
                  onClick={() => triggerAnimationMutation.mutate(anim)}
                  disabled={triggerAnimationMutation.isPending}
                >
                  {anim}
                </Button>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <Button
            onClick={() => updateProjectionMutation.mutate()}
            disabled={updateProjectionMutation.isPending}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            {updateProjectionMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating Projections</>
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" /> Update All Projections</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Sensor Type Filters */}
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Active Sensor Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sensorTypes.map(type => (
              <Badge key={type} className="bg-cyan-500/20 text-cyan-400">
                {type}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Thought Types */}
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Active Thought Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {thoughtTypes.map(type => (
              <Badge key={type} className="bg-purple-500/20 text-purple-400">
                {type}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}