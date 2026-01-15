import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Code, Activity, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function EnhancedAgentCreator({ onClose }) {
  const [agentData, setAgentData] = useState({
    name: '',
    description: '',
    category: 'finance',
    behaviors: [],
    api_integrations: [],
    self_monitoring: true,
    self_correction: true,
    monitoring_threshold: 80,
  });

  const [newBehavior, setNewBehavior] = useState({ trigger: '', action: '', priority: 'medium' });
  const [newAPI, setNewAPI] = useState({ name: '', endpoint: '', method: 'GET', headers: {} });

  const queryClient = useQueryClient();

  const createAgentMutation = useMutation({
    mutationFn: (data) => base44.entities.Agent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      onClose?.();
    },
  });

  const addBehavior = () => {
    if (newBehavior.trigger && newBehavior.action) {
      setAgentData(prev => ({
        ...prev,
        behaviors: [...prev.behaviors, { ...newBehavior, id: Date.now() }]
      }));
      setNewBehavior({ trigger: '', action: '', priority: 'medium' });
    }
  };

  const removeBehavior = (id) => {
    setAgentData(prev => ({
      ...prev,
      behaviors: prev.behaviors.filter(b => b.id !== id)
    }));
  };

  const addAPIIntegration = () => {
    if (newAPI.name && newAPI.endpoint) {
      setAgentData(prev => ({
        ...prev,
        api_integrations: [...prev.api_integrations, { ...newAPI, id: Date.now() }]
      }));
      setNewAPI({ name: '', endpoint: '', method: 'GET', headers: {} });
    }
  };

  const removeAPIIntegration = (id) => {
    setAgentData(prev => ({
      ...prev,
      api_integrations: prev.api_integrations.filter(a => a.id !== id)
    }));
  };

  const handleCreate = async () => {
    await createAgentMutation.mutateAsync(agentData);
  };

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Code className="w-5 h-5" />
          Create Advanced AI Agent
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="bg-white/5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="behaviors">Behaviors</TabsTrigger>
            <TabsTrigger value="apis">API Integration</TabsTrigger>
            <TabsTrigger value="monitoring">Self-Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div>
              <label className="text-white/80 text-sm mb-2 block">Agent Name</label>
              <Input
                value={agentData.name}
                onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
                placeholder="My Trading Agent"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-white/80 text-sm mb-2 block">Description</label>
              <Textarea
                value={agentData.description}
                onChange={(e) => setAgentData({ ...agentData, description: e.target.value })}
                placeholder="Describe what this agent does..."
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-white/80 text-sm mb-2 block">Category</label>
              <Select value={agentData.category} onValueChange={(val) => setAgentData({ ...agentData, category: val })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="behaviors" className="space-y-4">
            <div className="space-y-2">
              {agentData.behaviors.map((behavior) => (
                <div key={behavior.id} className="bg-white/5 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{behavior.trigger}</p>
                    <p className="text-white/60 text-xs">→ {behavior.action}</p>
                  </div>
                  <Badge className="mr-2">{behavior.priority}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => removeBehavior(behavior.id)}>
                    <X className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="border border-purple-500/30 p-4 rounded-lg space-y-3">
              <Input
                placeholder="Trigger (e.g., Price drops below $100)"
                value={newBehavior.trigger}
                onChange={(e) => setNewBehavior({ ...newBehavior, trigger: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
              <Input
                placeholder="Action (e.g., Send alert and buy)"
                value={newBehavior.action}
                onChange={(e) => setNewBehavior({ ...newBehavior, action: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
              <Select value={newBehavior.priority} onValueChange={(val) => setNewBehavior({ ...newBehavior, priority: val })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addBehavior} className="w-full bg-purple-500 hover:bg-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Behavior
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="apis" className="space-y-4">
            <div className="space-y-2">
              {agentData.api_integrations.map((api) => (
                <div key={api.id} className="bg-white/5 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{api.name}</p>
                    <p className="text-white/60 text-xs">{api.method} {api.endpoint}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeAPIIntegration(api.id)}>
                    <X className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="border border-purple-500/30 p-4 rounded-lg space-y-3">
              <Input
                placeholder="API Name (e.g., CoinGecko)"
                value={newAPI.name}
                onChange={(e) => setNewAPI({ ...newAPI, name: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
              <Input
                placeholder="Endpoint URL"
                value={newAPI.endpoint}
                onChange={(e) => setNewAPI({ ...newAPI, endpoint: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
              <Select value={newAPI.method} onValueChange={(val) => setNewAPI({ ...newAPI, method: val })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addAPIIntegration} className="w-full bg-purple-500 hover:bg-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Add API Integration
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Self-Monitoring
                </p>
                <p className="text-white/60 text-xs">Agent monitors its own performance</p>
              </div>
              <Switch
                checked={agentData.self_monitoring}
                onCheckedChange={(val) => setAgentData({ ...agentData, self_monitoring: val })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Self-Correction
                </p>
                <p className="text-white/60 text-xs">Auto-correct when performance drops</p>
              </div>
              <Switch
                checked={agentData.self_correction}
                onCheckedChange={(val) => setAgentData({ ...agentData, self_correction: val })}
              />
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Performance Threshold (%)</label>
              <Input
                type="number"
                value={agentData.monitoring_threshold}
                onChange={(e) => setAgentData({ ...agentData, monitoring_threshold: parseInt(e.target.value) })}
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-white/40 text-xs mt-1">Trigger corrections below this threshold</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-6">
          <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
          <Button onClick={handleCreate} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
            Create Agent
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}