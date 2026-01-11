import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FlaskConical, Play, Upload, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SandboxEnvironment({ userEmail }) {
  const [simName, setSimName] = useState('');
  const queryClient = useQueryClient();

  const { data: simulations = [] } = useQuery({
    queryKey: ['sandboxSims', userEmail],
    queryFn: () => base44.entities.SandboxSimulation.filter({ user_email: userEmail }).catch(() => [])
  });

  const createSim = useMutation({
    mutationFn: async () => {
      return await base44.entities.SandboxSimulation.create({
        user_email: userEmail,
        simulation_name: simName,
        market_scenario: { volatility: 'high', trend: 'bullish' },
        agent_configurations: [{ name: 'Test Agent', strategy: 'momentum' }],
        resource_constraints: { max_capital: 50000 },
        status: 'setup'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sandboxSims'] });
      setSimName('');
    }
  });

  const runSim = useMutation({
    mutationFn: async (simId) => {
      await base44.entities.SandboxSimulation.update(simId, { status: 'running' });
      setTimeout(async () => {
        await base44.entities.SandboxSimulation.update(simId, {
          status: 'completed',
          performance_metrics: { roi: 15.5, win_rate: 67 },
          optimizations: ['Reduce position sizes', 'Improve stop losses']
        });
        queryClient.invalidateQueries({ queryKey: ['sandboxSims'] });
      }, 2000);
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-6 h-6 text-cyan-400" />
        <h3 className="text-white font-bold text-xl">AI Agent Sandbox</h3>
      </div>

      <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-xl p-4 space-y-3">
        <Input
          placeholder="Simulation name..."
          value={simName}
          onChange={(e) => setSimName(e.target.value)}
          className="bg-white/5 border-white/10"
        />
        <Button onClick={() => createSim.mutate()} disabled={!simName} className="w-full bg-cyan-500">
          Create Sandbox Simulation
        </Button>
      </div>

      <div className="space-y-2">
        {simulations.map((sim, idx) => (
          <motion.div
            key={sim.id || idx}
            className="bg-white/5 border border-white/10 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-white font-bold">{sim.simulation_name}</p>
                <p className="text-white/60 text-xs">{sim.agent_configurations?.length || 0} agents</p>
              </div>
              <div className={`px-2 py-1 rounded text-xs ${
                sim.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                sim.status === 'running' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {sim.status}
              </div>
            </div>

            {sim.status === 'setup' && (
              <Button onClick={() => runSim.mutate(sim.id)} size="sm" className="bg-blue-500">
                <Play className="w-3 h-3 mr-2" />
                Run Simulation
              </Button>
            )}

            {sim.status === 'completed' && (
              <div className="mt-3 space-y-2">
                {sim.performance_metrics && (
                  <div className="bg-green-500/10 rounded p-2 text-xs">
                    <p className="text-green-400 font-bold">ROI: {sim.performance_metrics.roi}%</p>
                  </div>
                )}
                {sim.optimizations && (
                  <div className="bg-blue-500/10 rounded p-2">
                    <p className="text-blue-400 text-xs font-bold mb-1">Optimizations:</p>
                    {sim.optimizations.map((opt, i) => (
                      <p key={i} className="text-white/70 text-xs">• {opt}</p>
                    ))}
                  </div>
                )}
                <Button size="sm" className="bg-green-500">
                  <Upload className="w-3 h-3 mr-2" />
                  Deploy to Production
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}