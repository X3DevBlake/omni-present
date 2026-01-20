import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radio, Zap, MapPin, Signal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DeviceManagementPanel({ devices, onDeploy }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {devices.map((device, idx) => (
        <motion.div
          key={device.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="bg-slate-900/60 border-slate-700 hover:border-cyan-500 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Radio className="w-5 h-5 text-cyan-400" />
                  {device.device_name}
                </CardTitle>
                <Badge className={`${
                  device.online_status 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {device.online_status ? 'Online' : 'Offline'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Type:</span>
                  <span className="text-white">{device.device_type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-white">{device.physical_location?.room || 'Unknown'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Coverage:</span>
                  <span className="text-cyan-400">{device.coverage_area?.radius_meters || 5}m radius</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Projection Quality:</span>
                  <span className="text-purple-400">{device.projection_capability?.max_resolution || 'HD'}</span>
                </div>
              </div>

              {device.sensor_capabilities && (
                <div>
                  <p className="text-slate-400 text-xs mb-2">Sensors:</p>
                  <div className="flex flex-wrap gap-2">
                    {device.sensor_capabilities.map((sensor, idx) => (
                      <Badge key={idx} className="bg-slate-800 text-cyan-400 text-xs">
                        {sensor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => onDeploy?.(device.id)}
                  disabled={!device.online_status}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600"
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Deploy Agent
                </Button>
                <Button variant="outline" size="sm">
                  <Signal className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {devices.length === 0 && (
        <Card className="bg-slate-900/60 border-slate-700 col-span-2">
          <CardContent className="p-8 text-center">
            <Radio className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No Omni Devices Found</p>
            <p className="text-slate-500 text-sm">Connect your holographic projection devices to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}