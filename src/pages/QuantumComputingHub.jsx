import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tantml:react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Cpu, Activity } from 'lucide-react';
import QuantumCircuit3D from '../components/quantum/QuantumCircuit3D';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function QuantumComputingHub() {
  const queryClient = useQueryClient();
  const [qubitCount, setQubitCount] = useState(4);
  const [optimizationTarget, setOptimizationTarget] = useState('portfolio_optimization');

  const { data: circuits, isLoading } = useQuery({
    queryKey: ['quantum-circuits'],
    queryFn: () => base44.entities.QuantumCircuit.list('-created_date', 10)
  });

  const simulateCircuit = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('simulateQuantumCircuit', {
        qubit_count: qubitCount,
        optimization_target: optimizationTarget
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quantum-circuits'] });
    }
  });

  const latestCircuit = circuits?.[0];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Quantum Computing Hub</h1>
          <p className="text-white/70">Quantum-inspired optimization and computation</p>
        </div>

        <Tabs defaultValue="simulator" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="simulator">Circuit Simulator</TabsTrigger>
            <TabsTrigger value="visualization">3D Visualization</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="simulator" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Quantum Circuit Designer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Number of Qubits</label>
                  <Input
                    type="number"
                    min="2"
                    max="16"
                    value={qubitCount}
                    onChange={(e) => setQubitCount(parseInt(e.target.value))}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="text-white/80 text-sm mb-2 block">Optimization Target</label>
                  <select
                    value={optimizationTarget}
                    onChange={(e) => setOptimizationTarget(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-md px-3 py-2"
                  >
                    <option value="portfolio_optimization">Portfolio Optimization</option>
                    <option value="route_planning">Route Planning</option>
                    <option value="resource_allocation">Resource Allocation</option>
                    <option value="pattern_matching">Pattern Matching</option>
                    <option value="cryptography">Cryptographic Operations</option>
                  </select>
                </div>

                <Button
                  onClick={() => simulateCircuit.mutate()}
                  disabled={simulateCircuit.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {simulateCircuit.isPending ? 'Simulating...' : 'Run Quantum Simulation'}
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">{circuits?.length || 0}</div>
                    <div className="text-white/60 text-sm">Circuits Created</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {latestCircuit?.circuit_depth || 0}
                    </div>
                    <div className="text-white/60 text-sm">Circuit Depth</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {((1 - (latestCircuit?.error_rate || 0.01)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-white/60 text-sm">Fidelity</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="visualization">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardContent className="p-6">
                {latestCircuit ? (
                  <QuantumCircuit3D circuit={latestCircuit} />
                ) : (
                  <div className="text-center py-12 text-white/60">
                    Run a simulation to visualize quantum circuits
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <div className="space-y-4">
              {circuits?.map(circuit => (
                <Card key={circuit.id} className="bg-white/10 border-white/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{circuit.circuit_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-purple-500">{circuit.qubit_count} Qubits</Badge>
                      <Badge className="bg-blue-500">Depth: {circuit.circuit_depth}</Badge>
                      <Badge className="bg-green-500">
                        Error: {(circuit.error_rate * 100).toFixed(2)}%
                      </Badge>
                    </div>

                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-xs mb-1">Optimization Target</div>
                      <div className="text-white">{circuit.optimization_target}</div>
                    </div>

                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-xs mb-1">Quantum Gates</div>
                      <div className="flex flex-wrap gap-1">
                        {circuit.quantum_gates?.slice(0, 10).map((gate, i) => (
                          <Badge key={i} className="bg-cyan-500/30 text-xs">
                            {gate.gate_type}
                          </Badge>
                        ))}
                        {circuit.quantum_gates?.length > 10 && (
                          <Badge className="bg-gray-500/30 text-xs">
                            +{circuit.quantum_gates.length - 10} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!circuits?.length && (
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="text-center py-12">
                    <Activity className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">No quantum circuits yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}