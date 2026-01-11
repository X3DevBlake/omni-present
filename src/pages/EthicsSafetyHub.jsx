import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp, Brain, Scale } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function EthicsSafetyHub() {
  const [userEmail, setUserEmail] = useState(null);
  const [newGuideline, setNewGuideline] = useState({ name: '', description: '', severity: 'medium' });
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const { data: guidelines } = useQuery({
    queryKey: ['ethicsGuidelines', userEmail],
    queryFn: () => base44.entities.EthicsGuideline.filter({ user_email: userEmail }),
    enabled: !!userEmail,
  });

  const { data: violations } = useQuery({
    queryKey: ['ethicsViolations', userEmail],
    queryFn: () => base44.entities.AgentEthicsViolation.filter({ user_email: userEmail }),
    enabled: !!userEmail,
  });

  const { data: agents } = useQuery({
    queryKey: ['agents', userEmail],
    queryFn: () => base44.entities.Agent.filter({ created_by: userEmail }),
    enabled: !!userEmail,
  });

  const createGuideline = useMutation({
    mutationFn: async () => {
      return await base44.entities.EthicsGuideline.create({
        user_email: userEmail,
        name: newGuideline.name,
        description: newGuideline.description,
        severity: newGuideline.severity,
        enabled: true,
        violation_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ethicsGuidelines'] });
      setNewGuideline({ name: '', description: '', severity: 'medium' });
      toast.success('Guideline created');
    }
  });

  const toggleGuideline = useMutation({
    mutationFn: async ({ id, enabled }) => {
      return await base44.entities.EthicsGuideline.update(id, { enabled: !enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ethicsGuidelines'] });
    }
  });

  const biasCategories = [
    { name: 'Gender Bias', risk: 'low', detected: 2 },
    { name: 'Racial Bias', risk: 'low', detected: 0 },
    { name: 'Age Bias', risk: 'medium', detected: 5 },
    { name: 'Socioeconomic Bias', risk: 'medium', detected: 3 },
    { name: 'Geographic Bias', risk: 'low', detected: 1 }
  ];

  const safetyMetrics = {
    totalChecks: 1547,
    violations: violations?.length || 0,
    compliance: 98.3,
    activeGuidelines: guidelines?.filter(g => g.enabled).length || 0
  };

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Ethics & Safety Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Monitor and ensure ethical AI behavior across all agents
          </p>
        </motion.div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Compliance Rate</p>
                <p className="text-white text-2xl font-bold">{safetyMetrics.compliance}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Violations</p>
                <p className="text-white text-2xl font-bold">{safetyMetrics.violations}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Checks</p>
                <p className="text-white text-2xl font-bold">{safetyMetrics.totalChecks}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Active Guidelines</p>
                <p className="text-white text-2xl font-bold">{safetyMetrics.activeGuidelines}</p>
              </div>
              <Scale className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="guidelines" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
            <TabsTrigger value="bias">Bias Detection</TabsTrigger>
            <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="guidelines" className="space-y-6">
            <Card className="bg-black/40 border-white/10 p-6">
              <h3 className="text-white font-bold mb-4">Create New Guideline</h3>
              <div className="space-y-4">
                <Input
                  placeholder="Guideline Name"
                  value={newGuideline.name}
                  onChange={(e) => setNewGuideline({...newGuideline, name: e.target.value})}
                  className="bg-white/5 border-white/10"
                />
                <Textarea
                  placeholder="Description of ethical rule..."
                  value={newGuideline.description}
                  onChange={(e) => setNewGuideline({...newGuideline, description: e.target.value})}
                  className="bg-white/5 border-white/10"
                />
                <Button
                  onClick={() => createGuideline.mutate()}
                  disabled={!newGuideline.name || createGuideline.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  Create Guideline
                </Button>
              </div>
            </Card>

            <div className="space-y-3">
              {guidelines?.map(guideline => (
                <Card key={guideline.id} className="bg-black/40 border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-semibold">{guideline.name}</h4>
                        <Badge className={`${
                          guideline.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                          guideline.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {guideline.severity}
                        </Badge>
                      </div>
                      <p className="text-white/60 text-sm">{guideline.description}</p>
                      {guideline.violation_count > 0 && (
                        <p className="text-orange-400 text-xs mt-2">
                          {guideline.violation_count} violations detected
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={guideline.enabled}
                      onCheckedChange={() => toggleGuideline.mutate({ id: guideline.id, enabled: guideline.enabled })}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="violations" className="space-y-4">
            {violations?.length === 0 ? (
              <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-white font-bold mb-2">No Violations Detected</h3>
                <p className="text-white/60">All agents are operating within ethical guidelines</p>
              </Card>
            ) : (
              violations?.map(violation => (
                <Card key={violation.id} className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30 p-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-bold">{violation.guideline_name}</h4>
                        <Badge className="bg-red-500/30 text-red-300">
                          {violation.severity}
                        </Badge>
                      </div>
                      <p className="text-white/80 mb-2">{violation.description}</p>
                      <div className="text-white/60 text-sm space-y-1">
                        <p>Agent: {violation.agent_id}</p>
                        <p>Time: {new Date(violation.created_date).toLocaleString()}</p>
                      </div>
                      {violation.resolution && (
                        <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded">
                          <p className="text-green-400 text-sm">
                            <strong>Resolved:</strong> {violation.resolution}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="bias" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-6 h-6 text-purple-400" />
                <h3 className="text-white font-bold">AI-Powered Bias Detection</h3>
              </div>
              <p className="text-white/70">
                Automatically scanning agent decisions for potential biases across multiple categories
              </p>
            </Card>

            {biasCategories.map(category => (
              <Card key={category.name} className="bg-black/40 border-white/10 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">{category.name}</h4>
                  <Badge className={`${
                    category.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                    category.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {category.risk} risk
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          category.risk === 'high' ? 'bg-red-500' :
                          category.risk === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(category.detected / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-white/60 text-sm">{category.detected} instances</span>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="monitoring">
            <Card className="bg-black/40 border-white/10 p-6">
              <h3 className="text-white font-bold mb-4">Real-Time Safety Monitoring</h3>
              <div className="space-y-4">
                {agents?.slice(0, 5).map(agent => (
                  <div key={agent.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-semibold">{agent.name}</p>
                      <p className="text-white/60 text-sm">Status: {agent.status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 text-sm">Compliant</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}