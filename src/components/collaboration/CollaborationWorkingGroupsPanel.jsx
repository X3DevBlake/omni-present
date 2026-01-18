import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Calendar, Edit2, Trash2 } from 'lucide-react';

export default function CollaborationWorkingGroupsPanel({ groups, selectedGroup, onSelectGroup }) {
  const getHubColor = (hub) => {
    const colors = {
      communications: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      devices: 'bg-green-500/20 text-green-300 border-green-500/30',
      banking: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      ailab: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      simulation: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    };
    return colors[hub] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  };

  return (
    <div className="space-y-4">
      {groups.length === 0 ? (
        <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400">No working groups yet. Create one to start collaborating!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {groups.map((group) => (
            <motion.div key={group.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5 }}>
              <Card
                className={`bg-slate-900/60 border-slate-700 backdrop-blur-xl cursor-pointer transition-all ${
                  selectedGroup?.id === group.id ? 'ring-2 ring-cyan-400 border-cyan-500' : ''
                }`}
                onClick={() => onSelectGroup(group)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-3">
                    <CardTitle className="text-white">{group.group_name}</CardTitle>
                    <Badge className={group.status === 'active' ? 'bg-green-600' : 'bg-slate-600'}>
                      {group.status}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-sm">{group.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Hubs */}
                  <div>
                    <p className="text-slate-300 text-sm font-semibold mb-2">Involved Hubs</p>
                    <div className="flex flex-wrap gap-2">
                      {group.involved_hubs?.map((hub) => (
                        <Badge key={hub} className={`border ${getHubColor(hub)}`}>
                          {hub}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Agents */}
                  <div>
                    <p className="text-slate-300 text-sm font-semibold mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Agents ({group.agent_members?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.agent_members?.slice(0, 3).map((member) => (
                        <Badge key={member.agent_id} variant="outline" className="text-xs">
                          {member.agent_id.substring(0, 8)}...
                        </Badge>
                      ))}
                      {group.agent_members?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{group.agent_members.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 rounded bg-slate-800/50">
                      <p className="text-slate-400 text-xs">Efficiency</p>
                      <p className="text-white font-semibold">{group.collaboration_metrics?.efficiency_score || 0}%</p>
                    </div>
                    <div className="p-2 rounded bg-slate-800/50">
                      <p className="text-slate-400 text-xs">Completed Tasks</p>
                      <p className="text-white font-semibold">{group.collaboration_metrics?.completed_tasks || 0}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}