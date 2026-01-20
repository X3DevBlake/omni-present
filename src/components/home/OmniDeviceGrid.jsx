import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, Zap, Signal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OmniDeviceGrid({ devices }) {
  const deviceInfo = [
    { 
      type: 'holographic_projector', 
      name: 'Holographic Projector', 
      desc: 'Full 3D agent projection with spatial audio',
      icon: Radio,
      gradient: 'from-cyan-500 to-blue-500'
    },
    { 
      type: 'ar_glasses', 
      name: 'AR Glasses', 
      desc: 'Personal agent visibility wherever you go',
      icon: Signal,
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      type: 'smart_tv', 
      name: 'Smart Display', 
      desc: 'Large-scale agent interaction screens',
      icon: Radio,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      type: 'smart_mirror', 
      name: 'Smart Mirror', 
      desc: 'Agents appear beside you in mirrors',
      icon: Signal,
      gradient: 'from-pink-500 to-purple-500'
    },
    { 
      type: 'projection_drone', 
      name: 'Projection Drone', 
      desc: 'Mobile holographic projection following you',
      icon: Zap,
      gradient: 'from-orange-500 to-red-500'
    },
    { 
      type: 'robotic_assistant', 
      name: 'Robotic Platform', 
      desc: 'Agents control physical robot bodies',
      icon: Radio,
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const onlineCount = devices.filter(d => d.online_status).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">Connected Devices</h3>
          <p className="text-slate-400">{onlineCount} online • {devices.length} total</p>
        </div>
        <Badge className="bg-green-500/20 text-green-400 text-sm px-4 py-2">
          <Signal className="w-4 h-4 mr-2" />
          Live
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deviceInfo.map((info, idx) => {
          const Icon = info.icon;
          const deviceCount = devices.filter(d => d.device_type === info.type).length;
          
          return (
            <motion.div
              key={info.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`bg-gradient-to-br ${info.gradient} bg-opacity-10 border-white/10 hover:border-white/30 transition-all`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Icon className="w-8 h-8 text-white" />
                    <Badge className="bg-black/30 text-white text-xs">
                      {deviceCount || 0}
                    </Badge>
                  </div>
                  <h4 className="text-white font-bold mb-1">{info.name}</h4>
                  <p className="text-white/70 text-xs">{info.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}