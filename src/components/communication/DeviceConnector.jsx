import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, Monitor, Smartphone, Tablet, MapPin, Activity } from 'lucide-react';

export default function DeviceConnector({ userEmail }) {
  const [currentDevice, setCurrentDevice] = useState(null);
  const queryClient = useQueryClient();

  const { data: devices } = useQuery({
    queryKey: ['devices', userEmail],
    queryFn: () => base44.entities.DeviceConnection.filter({ user_email: userEmail }),
    initialData: []
  });

  const detectDevice = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/detect-device-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (!response.ok) throw new Error('Failed to detect device');
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentDevice(data);
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    }
  });

  useEffect(() => {
    detectDevice.mutate();
  }, []);

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'phone': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      case 'computer': return <Monitor className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <Wifi className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Connected Devices</h3>
          <p className="text-white/60 text-sm">AI-enabled device management</p>
        </div>
      </div>

      {currentDevice && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              {getDeviceIcon(currentDevice.deviceType)}
            </div>
            <div>
              <p className="text-white font-bold">Current Device</p>
              <p className="text-white/60 text-xs">{currentDevice.deviceInfo?.os} - {currentDevice.deviceInfo?.browser}</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/60">IP Address:</span>
              <span className="text-white">{currentDevice.ip}</span>
            </div>
            {currentDevice.location && (
              <div className="flex justify-between items-center">
                <span className="text-white/60">Location:</span>
                <div className="flex items-center gap-1 text-white">
                  <MapPin className="w-3 h-3" />
                  <span>{currentDevice.location.city}, {currentDevice.location.country_name}</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        <h4 className="text-white font-bold text-sm">All Devices ({devices.length})</h4>
        {devices.slice(0, 5).map((device) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                {getDeviceIcon(device.device_type)}
              </div>
              <div>
                <p className="text-white text-sm font-bold">{device.device_name}</p>
                <p className="text-white/40 text-xs">{device.ip_address}</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs ${
              device.connection_status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {device.connection_status}
            </span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}