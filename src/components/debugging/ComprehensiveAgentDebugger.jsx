import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bug, Play, GitBranch, Eye, Brain, Layers, AlertCircle, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ComprehensiveAgentDebugger({ userEmail }) {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');
  const [debugData, setDebugData] = useState(null);

  const { data: agents = [] } = useQuery({
    queryKey: ['agents', userEmail],
    queryFn: () => base44.entities.Agent.list(),
    enabled: !!userEmail
  });

  const { data: behaviorTrees = [] } = useQuery({
    queryKey: ['behavior-trees', selectedAgent],
    queryFn: () => base44.entities.AgentBehaviorTree.list(),
    enabled: !!selectedAgent
  });

  const { data: memoryStores = [] } = useQuery({
    queryKey: ['memory-stores', selectedAgent],
    queryFn: () => base44.entities.AgentMemoryStore.filter({ agent_id: selectedAgent }),
    enabled: !!selectedAgent
  });

  const runDebugMutation = useMutation({
    mutationFn: async ({ agentId, scenario }) => {
      const response = await fetch('/api/functions/gemini-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Debug agent decision-making for scenario: ${scenario}. Analyze the agent's likely behavior, decision path, and reasoning.`,
          context: {
            agent_id: agentId,
            memory_stores: memoryStores,
            behavior_trees: behaviorTrees
          }
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      setDebugData(data);
      toast.success('Debug trace complete!');
    }
  });

  const agent = agents.find(a => a.id === selectedAgent);

  const visualizeDecisionTree = () => {
    if (!behaviorTrees.length) return null;

    const tree = behaviorTrees[0];
    const nodes = tree.nodes || [];

    return (
      <div className="relative h-96 overflow-auto">
        <svg className="w-full h-full">
          {nodes.map((node, idx) => (
            <g key={idx}>
              <circle
                cx={50 + (idx % 5) * 150}
                cy={50 + Math.floor(idx / 5) * 100}
                r="30"
                className={`fill-${node.status === 'success' ? 'green' : node.status === 'failed' ? 'red' : 'blue'}-500/20 stroke-${node.status === 'success' ? 'green' : node.status === 'failed' ? 'red' : 'blue'}-400`}
                strokeWidth="2"
              />
              <text
                x={50 + (idx % 5) * 150}
                y={55 + Math.floor(idx / 5) * 100}
                textAnchor="middle"
                className="text-white text-xs"
              >
                {node.type?.substring(0, 8)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Agent Debugger</h2>
          <p className="text-white/60 text-sm">Trace decisions, inspect memory, visualize behavior</p>
        </div>
      </div>

      {/* Agent & Scenario Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-black/40 border-white/10 p-6">
          <h3 className="text-white font-bold mb-4">Select Agent</h3>
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue placeholder="Choose an agent..." />
            </SelectTrigger>
            <SelectContent>
              {agents.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {agent && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Type:</span>
                <span className="text-white">{agent.agent_type}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Status:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  agent.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {agent.status}
                </span>
              </div>
            </div>
          )}
        </Card>

        <Card className="bg-black/40 border-white/10 p-6">
          <h3 className="text-white font-bold mb-4">Debug Scenario</h3>
          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue placeholder="Choose scenario..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="task_completion">Task Completion Flow</SelectItem>
              <SelectItem value="error_handling">Error Handling</SelectItem>
              <SelectItem value="decision_making">Decision Making Process</SelectItem>
              <SelectItem value="memory_retrieval">Memory Retrieval</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => runDebugMutation.mutate({ agentId: selectedAgent, scenario: selectedScenario })}
            disabled={!selectedAgent || !selectedScenario || runDebugMutation.isPending}
            className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500"
          >
            <Bug className="w-4 h-4 mr-2" />
            {runDebugMutation.isPending ? 'Running Debug...' : 'Run Debug Trace'}
          </Button>
        </Card>
      </div>

      {/* Memory State Inspector */}
      {memoryStores.length > 0 && (
        <Card className="bg-black/40 border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-bold">Memory State</h3>
          </div>
          <div className="space-y-3">
            {memoryStores.slice(0, 5).map((memory, idx) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{memory.memory_type}</span>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {memory.importance || 0.5}
                  </Badge>
                </div>
                <p className="text-white/60 text-sm">{memory.content?.substring(0, 100)}...</p>
                <div className="text-white/40 text-xs mt-2">
                  Created: {new Date(memory.created_date).toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Behavior Tree Visualization */}
      {behaviorTrees.length > 0 && (
        <Card className="bg-black/40 border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-bold">Behavior Tree</h3>
          </div>
          {visualizeDecisionTree()}
        </Card>
      )}

      {/* Debug Results */}
      {debugData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-white font-bold">Debug Trace Results</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-black/20 rounded-lg p-4">
                <h4 className="text-white font-bold mb-2">Decision Path</h4>
                <pre className="text-white/80 text-sm whitespace-pre-wrap">
                  {typeof debugData === 'string' ? debugData : JSON.stringify(debugData, null, 2)}
                </pre>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {!selectedAgent && (
        <Card className="bg-black/40 border-white/10 p-12 text-center">
          <Bug className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">Select an agent to start debugging</p>
        </Card>
      )}
    </div>
  );
}