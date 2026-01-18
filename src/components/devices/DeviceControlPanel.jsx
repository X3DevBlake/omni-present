import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Laptop, Watch, Volume2, Tablet, Server, Power, Wifi, Battery } from 'lucide-react';

const DEVICES = [
  { id: 1, name: 'iPhone Pro', type: 'phone', status: 'online', battery: 87, icon: Smartphone, color: 'from-blue-500 to-cyan-500' },
  { id: 2, name: 'MacBook Pro', type: 'laptop', status: 'online', battery: 95, icon: Laptop, color: 'from-purple-500 to-pink-500' },
  { id: 3, name: 'iPad Air', type: 'tablet', status: 'online', battery: 62, icon: Tablet, color: 'from-cyan-500 to-blue-500' },
  { id: 4, name: 'Apple Watch', type: 'watch', status: 'online', battery: 45, icon: Watch, color: 'from-pink-500 to-rose-500' },
  { id: 5, name: 'HomePod', type: 'speaker', status: 'online', battery: 100, icon: Volume2, color: 'from-amber-500 to-orange-500' },
  { id: 6, name: 'Device Hub', type: 'hub', status: 'online', battery: 100, icon: Server, color: 'from-green-500 to-emerald-500' },
];

export default function DeviceControlPanel() {
  const [selectedDevice, setSelectedDevice] = useState(null);

  return (
    <div className="space-y-6">
      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEVICES.map((device, idx) => {
          const Icon = device.icon;
          const isSelected = selectedDevice?.id === device.id;

          return (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                onClick={() => setSelectedDevice(isSelected ? null : device)}
                className={`cursor-pointer transition-all p-4 ${
                  isSelected
                    ? `bg-gradient-to-br ${device.color} bg-opacity-30 border-white/50`
                    : 'bg-black/40 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-white/80" />
                    <div>
                      <h4 className="text-white font-semibold">{device.name}</h4>
                      <Badge className="bg-green-500/30 text-green-300 text-xs mt-1">Connected</Badge>
                    </div>
                  </div>
                  <Wifi className="w-4 h-4 text-green-400" />
                </div>

                {/* Battery */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Battery</span>
                    <span className="text-white font-semibold">{device.battery}%</span>
                  </div>
                  <div className="bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        device.battery > 70
                          ? 'bg-green-500'
                          : device.battery > 40
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${device.battery}%` }}
                    />
                  </div>
                </div>

                {/* Expanded Controls */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-white/10 space-y-2"
                  >
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      <Power className="w-3 h-3 mr-2" /> Power On/Off
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      <Wifi className="w-3 h-3 mr-2" /> Network Settings
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      <Battery className="w-3 h-3 mr-2" /> View Analytics
                    </Button>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}