import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Cpu, Zap, Radio, Eye, Lightbulb, Thermometer, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import DeviceBlueprint3D from './DeviceBlueprint3D';

const deviceTypes = [
  { value: 'holographic_projector', label: 'Holographic Projector', icon: Radio },
  { value: 'robotic_arm', label: 'Robotic Arm', icon: Cpu },
  { value: 'smart_light', label: 'Smart Light', icon: Lightbulb },
  { value: 'smart_thermostat', label: 'Smart Thermostat', icon: Thermometer },
  { value: 'smart_lock', label: 'Smart Lock', icon: Lock },
  { value: 'ar_glasses', label: 'AR Glasses', icon: Eye },
  { value: 'projection_drone', label: 'Projection Drone', icon: Radio },
  { value: 'sensor_hub', label: 'Sensor Hub', icon: Zap }
];

export default function DeviceBlueprintGallery({ blueprints = [] }) {
  const queryClient = useQueryClient();
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [selectedComponent, setSelectedComponent] = useState(null);

  const generateBlueprintMutation = useMutation({
    mutationFn: async (deviceType) => {
      const response = await base44.functions.invoke('generate-device-blueprint', {
        device_type: deviceType
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Blueprint "${data.blueprint.blueprint_name}" generated!`);
      queryClient.invalidateQueries(['device-blueprints']);
      setSelectedBlueprint(data.blueprint);
    }
  });

  const handleHotspotClick = (hotspot) => {
    toast.info(`${hotspot.hotspot_name}: ${hotspot.action}`);
  };

  const handleComponentClick = (component) => {
    setSelectedComponent(component);
    toast.info(`Component: ${component.component_name}`);
  };

  return (
    <div className="space-y-6">
      {/* Generator */}
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Device Blueprint Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white flex-1">
                <SelectValue placeholder="Select device type..." />
              </SelectTrigger>
              <SelectContent>
                {deviceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => generateBlueprintMutation.mutate(selectedType)}
              disabled={!selectedType || generateBlueprintMutation.isPending}
              className="bg-gradient-to-r from-cyan-600 to-purple-600"
            >
              {generateBlueprintMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Zap className="w-4 h-4 mr-2" /> Generate Blueprint</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3D Viewer */}
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">3D Blueprint Viewer (Auto-360°)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[500px]">
              <DeviceBlueprint3D
                blueprint={selectedBlueprint || blueprints[0]}
                onHotspotClick={handleHotspotClick}
                onComponentClick={handleComponentClick}
              />
            </div>
          </CardContent>
        </Card>

        {/* Blueprint Details */}
        <div className="space-y-4">
          {selectedBlueprint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-white">{selectedBlueprint.blueprint_name}</CardTitle>
                  <Badge className="w-fit bg-cyan-500/20 text-cyan-400">
                    {selectedBlueprint.device_type}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Dimensions</p>
                    <div className="flex gap-4 text-white text-sm">
                      <span>W: {selectedBlueprint.dimensions?.width_cm}cm</span>
                      <span>H: {selectedBlueprint.dimensions?.height_cm}cm</span>
                      <span>D: {selectedBlueprint.dimensions?.depth_cm}cm</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm mb-2">Components ({selectedBlueprint.components?.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedBlueprint.components?.slice(0, 5).map((comp, idx) => (
                        <Badge key={idx} className="bg-purple-500/20 text-purple-400 text-xs">
                          {comp.component_name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm mb-2">AI Capabilities</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedBlueprint.ai_capabilities?.slice(0, 4).map((cap, idx) => (
                        <Badge key={idx} className="bg-green-500/20 text-green-400 text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedBlueprint.projection_specs?.hologram_capable && (
                    <div className="bg-cyan-500/10 rounded p-3">
                      <p className="text-cyan-400 font-bold text-sm">Hologram Capable</p>
                      <p className="text-white/70 text-xs">
                        {selectedBlueprint.projection_specs.lumens} lumens | {selectedBlueprint.projection_specs.resolution}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Blueprint List */}
          <Card className="bg-slate-900/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Saved Blueprints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {blueprints.map((bp) => {
                  const DeviceIcon = deviceTypes.find(t => t.value === bp.device_type)?.icon || Cpu;
                  return (
                    <div
                      key={bp.id}
                      onClick={() => setSelectedBlueprint(bp)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedBlueprint?.id === bp.id
                          ? 'bg-cyan-500/20 border border-cyan-500/50'
                          : 'bg-slate-800/50 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <DeviceIcon className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-white font-medium text-sm">{bp.blueprint_name}</p>
                          <p className="text-slate-400 text-xs">{bp.device_type}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {blueprints.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4">No blueprints yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Component Detail Modal */}
      {selectedComponent && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Component: {selectedComponent.component_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Type</p>
                <p className="text-white">{selectedComponent.component_type}</p>
              </div>
              <div>
                <p className="text-slate-400">Functionality</p>
                <p className="text-white">{selectedComponent.functionality}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}