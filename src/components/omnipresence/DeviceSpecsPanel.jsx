import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, Zap, Eye, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DeviceSpecsPanel({ blueprint }) {
  if (!blueprint) return null;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-white text-lg">Projection Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-xs">Brightness</p>
                <p className="text-white font-bold">{blueprint.projection_specs?.lumens || 0} lumens</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Resolution</p>
                <p className="text-white font-bold">{blueprint.projection_specs?.resolution || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Field of View</p>
                <p className="text-white font-bold">{blueprint.projection_specs?.field_of_view || 0}°</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Hologram</p>
                <Badge className={blueprint.projection_specs?.hologram_capable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                  {blueprint.projection_specs?.hologram_capable ? 'Capable' : 'Not Capable'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              Sensors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {blueprint.sensors?.map((sensor, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm capitalize">{sensor.sensor_type}</span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-cyan-400">Range: {sensor.range_meters}m</span>
                      <span className="text-purple-400">Angle: {sensor.angle_degrees}°</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Power Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Voltage</p>
                <p className="text-white font-bold">{blueprint.power_requirements?.voltage}V</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Wattage</p>
                <p className="text-white font-bold">{blueprint.power_requirements?.wattage}W</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Battery Life</p>
                <p className="text-white font-bold">{blueprint.power_requirements?.battery_life_hours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Radio className="w-5 h-5 text-green-400" />
              Connection Ports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {blueprint.connection_ports?.map((port, idx) => (
                <Badge key={idx} className="bg-green-500/20 text-green-400">
                  {port.port_name} ({port.port_type})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              AI Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {blueprint.ai_capabilities?.map((cap, idx) => (
                <Badge key={idx} className="bg-cyan-500/20 text-cyan-400">
                  {cap}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}