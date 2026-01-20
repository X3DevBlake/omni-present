import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Zap, MapPin, Navigation, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AgentPhysicalBehaviorStudio({ presences, spatialMaps }) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Active Agent Behaviors</CardTitle>
          <p className="text-slate-400 text-sm">
            Configure how agents move and interact in physical space
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {presences.slice(0, 5).map((presence, idx) => (
            <motion.div
              key={presence.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-800/50 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-white font-medium text-sm">Agent {presence.agent_id?.substring(0, 8)}</p>
                    <p className="text-slate-400 text-xs">{presence.current_activity}</p>
                  </div>
                </div>
                <Badge className={`${
                  presence.projection_status === 'active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {presence.projection_status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-slate-400 text-xs">Location</p>
                    <p className="text-white text-xs">{presence.current_location?.room || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="text-slate-400 text-xs">Waypoints</p>
                    <p className="text-white text-xs">{presence.movement_path?.length || 0}</p>
                  </div>
                </div>
              </div>

              {presence.movement_path && presence.movement_path.length > 0 && (
                <div>
                  <p className="text-slate-400 text-xs mb-2">Movement Path:</p>
                  <div className="flex flex-wrap gap-2">
                    {presence.movement_path.slice(0, 3).map((path, pathIdx) => (
                      <Badge key={pathIdx} className="bg-slate-700 text-cyan-400 text-xs">
                        ({path.waypoint?.x?.toFixed(1)}, {path.waypoint?.z?.toFixed(1)})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Set new coordinates (x, y, z)"
                  className="bg-slate-900 border-slate-700 text-white text-xs"
                />
                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                  <Navigation className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}

          {presences.length === 0 && (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No active agent projections</p>
              <p className="text-slate-500 text-sm">Deploy an agent to configure behaviors</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Spatial Zones</CardTitle>
          <p className="text-slate-400 text-sm">
            Define interaction and restriction zones
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {spatialMaps[0]?.designated_zones?.map((zone, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm">{zone.zone_name}</p>
                  <Badge className={`${
                    zone.zone_type === 'safe' 
                      ? 'bg-green-500/20 text-green-400' 
                      : zone.zone_type === 'no_go'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {zone.zone_type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}