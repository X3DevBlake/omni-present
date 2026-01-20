import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Lightbulb, Thermometer, Lock, Cpu, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const deviceIcons = {
  light: Lightbulb,
  thermostat: Thermometer,
  lock: Lock,
  robotic_arm: Cpu,
  appliance: Zap
};

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  queued: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  executing: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export default function DeviceCommandVisualizer3D({ commands, onExecute }) {
  const statusGroups = {
    pending: commands?.filter(c => c.execution_status === 'pending') || [],
    executing: commands?.filter(c => c.execution_status === 'executing') || [],
    completed: commands?.filter(c => c.execution_status === 'completed') || []
  };

  return (
    <div className="space-y-6">
      {/* Command Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={statusColors.pending}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Pending</p>
              <p className="text-2xl font-bold">{statusGroups.pending.length}</p>
            </div>
            <Clock className="w-8 h-8" />
          </CardContent>
        </Card>

        <Card className={statusColors.executing}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Executing</p>
              <p className="text-2xl font-bold">{statusGroups.executing.length}</p>
            </div>
            <Zap className="w-8 h-8 animate-pulse" />
          </CardContent>
        </Card>

        <Card className={statusColors.completed}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Completed</p>
              <p className="text-2xl font-bold">{statusGroups.completed.length}</p>
            </div>
            <CheckCircle className="w-8 h-8" />
          </CardContent>
        </Card>
      </div>

      {/* Command Queue */}
      <div className="space-y-3">
        <h3 className="text-white font-bold text-lg">Command Queue</h3>

        {Object.entries(statusGroups).map(([status, cmds]) =>
          cmds.length > 0 && (
            <div key={status} className="space-y-2">
              <p className="text-slate-400 text-sm capitalize">{status} Commands</p>
              {cmds.map((cmd, idx) => {
                const Icon = deviceIcons[cmd.device_type] || Zap;
                return (
                  <motion.div
                    key={cmd.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-slate-900/60 border-slate-700 hover:border-slate-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <Icon className="w-5 h-5 text-cyan-400 mt-1" />
                            <div className="flex-1">
                              <p className="text-white font-medium">{cmd.device_type}</p>
                              <p className="text-slate-400 text-sm">{cmd.command_type}</p>
                              <p className="text-slate-500 text-xs mt-1">
                                Intent: {cmd.intent_from_agent}
                              </p>
                              {cmd.intent_context?.user_emotion && (
                                <div className="flex gap-2 mt-2">
                                  <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                                    {cmd.intent_context.user_emotion}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={statusColors[status]}>
                              {status}
                            </Badge>
                            {status === 'pending' && onExecute && (
                              <Button
                                size="sm"
                                onClick={() => onExecute(cmd.id)}
                                className="bg-cyan-600 hover:bg-cyan-700 text-xs"
                              >
                                Execute
                              </Button>
                            )}
                          </div>
                        </div>

                        {cmd.execution_result && (
                          <div className="mt-3 pt-3 border-t border-slate-700">
                            <div className="text-xs space-y-1">
                              <p className="text-green-400">✓ Time: {cmd.execution_result.execution_time_ms}ms</p>
                              {cmd.execution_result.actual_values && (
                                <p className="text-slate-400">
                                  Values: {JSON.stringify(cmd.execution_result.actual_values).slice(0, 50)}...
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )
        )}

        {(!commands || commands.length === 0) && (
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-8 text-center">
              <Zap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No device commands yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}