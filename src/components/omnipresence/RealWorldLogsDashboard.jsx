import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Mic, Hand, Eye, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const interactionIcons = {
  voice_command: Mic,
  gesture_detection: Hand,
  object_identification: Eye,
  proximity_trigger: Activity,
  visual_response: MessageSquare
};

export default function RealWorldLogsDashboard({ interactions, presences }) {
  const successRate = interactions.filter(i => i.interaction_success).length / Math.max(interactions.length, 1) * 100;
  
  const interactionCounts = interactions.reduce((acc, i) => {
    acc[i.interaction_type] = (acc[i.interaction_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/60 border-slate-700">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs mb-1">Success Rate</p>
            <p className="text-white text-2xl font-bold">{successRate.toFixed(1)}%</p>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-700">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs mb-1">Total Interactions</p>
            <p className="text-white text-2xl font-bold">{interactions.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-700">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs mb-1">Active Agents</p>
            <p className="text-white text-2xl font-bold">{presences.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Interaction Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(interactionCounts).map(([type, count], idx) => {
              const Icon = interactionIcons[type] || Activity;
              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-800/50 rounded-lg p-3 text-center"
                >
                  <Icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-white text-lg font-bold">{count}</p>
                  <p className="text-slate-400 text-xs capitalize">{type.replace('_', ' ')}</p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Interactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {interactions.slice(0, 20).map((interaction, idx) => {
              const Icon = interactionIcons[interaction.interaction_type] || Activity;
              return (
                <motion.div
                  key={interaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-slate-800/50 rounded-lg p-3 flex items-start gap-3"
                >
                  <Icon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white text-sm font-medium capitalize">
                        {interaction.interaction_type.replace('_', ' ')}
                      </p>
                      <Badge className={`${
                        interaction.interaction_success 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      } text-xs`}>
                        {interaction.interaction_success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    {interaction.interaction_data?.transcribed_speech && (
                      <p className="text-slate-400 text-xs mb-1">
                        "{interaction.interaction_data.transcribed_speech.substring(0, 100)}..."
                      </p>
                    )}
                    <p className="text-cyan-400 text-xs">
                      Agent: {interaction.agent_id?.substring(0, 8)} • 
                      Location: {interaction.location_at_interaction?.room || 'Unknown'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}