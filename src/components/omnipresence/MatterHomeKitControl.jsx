import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Lightbulb, Thermometer, Lock, Camera, Speaker, 
  Wifi, Loader2, Scan, Play, Home, Zap
} from 'lucide-react';
import { toast } from 'sonner';

const protocolIcons = {
  matter: '🔷',
  homekit: '🏠',
  zigbee: '⚡',
  wifi: '📶',
  thread: '🧵'
};

const categoryIcons = {
  lighting: Lightbulb,
  climate: Thermometer,
  security: Lock,
  entertainment: Speaker,
  sensor: Scan,
  camera: Camera
};

export default function MatterHomeKitControl({ devices = [] }) {
  const queryClient = useQueryClient();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [sceneName, setSceneName] = useState('');

  const discoverMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('matter-homekit-bridge', {
        action: 'discover'
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Discovered ${data.discovered} devices!`);
      queryClient.invalidateQueries(['cross-platform-devices']);
    }
  });

  const controlMutation = useMutation({
    mutationFn: async ({ device_id, command, parameters }) => {
      const response = await base44.functions.invoke('matter-homekit-bridge', {
        action: 'control',
        device_id,
        command,
        parameters
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(['cross-platform-devices']);
    }
  });

  const sceneMutation = useMutation({
    mutationFn: async (scene_name) => {
      const response = await base44.functions.invoke('matter-homekit-bridge', {
        action: 'scene',
        parameters: { scene_name }
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Scene "${data.scene_name}" activated!`);
    }
  });

  const handleQuickControl = (device, command, params = {}) => {
    controlMutation.mutate({ device_id: device.id, command, parameters: params });
  };

  return (
    <div className="space-y-6">
      {/* Discovery & Scenes */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-cyan-400" />
            Matter & HomeKit Bridge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={() => discoverMutation.mutate()}
              disabled={discoverMutation.isPending}
              className="bg-gradient-to-r from-cyan-600 to-blue-600"
            >
              {discoverMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Discovering...</>
              ) : (
                <><Scan className="w-4 h-4 mr-2" /> Discover Devices</>
              )}
            </Button>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={sceneName}
                onChange={(e) => setSceneName(e.target.value)}
                placeholder="Scene name (e.g., Movie Night)"
                className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 text-white text-sm"
              />
              <Button
                onClick={() => sceneMutation.mutate(sceneName)}
                disabled={!sceneName || sceneMutation.isPending}
                variant="outline"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Scene
              </Button>
            </div>
          </div>

          {/* Quick Scenes */}
          <div className="flex flex-wrap gap-2">
            {['Good Morning', 'Movie Night', 'Sleep Mode', 'Away Mode', 'Party'].map((scene) => (
              <Button
                key={scene}
                size="sm"
                variant="outline"
                onClick={() => sceneMutation.mutate(scene)}
                className="bg-slate-800/50"
              >
                {scene}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => {
          const CategoryIcon = categoryIcons[device.device_category] || Zap;
          return (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className={`bg-slate-900/60 border-slate-700 ${
                selectedDevice?.id === device.id ? 'ring-2 ring-cyan-500' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${
                        device.connection_status === 'online' ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        <CategoryIcon className={`w-5 h-5 ${
                          device.connection_status === 'online' ? 'text-green-400' : 'text-red-400'
                        }`} />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{device.device_name}</p>
                        <p className="text-slate-400 text-xs">{device.manufacturer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg">{protocolIcons[device.protocol]}</span>
                      <Badge className={`ml-1 text-xs ${
                        device.connection_status === 'online' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {device.connection_status}
                      </Badge>
                    </div>
                  </div>

                  {/* Device Controls */}
                  {device.device_category === 'lighting' && (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Button
                          size="sm"
                          onClick={() => handleQuickControl(device, 'turn_on')}
                          className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                        >
                          On
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleQuickControl(device, 'turn_off')}
                          variant="outline"
                        >
                          Off
                        </Button>
                      </div>
                      {device.current_state?.brightness !== undefined && (
                        <div>
                          <p className="text-slate-400 text-xs mb-1">Brightness: {device.current_state.brightness}%</p>
                          <Slider
                            value={[device.current_state.brightness]}
                            max={100}
                            step={1}
                            onValueCommit={(v) => handleQuickControl(device, 'set_brightness', { level: v[0] })}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {device.device_category === 'climate' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Current</span>
                        <span className="text-white">{device.current_state?.temperature_current || 72}°F</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Target</span>
                        <span className="text-cyan-400">{device.current_state?.temperature_target || 72}°F</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleQuickControl(device, 'set_temperature', { target: (device.current_state?.temperature_target || 72) - 1 })}
                          variant="outline"
                        >
                          -
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleQuickControl(device, 'set_temperature', { target: (device.current_state?.temperature_target || 72) + 1 })}
                          variant="outline"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  )}

                  {device.device_category === 'security' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleQuickControl(device, 'lock')}
                        className="flex-1 bg-green-500/20 text-green-400"
                      >
                        <Lock className="w-4 h-4 mr-1" /> Lock
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleQuickControl(device, 'unlock')}
                        variant="outline"
                        className="flex-1"
                      >
                        Unlock
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {devices.length === 0 && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardContent className="p-8 text-center">
            <Wifi className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No devices discovered yet</p>
            <p className="text-slate-500 text-sm">Click "Discover Devices" to find Matter and HomeKit devices</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}