import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, GitBranch, Database, Eye, Play } from 'lucide-react';
import BehaviorTreeVisualizer from '../components/agents/BehaviorTreeVisualizer';
import AgentMemoryManager from '../components/agents/AgentMemoryManager';

export default function AgentDebugger() {
  const [userEmail, setUserEmail] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedDecision, setSelectedDecision] = useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const { data: agents = [] } = useQuery({
    queryKey: ['agents', userEmail],
    queryFn: () => userEmail ? base44.entities.Agent.filter({ user_email: userEmail }) : [],
    enabled: !!userEmail
  });

  const { data: decisions = [] } = useQuery({
    queryKey: ['geminiDecisions', selectedAgent],
    queryFn: () => selectedAgent ? base44.entities.GeminiDecision.filter({ user_email: userEmail }) : [],
    enabled: !!selectedAgent,
    initialData: []
  });

  const { data: behaviorTrees = [] } = useQuery({
    queryKey: ['behaviorTrees', selectedAgent],
    queryFn: () => selectedAgent ? base44.entities.AgentBehaviorTree.filter({ agent_id: selectedAgent }) : [],
    enabled: !!selectedAgent,
    initialData: []
  });

  const { data: memoryStores = [] } = useQuery({
    queryKey: ['memoryStores', selectedAgent],
    queryFn: () => selectedAgent ? base44.entities.AgentMemoryStore.filter({ agent_id: selectedAgent }) : [],
    enabled: !!selectedAgent,
    initialData: []
  });

  const agent = agents.find(a => a.id === selectedAgent);

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Bug className="w-10 h-10 text-red-400" />
            AI Agent Debugger
          </h1>
          <p className="text-white/60">Trace decisions, inspect memory, and visualize behavior</p>
        </motion.div>

        <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-4 mb-6">
          <Select value={selectedAgent || ''} onValueChange={setSelectedAgent}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue placeholder="Select an agent to debug" />
            </SelectTrigger>
            <SelectContent>
              {agents.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {selectedAgent && (
          <Tabs defaultValue="decisions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
              <TabsTrigger value="decisions">
                <Eye className="w-4 h-4 mr-2" />
                Decisions
              </TabsTrigger>
              <TabsTrigger value="behavior">
                <GitBranch className="w-4 h-4 mr-2" />
                Behavior Tree
              </TabsTrigger>
              <TabsTrigger value="memory">
                <Database className="w-4 h-4 mr-2" />
                Memory State
              </TabsTrigger>
              <TabsTrigger value="scenarios">
                <Play className="w-4 h-4 mr-2" />
                Test Scenarios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="decisions">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
                  <h3 className="text-white font-bold mb-4">Decision Timeline</h3>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {decisions.map((decision, idx) => (
                      <motion.div
                        key={decision.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedDecision(decision)}
                        className={`p-3 rounded cursor-pointer transition-all ${
                          selectedDecision?.id === decision.id
                            ? 'bg-purple-500/20 border border-purple-500/30'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-bold text-sm">Decision #{idx + 1}</p>
                          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                            {decision.confidence_score}% confident
                          </span>
                        </div>
                        <p className="text-white/60 text-xs line-clamp-2">{decision.decision_context}</p>
                        <p className="text-white/80 text-xs mt-1">→ {decision.decision_made}</p>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
                  <h3 className="text-white font-bold mb-4">Decision Details</h3>
                  {selectedDecision ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-white/60 text-xs mb-1">Context:</p>
                        <p className="text-white text-sm">{selectedDecision.decision_context}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs mb-1">Decision Made:</p>
                        <p className="text-white font-bold">{selectedDecision.decision_made}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs mb-1">Reasoning:</p>
                        <p className="text-white/80 text-sm">{selectedDecision.reasoning}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs mb-2">Alternatives Considered:</p>
                        <div className="space-y-2">
                          {selectedDecision.alternatives_considered?.map((alt, i) => (
                            <div key={i} className="bg-white/5 rounded p-2">
                              <p className="text-white/80 text-xs">{alt.option}</p>
                              <p className="text-white/60 text-xs">Score: {alt.score}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {selectedDecision.executed && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                          <p className="text-green-400 text-xs font-bold mb-1">Execution Result:</p>
                          <p className="text-white/80 text-xs">
                            {JSON.stringify(selectedDecision.execution_result)}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-white/40">
                      Select a decision to view details
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="behavior">
              <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
                <h3 className="text-white font-bold mb-4">Behavior Tree Visualization</h3>
                {behaviorTrees.length > 0 ? (
                  <BehaviorTreeVisualizer agentId={selectedAgent} />
                ) : (
                  <div className="text-center py-12 text-white/40">
                    No behavior tree defined for this agent
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="memory">
              <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
                <h3 className="text-white font-bold mb-4">Memory State Inspector</h3>
                <AgentMemoryManager agentId={selectedAgent} userEmail={userEmail} />
              </Card>
            </TabsContent>

            <TabsContent value="scenarios">
              <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
                <h3 className="text-white font-bold mb-4">Test Scenarios</h3>
                <TestScenariosPanel agent={agent} />
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {!selectedAgent && (
          <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-12">
            <div className="text-center">
              <Bug className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-white/60">Select an agent to start debugging</p>
            </div>
          </Card>
        )}
      </div>
    </AuroraBackground>
  );
}

function TestScenariosPanel({ agent }) {
  const [scenario, setScenario] = useState('');
  const [result, setResult] = useState(null);

  const runScenario = async () => {
    // Simulate scenario execution
    setResult({
      success: true,
      steps: [
        { step: 1, action: 'Initialize agent', status: 'success' },
        { step: 2, action: 'Process scenario', status: 'success' },
        { step: 3, action: 'Make decision', status: 'success' },
        { step: 4, action: 'Execute action', status: 'success' }
      ],
      output: `Agent ${agent?.name} successfully completed the scenario.`
    });
  };

  return (
    <div className="space-y-4">
      <textarea
        placeholder="Describe a test scenario for the agent..."
        value={scenario}
        onChange={(e) => setScenario(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded p-3 text-white min-h-[120px]"
      />
      <Button
        onClick={runScenario}
        disabled={!scenario}
        className="bg-gradient-to-r from-red-500 to-pink-500"
      >
        <Play className="w-4 h-4 mr-2" />
        Run Scenario
      </Button>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded p-4"
        >
          <p className="text-green-400 font-bold mb-3">Scenario Results:</p>
          <div className="space-y-2">
            {result.steps.map((step) => (
              <div key={step.step} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  step.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <p className="text-white/80 text-sm">
                  Step {step.step}: {step.action}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-black/20 rounded p-3">
            <p className="text-white text-sm">{result.output}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}