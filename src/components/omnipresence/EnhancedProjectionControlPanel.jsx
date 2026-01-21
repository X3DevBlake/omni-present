import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  Projector, Brain, Thermometer, Activity, Zap, Eye, 
  Layers, Play, Pause, RefreshCw, Settings2, Loader2,
  Palette, Filter, Volume2, Sparkles, Sun, Wind
} from 'lucide-react';

export default function EnhancedProjectionControlPanel() {
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState({
    thoughts: { enabled: true, duration: 5, opacity: 0.9, selectedTypes: ['planning', 'reasoning', 'collaboration'] },
    sensors: { enabled: true, showValues: true, colorCoded: true, alertsOnly: false },
    tasks: { enabled: true, showProgress: true, progressColor: '#10b981', showSteps: true },
    animations: { intensity: 0.7, speed: 1, particleCount: 100 }
  });

  const [selectedThoughtTypes, setSelectedThoughtTypes] = useState(['planning', 'reasoning', 'collaboration', 'decision']);

  const { data: devices = [] } = useQuery({
    queryKey: ['enhanced-projection-devices'],
    queryFn: () => base44.entities.OmniDevice.list('-created_date', 20),
    initialData: []
  });

  const { data: thoughts = [] } = useQuery({
    queryKey: ['enhanced-thoughts'],
    queryFn: () => base44.entities.AgentThoughtProcess.list('-timestamp', 30),
    initialData: [],
    refetchInterval: 2000
  });

  const { data: sensors = [] } = useQuery({
    queryKey: ['enhanced-sensors'],
    queryFn: () => base44.entities.SensorData.list('-reading_timestamp', 50),
    initialData: [],
    refetchInterval: 3000
  });

  const { data: taskPlans = [] } = useQuery({
    queryKey: ['enhanced-task-plans'],
    queryFn: () => base44.entities.AutonomousTaskPlan.list('-created_at', 15),
    initialData: []
  });

  const updateProjectionMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('dynamic-projection-content', {
        include_thought_bubbles: settings.thoughts.enabled,
        thought_types: selectedThoughtTypes,
        thought_duration: settings.thoughts.duration,
        include_sensor_overlays: settings.sensors.enabled,
        sensor_alerts_only: settings.sensors.alertsOnly,
        include_task_progress: settings.tasks.enabled,
        animation_intensity: settings.animations.intensity
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Projection updated on ${data.projection_commands?.length || devices.length} devices`);
      queryClient.invalidateQueries(['enhanced-projection-devices']);
    }
  });

  const triggerAnimationMutation = useMutation({
    mutationFn: async ({ animationType, targetDevices }) => {
      for (const device of targetDevices || devices) {
        await base44.entities.OmniDevice.update(device.id, {
          current_state: {
            ...device.current_state,
            animation_type: animationType,
            animation_intensity: settings.animations.intensity,
            animation_triggered_at: new Date().toISOString()
          }
        });
      }
      return { animationType, count: (targetDevices || devices).length };
    },
    onSuccess: (data) => {
      toast.success(`${data.animationType} animation triggered on ${data.count} devices`);
    }
  });

  const thoughtTypes = ['planning', 'reasoning', 'collaboration', 'decision', 'observation', 'prediction', 'learning'];
  const sensorTypes = [...new Set(sensors.map(s => s.sensor_type))];
  const projectors = devices.filter(d => d.device_type === 'holographic_projector');

  const toggleThoughtType = (type) => {
    setSelectedThoughtTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const progressColors = [
    { value: '#10b981', label: 'Green' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#a855f7', label: 'Purple' },
    { value: '#f59e0b', label: 'Amber' },
    { value: '#ec4899', label: 'Pink' }
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Projector className="w-5 h-5 text-violet-400" />
            Enhanced Projection Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <Projector className="w-5 h-5 mx-auto text-violet-400 mb-1" />
              <p className="text-white font-bold">{projectors.length}</p>
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

          <Tabs defaultValue="thoughts" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="thoughts"><Brain className="w-4 h-4 mr-1" /> Thoughts</TabsTrigger>
              <TabsTrigger value="sensors"><Thermometer className="w-4 h-4 mr-1" /> Sensors</TabsTrigger>
              <TabsTrigger value="tasks"><Activity className="w-4 h-4 mr-1" /> Tasks</TabsTrigger>
              <TabsTrigger value="animations"><Sparkles className="w-4 h-4 mr-1" /> Animations</TabsTrigger>
            </TabsList>

            <TabsContent value="thoughts" className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Enable Thought Bubbles</span>
                <Switch
                  checked={settings.thoughts.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, thoughts: { ...prev.thoughts, enabled: checked }}))}
                />
              </div>

              <div>
                <p className="text-slate-300 text-sm mb-2">Select Thought Types to Display</p>
                <div className="flex flex-wrap gap-2">
                  {thoughtTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => toggleThoughtType(type)}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${
                        selectedThoughtTypes.includes(type)
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300 text-sm">Display Duration</span>
                  <span className="text-purple-400">{settings.thoughts.duration}s</span>
                </div>
                <Slider
                  value={[settings.thoughts.duration]}
                  onValueChange={([val]) => setSettings(prev => ({ ...prev, thoughts: { ...prev.thoughts, duration: val }}))}
                  min={2}
                  max={15}
                  step={1}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300 text-sm">Bubble Opacity</span>
                  <span className="text-purple-400">{(settings.thoughts.opacity * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={[settings.thoughts.opacity * 100]}
                  onValueChange={([val]) => setSettings(prev => ({ ...prev, thoughts: { ...prev.thoughts, opacity: val / 100 }}))}
                  min={30}
                  max={100}
                  step={5}
                />
              </div>
            </TabsContent>

            <TabsContent value="sensors" className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Enable Sensor Overlays</span>
                <Switch
                  checked={settings.sensors.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sensors: { ...prev.sensors, enabled: checked }}))}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Show Reading Values</span>
                <Switch
                  checked={settings.sensors.showValues}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sensors: { ...prev.sensors, showValues: checked }}))}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Color-Coded by Type</span>
                <Switch
                  checked={settings.sensors.colorCoded}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sensors: { ...prev.sensors, colorCoded: checked }}))}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Show Alerts Only</span>
                <Switch
                  checked={settings.sensors.alertsOnly}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sensors: { ...prev.sensors, alertsOnly: checked }}))}
                />
              </div>

              <div>
                <p className="text-slate-300 text-sm mb-2">Active Sensor Types</p>
                <div className="flex flex-wrap gap-2">
                  {sensorTypes.map(type => (
                    <Badge key={type} className="bg-cyan-500/20 text-cyan-400">{type}</Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Show Task Progress</span>
                <Switch
                  checked={settings.tasks.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, tasks: { ...prev.tasks, enabled: checked }}))}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Show Progress Bar</span>
                <Switch
                  checked={settings.tasks.showProgress}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, tasks: { ...prev.tasks, showProgress: checked }}))}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Show Sub-Steps</span>
                <Switch
                  checked={settings.tasks.showSteps}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, tasks: { ...prev.tasks, showSteps: checked }}))}
                />
              </div>

              <div>
                <p className="text-slate-300 text-sm mb-2">Progress Bar Color</p>
                <div className="flex gap-2">
                  {progressColors.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setSettings(prev => ({ ...prev, tasks: { ...prev.tasks, progressColor: c.value }}))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        settings.tasks.progressColor === c.value ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="animations" className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300 text-sm">Animation Intensity</span>
                  <span className="text-fuchsia-400">{(settings.animations.intensity * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={[settings.animations.intensity * 100]}
                  onValueChange={([val]) => setSettings(prev => ({ ...prev, animations: { ...prev.animations, intensity: val / 100 }}))}
                  min={10}
                  max={100}
                  step={5}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300 text-sm">Animation Speed</span>
                  <span className="text-fuchsia-400">{settings.animations.speed}x</span>
                </div>
                <Slider
                  value={[settings.animations.speed * 50]}
                  onValueChange={([val]) => setSettings(prev => ({ ...prev, animations: { ...prev.animations, speed: val / 50 }}))}
                  min={25}
                  max={100}
                  step={5}
                />
              </div>

              <div>
                <p className="text-slate-300 text-sm mb-3">Quick Animations</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'pulse', icon: '💫', label: 'Pulse' },
                    { id: 'wave', icon: '🌊', label: 'Wave' },
                    { id: 'glow', icon: '✨', label: 'Glow' },
                    { id: 'rotate', icon: '🔄', label: 'Rotate' },
                    { id: 'bounce', icon: '⬆️', label: 'Bounce' },
                    { id: 'fade', icon: '🌫️', label: 'Fade' },
                    { id: 'explode', icon: '💥', label: 'Explode' },
                    { id: 'spiral', icon: '🌀', label: 'Spiral' },
                    { id: 'shimmer', icon: '🌟', label: 'Shimmer' }
                  ].map(anim => (
                    <Button
                      key={anim.id}
                      size="sm"
                      variant="outline"
                      onClick={() => triggerAnimationMutation.mutate({ animationType: anim.id })}
                      disabled={triggerAnimationMutation.isPending}
                      className="flex-col h-14"
                    >
                      <span className="text-lg">{anim.icon}</span>
                      <span className="text-xs">{anim.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            onClick={() => updateProjectionMutation.mutate()}
            disabled={updateProjectionMutation.isPending}
            className="w-full mt-6 bg-gradient-to-r from-violet-600 to-fuchsia-600"
          >
            {updateProjectionMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating Projections</>
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" /> Apply All Settings</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}