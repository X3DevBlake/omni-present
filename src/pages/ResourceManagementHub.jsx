import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Cpu, HardDrive, Zap, Activity, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import ResourceUtilization3D from '../components/resources/ResourceUtilization3D';
import { Badge } from '@/components/ui/badge';

export default function ResourceManagementHub() {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [resourceType, setResourceType] = useState('cpu');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('24');

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list(),
  });

  const { data: resources } = useQuery({
    queryKey: ['compute-resources'],
    queryFn: () => base44.entities.ComputeResource.list(),
    refetchInterval: 5000,
  });

  const { data: requests } = useQuery({
    queryKey: ['resource-requests'],
    queryFn: () => base44.entities.ResourceRequest.list('-created_date', 20),
  });

  const requestResource = useMutation({
    mutationFn: async (params) => {
      const response = await base44.functions.invoke('allocateResources', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compute-resources', 'resource-requests'] });
      setAmount('');
    },
  });

  const totalByType = React.useMemo(() => {
    const totals = {};
    resources?.forEach(r => {
      if (!totals[r.resource_type]) {
        totals[r.resource_type] = { allocated: 0, used: 0 };
      }
      totals[r.resource_type].allocated += r.allocated_amount || 0;
      totals[r.resource_type].used += r.used_amount || 0;
    });
    return totals;
  }, [resources]);

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Resource Management Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Monitor, allocate, and trade computational resources
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {['cpu', 'gpu', 'memory', 'storage', 'network'].map((type, i) => {
            const data = totalByType[type] || { allocated: 0, used: 0 };
            const usage = data.allocated > 0 ? (data.used / data.allocated) * 100 : 0;
            
            return (
              <Card key={type} className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
                <Cpu className="w-6 h-6 text-cyan-400 mb-2" />
                <p className="text-white text-2xl font-bold">{usage.toFixed(0)}%</p>
                <p className="text-white/60 text-sm capitalize">{type} Usage</p>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                Request Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">Agent</label>
                <Select value={selectedAgent?.id || ''} onValueChange={(id) => {
                  const agent = agents?.find(a => a.id === id);
                  setSelectedAgent(agent);
                }}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agents?.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white text-sm mb-2 block">Resource Type</label>
                  <Select value={resourceType} onValueChange={setResourceType}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpu">CPU Cores</SelectItem>
                      <SelectItem value="gpu">GPU Units</SelectItem>
                      <SelectItem value="memory">Memory (GB)</SelectItem>
                      <SelectItem value="storage">Storage (GB)</SelectItem>
                      <SelectItem value="network">Network (Mbps)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">Amount</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="e.g., 8"
                  />
                </div>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Duration (hours)</label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <Button
                onClick={() => {
                  if (selectedAgent && amount) {
                    requestResource.mutate({
                      agent_id: selectedAgent.id,
                      resource_type: resourceType,
                      amount_requested: parseFloat(amount),
                      duration_hours: parseFloat(duration),
                    });
                  }
                }}
                disabled={!selectedAgent || !amount || requestResource.isPending}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {requestResource.isPending ? 'Allocating...' : 'Request Resources'}
              </Button>

              {requestResource.data && (
                <div className="bg-green-500/20 border border-green-500/30 rounded p-3">
                  <p className="text-white font-bold mb-1">Resources Allocated</p>
                  <p className="text-white/70 text-sm">
                    {requestResource.data.allocated_amount} units allocated
                  </p>
                  <p className="text-green-400 text-sm">
                    Cost: {requestResource.data.estimated_cost} tokens
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Resource Utilization 3D</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceUtilization3D resources={resources || []} />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Resource Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requests?.map((request, i) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Badge className="mb-1">{request.resource_type}</Badge>
                      <p className="text-white font-medium">
                        {request.amount_requested} units for {request.duration_hours}h
                      </p>
                    </div>
                    <Badge className={`${
                      request.status === 'allocated' ? 'bg-green-500/20 text-green-400' :
                      request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    } border-0`}>
                      {request.status}
                    </Badge>
                  </div>

                  <p className="text-white/60 text-sm">
                    Agent: {request.requester_agent_id?.slice(0, 8)}
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuroraBackground>
  );
}