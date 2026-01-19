import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';
import EthicsDashboard3D from '../components/ethics/EthicsDashboard3D';

export default function AIEthicsHub() {
  const queryClient = useQueryClient();
  const [testOutput, setTestOutput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);

  const { data: guidelines } = useQuery({
    queryKey: ['ethical-guidelines'],
    queryFn: () => base44.entities.EthicalGuideline.filter({ is_active: true }),
  });

  const { data: violations } = useQuery({
    queryKey: ['safety-violations'],
    queryFn: () => base44.entities.SafetyViolation.list('-created_date', 20),
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list(),
  });

  const testBias = useMutation({
    mutationFn: async ({ agentId, output }) => {
      const response = await base44.functions.invoke('detectBias', {
        agent_id: agentId,
        output_text: output,
      });
      return response.data;
    },
  });

  const explainDecision = useMutation({
    mutationFn: async (params) => {
      const response = await base44.functions.invoke('explainDecision', params);
      return response.data;
    },
  });

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              AI Ethics & Safety Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Monitor bias, enforce guidelines, and ensure responsible AI behavior
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <Shield className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-2xl font-bold">{guidelines?.length || 0}</p>
            <p className="text-white/60 text-sm">Active Guidelines</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
            <AlertTriangle className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-white text-2xl font-bold">
              {violations?.filter(v => v.resolution_status === 'open').length || 0}
            </p>
            <p className="text-white/60 text-sm">Open Violations</p>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
            <CheckCircle className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-white text-2xl font-bold">98.5%</p>
            <p className="text-white/60 text-sm">Compliance Rate</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
            <Eye className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white text-2xl font-bold">{violations?.length || 0}</p>
            <p className="text-white/60 text-sm">Total Audits</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Bias Detection Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">Select Agent</label>
                <select
                  value={selectedAgent?.id || ''}
                  onChange={(e) => {
                    const agent = agents?.find(a => a.id === e.target.value);
                    setSelectedAgent(agent);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                >
                  <option value="">Choose agent...</option>
                  {agents?.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Test Output</label>
                <Textarea
                  placeholder="Enter agent output to test for bias..."
                  value={testOutput}
                  onChange={(e) => setTestOutput(e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-32"
                />
              </div>

              <Button
                onClick={() => {
                  if (selectedAgent && testOutput) {
                    testBias.mutate({ agentId: selectedAgent.id, output: testOutput });
                  }
                }}
                disabled={!selectedAgent || !testOutput || testBias.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {testBias.isPending ? 'Analyzing...' : 'Analyze for Bias'}
              </Button>

              {testBias.data && (
                <div className={`rounded-lg p-4 border ${
                  testBias.data.is_safe 
                    ? 'bg-green-500/20 border-green-500/30' 
                    : 'bg-red-500/20 border-red-500/30'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-bold">Analysis Results</h4>
                    <Badge className={testBias.data.is_safe ? 'bg-green-500' : 'bg-red-500'}>
                      {testBias.data.safety_rating}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-white/60 text-xs">Bias Score</div>
                      <div className="text-white font-bold">{testBias.data.bias_score.toFixed(0)}/100</div>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-white/60 text-xs">Harmful Content</div>
                      <div className="text-white font-bold">{testBias.data.harmful_content_score.toFixed(0)}/100</div>
                    </div>
                  </div>

                  {testBias.data.concerns?.length > 0 && (
                    <div className="mb-3">
                      <div className="text-white/60 text-xs mb-1">Concerns:</div>
                      {testBias.data.concerns.map((concern, i) => (
                        <div key={i} className="text-white/80 text-sm">• {concern}</div>
                      ))}
                    </div>
                  )}

                  {testBias.data.suggested_correction && (
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-xs mb-1">Suggested Correction:</div>
                      <p className="text-white text-sm">{testBias.data.suggested_correction}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Ethics Monitoring 3D</CardTitle>
            </CardHeader>
            <CardContent>
              <EthicsDashboard3D violations={violations || []} />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Safety Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {violations?.map((violation, i) => (
                <motion.div
                  key={violation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-lg p-4 border ${
                    violation.severity === 'critical' ? 'bg-red-500/20 border-red-500/30' :
                    violation.severity === 'high' ? 'bg-orange-500/20 border-orange-500/30' :
                    'bg-yellow-500/20 border-yellow-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge>{violation.violation_type}</Badge>
                    <Badge className={`${
                      violation.severity === 'critical' ? 'bg-red-500' :
                      violation.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                    } text-white border-0`}>
                      {violation.severity}
                    </Badge>
                  </div>

                  <p className="text-white/80 text-sm mb-2">Agent: {violation.agent_id?.slice(0, 8)}</p>
                  
                  {violation.detected_output && (
                    <div className="bg-black/30 rounded p-2 mb-2">
                      <div className="text-white/60 text-xs mb-1">Detected Output:</div>
                      <p className="text-white/80 text-sm">{violation.detected_output}</p>
                    </div>
                  )}

                  {violation.corrected_output && (
                    <div className="bg-green-500/20 rounded p-2">
                      <div className="text-green-400 text-xs mb-1">Corrected:</div>
                      <p className="text-white/80 text-sm">{violation.corrected_output}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuroraBackground>
  );
}