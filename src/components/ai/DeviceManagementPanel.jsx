import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Monitor, Play, CheckCircle } from 'lucide-react';

export default function DeviceManagementPanel({ userEmail }) {
  const [policyName, setPolicyName] = useState('');
  const [trigger, setTrigger] = useState('idle_timeout');
  const [action, setAction] = useState('disconnect');
  const queryClient = useQueryClient();

  const { data: policies } = useQuery({
    queryKey: ['devicePolicies', userEmail],
    queryFn: () => base44.entities.DeviceManagementPolicy.filter({ user_email: userEmail }),
    initialData: []
  });

  const createPolicy = useMutation({
    mutationFn: async () => {
      return await base44.entities.DeviceManagementPolicy.create({
        user_email: userEmail,
        policy_name: policyName,
        trigger_condition: trigger,
        action: action,
        threshold: { minutes: 30 },
        autonomous: true,
        active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devicePolicies'] });
      setPolicyName('');
    }
  });

  const runManager = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/autonomous-device-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!response.ok) throw new Error('Failed');
      return response.json();
    }
  });

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Monitor className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Autonomous Device Manager</h3>
          <p className="text-white/60 text-sm">AI-powered device control policies</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Input
            placeholder="Policy name..."
            value={policyName}
            onChange={(e) => setPolicyName(e.target.value)}
            className="bg-white/5 border-white/10"
          />
          <Select value={trigger} onValueChange={setTrigger}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="idle_timeout">Idle Timeout</SelectItem>
              <SelectItem value="connection_lost">Connection Lost</SelectItem>
              <SelectItem value="high_usage">High Usage</SelectItem>
            </SelectContent>
          </Select>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="disconnect">Disconnect</SelectItem>
              <SelectItem value="reboot">Reboot</SelectItem>
              <SelectItem value="notify">Notify</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => createPolicy.mutate()}
          disabled={!policyName || createPolicy.isPending}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
        >
          Create Policy
        </Button>

        <Button
          onClick={() => runManager.mutate()}
          disabled={runManager.isPending}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
        >
          <Play className="w-4 h-4 mr-2" />
          Run Device Manager
        </Button>

        {runManager.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/30 rounded-lg p-3"
          >
            <CheckCircle className="w-4 h-4 text-green-400 mb-2" />
            <p className="text-white text-sm">
              Scanned {runManager.data.devicesScanned} devices, executed {runManager.data.actionsExecuted} actions
            </p>
          </motion.div>
        )}

        <div className="space-y-2">
          <h4 className="text-white font-bold text-sm">Active Policies ({policies.length})</h4>
          {policies.slice(0, 5).map((policy) => (
            <div key={policy.id} className="bg-white/5 rounded p-2">
              <p className="text-white text-sm font-bold">{policy.policy_name}</p>
              <p className="text-white/60 text-xs">
                {policy.trigger_condition} → {policy.action}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}